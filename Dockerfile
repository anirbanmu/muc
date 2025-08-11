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
# base image
FROM node:22-alpine AS base-node
RUN npm install -g npm

# ----------------------------------------------------------------------------------------------------------------
# build stage
FROM base-node AS builder
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
# production image - ultra minimal with just node
FROM base-node AS runner
RUN npm install -g npm

# Install tini for proper signal handling in containers
RUN apk add --no-cache tini

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# only the built bundles
COPY --from=builder --chown=nodejs:nodejs /app/packages/server/dist ./server/
COPY --from=builder --chown=nodejs:nodejs /app/packages/client/dist ./client/

ENV NODE_ENV=production
ENV PORT=3000
ENV CLIENT_DIST_PATH=/app/client

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use tini as init system for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server/server.bundle.cjs"]
