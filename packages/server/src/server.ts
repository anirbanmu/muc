import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import { compress } from 'hono/compress';

import { secureHeaders } from 'hono/secure-headers';
import path from 'path';

type Variables = {
  requestId: string;
};
import {
  BackendMediaService,
  SpotifyClient,
  SpotifyClientInterface,
  YoutubeClient,
  YoutubeClientInterface,
  ItunesClient,
  DeezerClient,
  CachedSpotifyClient,
  CachedYoutubeClient,
  CachedItunesClient,
  CachedDeezerClient,
  ConcurrencyLimitedSpotifyClient,
  ConcurrencyLimitedYoutubeClient,
  ConcurrencyLimitedDeezerClient,
  ConcurrencyLimitedItunesClient,
} from '@muc/common';
import { TimedSpotifyClient, TimedYoutubeClient, TimedDeezerClient, TimedItunesClient } from './timedClient.js';
import { AsyncLocalStorage } from 'async_hooks';
import { ApiRouter } from './apiRouter.js';
import NodeCache from 'node-cache';
import supportsColor from 'supports-color';

// Map of time windows -> Map of IPs -> request count
const rateLimitWindows = new Map<number, Map<string, number>>();

function isRateLimited(ip: string): boolean {
  const windowKey = Math.floor(Date.now() / (15 * 60 * 1000));

  let currentWindow = rateLimitWindows.get(windowKey);
  if (!currentWindow) {
    currentWindow = new Map();
    rateLimitWindows.set(windowKey, currentWindow);
  }

  const count = currentWindow.get(ip) || 0;
  if (count >= 100) return true;

  currentWindow.set(ip, count + 1);

  // Cleanup old windows (keep only current and previous)
  for (const [key] of rateLimitWindows) {
    if (key < windowKey - 1) {
      rateLimitWindows.delete(key);
    }
  }

  return false;
}

const colorSupported = supportsColor.stdout;
const appPrefix = colorSupported ? '\x1b[32m[APP]\x1b[0m' : '[APP]';
const errorPrefix = colorSupported ? '\x1b[31m[ERR]\x1b[0m' : '[ERR]';

function logApp(...args: unknown[]) {
  originalConsoleLog(timestampPrefix() + appPrefix, ...args);
}
function logError(...args: unknown[]) {
  originalConsoleError(timestampPrefix() + errorPrefix, ...args);
}

interface ServerConfig {
  readonly port: number;
  readonly spotifyClientId?: string;
  readonly spotifyClientSecret?: string;
  readonly youtubeApiKey?: string;
  readonly clientDistPath: string;
  readonly nodeEnv: 'development' | 'production' | 'test';
}

const config: ServerConfig = {
  port: Number(process.env.PORT) || 3000,
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  youtubeApiKey: process.env.YOUTUBE_API_KEY,
  clientDistPath: process.env.CLIENT_DIST_PATH || path.resolve(__dirname, '../../client/dist'),
  nodeEnv: (process.env.NODE_ENV as ServerConfig['nodeEnv']) || 'development',
};

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Timestamp helper - only enabled in development
const getTimestamp = config.nodeEnv === 'development' ? () => new Date().toISOString() : () => '';

const timestampPrefix = config.nodeEnv === 'development' ? () => `[${getTimestamp()}] ` : () => '';

console.log = (...args: unknown[]) => {
  originalConsoleLog(timestampPrefix() + appPrefix, ...args);
};
console.error = (...args: unknown[]) => {
  originalConsoleError(timestampPrefix() + errorPrefix, ...args);
};

