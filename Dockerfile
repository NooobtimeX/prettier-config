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
RUN apt-get update && apt-get install -y nodejs && rm -rf /var/lib/apt/lists/*

COPY --from=installer /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

# ─── Stage 3: Runtime ────────────────────────────────────────────────────────
# Node, not Bun: the Next standalone server leaks RSS under Bun's Node-compat HTTP
# layer (oven-sh/bun#27514 — buffers are freed by GC but never returned to the OS).
# Bun still installs + builds above; only serving runs on Node.
FROM node:24-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# `output: 'standalone'` (next.config.ts) emits server.js plus only the traced
# node_modules. It does NOT copy these two, so they're copied explicitly or every
# asset 404s.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# server.js reads process.env.PORT at startup — Railway injects it, so never pin it.
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
