FROM node:22-bookworm-slim AS base

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

FROM base AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Prisma requires a URL to load its config; generation does not connect to it.
RUN DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build npx prisma generate

ARG VITE_APP_URL=http://localhost:3000
RUN npm run build

FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

COPY --from=build /app/.output ./.output
RUN mkdir -p .data/uploads && chown -R node:node .data

USER node

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
