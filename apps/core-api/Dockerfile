FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies layer
FROM base AS deps
COPY package.json ./
COPY apps/core-api/package.json ./apps/core-api/
COPY packages/types/package.json ./packages/types/
RUN npm install --workspace=apps/core-api

# Build layer
FROM deps AS builder
COPY packages/types ./packages/types
COPY apps/core-api ./apps/core-api
WORKDIR /app/apps/core-api
RUN npx prisma generate
RUN npm run build

# Runtime layer
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/core-api/dist ./dist
COPY --from=builder /app/apps/core-api/node_modules ./node_modules
COPY --from=builder /app/apps/core-api/prisma ./prisma
EXPOSE 4000
CMD ["node", "dist/server.js"]
