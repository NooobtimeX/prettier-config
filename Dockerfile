# Build context: repo root
# docker build -f Dockerfile .
#
# Bun installs and builds; Node serves. See the runtime stage for why.
# ─── Stage 1: Install ────────────────────────────────────────────────────────
FROM oven/bun:1-slim AS installer
WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

# ─── Stage 2: Build ──────────────────────────────────────────────────────────
FROM oven/bun:1-slim AS builder
WORKDIR /app

# `next build` spawns Node worker processes (page/route compilation, static
# generation), so the build stage needs a `node` binary even though Bun drives it.
# Debian's own `nodejs` package is Node 20 — two majors behind the runner — so lift
# the real Node 26 binary out of the official image instead. Both this base and
# node:26-slim are Debian trixie, so the glibc matches; `libatomic1` is the only
# shared library the Bun slim image is missing. Keep the two Debian releases in step
# if either tag moves.
RUN apt-get update \
	&& apt-get install -y --no-install-recommends libatomic1 \
	&& rm -rf /var/lib/apt/lists/*
COPY --from=node:26-slim /usr/local/bin/node /usr/local/bin/node

COPY --from=installer /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

# ─── Stage 3: Runtime ────────────────────────────────────────────────────────
# Node, not Bun: the Next standalone server leaks RSS under Bun's Node-compat HTTP
# layer (oven-sh/bun#27514 — buffers are freed by GC but never returned to the OS).
# Bun still installs + builds above; only serving runs on Node.
FROM node:26-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Measured in this image, 800 requests after a full 63-route crawl:
#   no tuning ............... 97.3 MiB
#   + NODE_OPTIONS only ..... 92.8 MiB
#   + MALLOC_ARENA_MAX=2 .... 81.8 MiB
# MALLOC_ARENA_MAX does most of the work: the growth here is native allocator
# retention, not V8 old space, and glibc's default of 8×cores worth of per-thread
# arenas never hands those pages back. Capping the heap is a distant second — at
# 64 MB it changed almost nothing and still didn't OOM — so treat --max-old-space
# as a runaway guard rather than an optimization, and raise it first if the deploy
# ever crash-loops.
ENV NODE_OPTIONS="--max-old-space-size=256 --max-semi-space-size=8"
ENV MALLOC_ARENA_MAX=2

# `output: 'standalone'` (next.config.ts) emits server.js plus only the traced
# node_modules. It does NOT copy these two, so they're copied explicitly or every
# asset 404s.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# server.js reads process.env.PORT at startup — Railway injects it, so never pin it.
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
