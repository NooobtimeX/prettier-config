# ─── Stage 1: Dependencies ──────────────────────────────────────────────────
FROM oven/bun:1-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# ─── Stage 2: Build ──────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run build

# ─── Stage 3: Runtime ────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy standalone output and static files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ARG PORT=2000
ENV PORT=${PORT}
ENV HOSTNAME="0.0.0.0"
EXPOSE ${PORT}

CMD ["bun", "server.js"]