async function start(): Promise<void> {
  const app = new Hono<{ Variables: Variables }>();

  // Request context for timing logs
  const requestContext = new AsyncLocalStorage<{ requestId: string }>();
  const getCurrentRequestId = () => requestContext.getStore()?.requestId || '';

  // Add request ID to all API routes FIRST
  app.use('/api/*', async (c, next) => {
    const requestId = Math.random().toString(36).substring(2, 8);
    c.set('requestId', requestId);

    // Set up AsyncLocalStorage context for timing logs
    await requestContext.run({ requestId }, async () => {
      await next();
    });
  });

  // Custom logger that includes request IDs for API routes
  app.use('*', async (c, next) => {
    const start = Date.now();
    const method = c.req.method;
    const path = c.req.path;
    const requestId = c.get('requestId');

    const requestPrefix = colorSupported ? '\x1b[36m[REQ]\x1b[0m ' : '[REQ] ';
    const idSuffix = requestId ? ` [${requestId}]` : '';
    originalConsoleLog(`${timestampPrefix()}${requestPrefix}<-- ${method} ${path}${idSuffix}`);

    await next();

    const ms = Date.now() - start;
    const status = c.res.status;
    originalConsoleLog(`${timestampPrefix()}${requestPrefix}--> ${method} ${path} ${status} ${ms}ms${idSuffix}`);
  });

  app.use('*', async (c, next) => {
    if (config.nodeEnv === 'production' && c.req.header('x-forwarded-proto') === 'http') {
      const host = c.req.header('host');
      if (!host) {
        return c.json({ message: 'Host header missing' }, 400);
      }
      const httpsUrl = `https://${host}${c.req.url}`;
      return c.redirect(httpsUrl, 301);
    }
    await next();
  });

  app.use(
    '*',
    secureHeaders({
      contentSecurityPolicy: {
        scriptSrc: ["'self'"],
      },
    }),
  );

  app.use('*', compress());
  if (config.nodeEnv === 'development') {
    logApp('Development mode: Enabling CORS for Vite dev server');
    app.use(
      '*',
      cors({
        origin: ['http://localhost:5173', 'https://localhost:5173', 'http://127.0.0.1:5173', 'https://127.0.0.1:5173'],
      }),
    );
  } else {
    logApp('Production mode: CORS disabled (same-origin deployment)');
  }

  // Rate limiting for API routes
  app.use('/api/*', async (c, next) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';

    if (isRateLimited(ip)) {
      return c.json(
        {
          message: 'Too many requests from this IP, please try again after 15 minutes.',
        },
        429,
      );
    }

    await next();
  });

  app.use('/api/*', async (c, next) => {
    if (c.req.method === 'POST' && c.req.header('content-type') !== 'application/json') {
      return c.json(
        {
          message: 'Content-Type must be application/json for POST requests to this endpoint.',
        },
        415,
      );
    }
    await next();
  });

  const mediaServicePromise = (async (): Promise<BackendMediaService> => {
    if (!config.spotifyClientId || !config.spotifyClientSecret) {
      console.warn('Spotify API credentials not fully configured. Spotify features might be unavailable.');
    }
    if (!config.youtubeApiKey) {
      console.warn('YouTube API key not configured. YouTube features might be unavailable.');
    }

    const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600, useClones: false });

    let spotifyClient: SpotifyClientInterface | undefined;
    if (config.spotifyClientId && config.spotifyClientSecret) {
      const rawSpotifyClient = await SpotifyClient.create({
        clientId: config.spotifyClientId,
        clientSecret: config.spotifyClientSecret,
      });
      const timedSpotifyClient = new TimedSpotifyClient(rawSpotifyClient, getCurrentRequestId);
      const limitedSpotifyClient = new ConcurrencyLimitedSpotifyClient(timedSpotifyClient, 10);
      spotifyClient = new CachedSpotifyClient(limitedSpotifyClient, cache);
    }

    let youtubeClient: YoutubeClientInterface | undefined;
    if (config.youtubeApiKey) {
      const rawYoutubeClient = new YoutubeClient(config.youtubeApiKey);
      const timedYoutubeClient = new TimedYoutubeClient(rawYoutubeClient, getCurrentRequestId);
      const limitedYoutubeClient = new ConcurrencyLimitedYoutubeClient(timedYoutubeClient, 10);
      youtubeClient = new CachedYoutubeClient(limitedYoutubeClient, cache);
    }

    // iTunes client with timing, rate limiting, then caching
    const rawItunesClient = new ItunesClient();
    const timedItunesClient = new TimedItunesClient(rawItunesClient, getCurrentRequestId);
    const limitedItunesClient = new ConcurrencyLimitedItunesClient(timedItunesClient, 10);
    const itunesClient = new CachedItunesClient(limitedItunesClient, cache);

    // Deezer client with timing, rate limiting, then caching
    const rawDeezerClient = new DeezerClient();
    const timedDeezerClient = new TimedDeezerClient(rawDeezerClient, getCurrentRequestId);
    const limitedDeezerClient = new ConcurrencyLimitedDeezerClient(timedDeezerClient, 10);
    const deezerClient = new CachedDeezerClient(limitedDeezerClient, cache);

    return BackendMediaService.createWithClients(deezerClient, itunesClient, spotifyClient, youtubeClient);
  })();

  app.get('/health', c => {
    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  const apiRouter = new ApiRouter(mediaServicePromise);
  app.route('/api', apiRouter.getRouter());
  app.use(
    '/*',
    serveStatic({
      root: config.clientDistPath,
      index: 'index.html',
    }),
  );

  app.get(
    '*',
    serveStatic({
      path: path.join(config.clientDistPath, 'index.html'),
    }),
  );

  app.onError((err, c) => {
    logError('Unhandled server error:', err instanceof Error ? err.message : err);
    return c.json(
      {
        message: 'An unexpected internal server error occurred.',
      },
      500,
    );
  });

  const server = serve({
    fetch: app.fetch,
    port: config.port,
  });

  logApp(`Server running on http://localhost:${config.port}`);
  logApp(`Environment: ${config.nodeEnv}`);
  logApp(`Serving client assets from: ${config.clientDistPath}`);
  logApp(`Node.js version: ${process.version}`);

  if (
    config.nodeEnv !== 'production' &&
    (!config.spotifyClientId || !config.spotifyClientSecret || !config.youtubeApiKey)
  ) {
    logError('\n--- WARNING: API credentials unconfigured ---');
    logError(
      '  Some media service features (Spotify, YouTube) may be unavailable until you configure the following environment variables:',
    );
    logError('  SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, YOUTUBE_API_KEY');
    logError('  You can set these in a `.env` file in the `packages/server` directory.');
    logError('--------------------------------------------\n');
  }

  // graceful shutdown handling for Docker containers
  const gracefulShutdown = (signal: string) => {
    logApp(`Received ${signal}, shutting down gracefully...`);
    server.close(() => {
      logApp('Server closed. Exiting process.');
      process.exit(0);
    });

    // force close after 10 seconds
    setTimeout(() => {
      logError('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  // listen for termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

start().catch(error => {
  logError('Error starting server:', error instanceof Error ? error.message : error);
  process.exit(1);
});
