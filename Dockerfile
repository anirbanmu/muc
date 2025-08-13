# required environment variables:
#   SPOTIFY_CLIENT_ID     - Spotify API client ID
#   SPOTIFY_CLIENT_SECRET - Spotify API client secret
#   YOUTUBE_API_KEY       - YouTube Data API key
#
# optional environment variables:
#   PORT                 - Server port (default: 3000)
#   NODE_ENV             - Environment mode (default: production)
#   CORS_ALLOWED_ORIGIN  - Comma-separated allowed origins for CORS
#   CLIENT_DIST_PATH     - Path to client files (default: /app/client)

# ----------------------------------------------------------------------------------------------------------------
# build stage
FROM node:24-slim AS builder
RUN npm install -g npm
WORKDIR /app

# copy package files
COPY package*.json ./
COPY packages/cli/package*.json ./packages/cli/
COPY packages/client/package*.json ./packages/client/
COPY packages/common/package*.json ./packages/common/
COPY packages/server/package*.json ./packages/server/

# install all dependencies
RUN npm ci --ignore-scripts

# actual source
COPY packages/ ./packages/
COPY eslint.config.ts ./

RUN npm run build

# ----------------------------------------------------------------------------------------------------------------
# production image
FROM gcr.io/distroless/nodejs24-debian12 AS runner

WORKDIR /app

# only the built bundles
COPY --from=builder /app/packages/server/dist ./server/
COPY --from=builder /app/packages/client/dist ./client/

ENV NODE_ENV=production
ENV PORT=3000
ENV CLIENT_DIST_PATH=/app/client

EXPOSE 3000

CMD ["server/server.bundle.cjs"]
