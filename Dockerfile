FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/bot/package.json ./packages/bot/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter bot

# Copy bot source + prisma schema
COPY packages/bot/ ./packages/bot/

# Generate Prisma client + compile TypeScript
RUN pnpm --filter bot exec prisma generate
RUN pnpm --filter bot exec tsc

# ---- Runtime ----
FROM node:20-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Copy built output and dependencies
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/bot/dist ./dist
COPY --from=build /app/packages/bot/node_modules ./packages/bot/node_modules
COPY --from=build /app/packages/bot/prisma ./prisma

# Copy Prisma generated client (prisma generate puts it in packages/bot/node_modules/.prisma)
COPY --from=build /app/packages/bot/node_modules/.prisma ./node_modules/.prisma

# Make prisma CLI accessible on PATH (pnpm stores it deep in .pnpm)
RUN printf '#!/bin/sh\nexec /app/node_modules/.pnpm/prisma@*/node_modules/prisma/node_modules/.bin/prisma "$@"\n' > /usr/local/bin/prisma && \
    chmod +x /usr/local/bin/prisma

RUN chown -R appuser:appgroup /app
USER appuser

ENV NODE_ENV=production
ENV PORT=8080
ENV NODE_PATH=/app/packages/bot/node_modules

EXPOSE 8080

CMD ["node", "dist/index.js"]
