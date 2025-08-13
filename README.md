# 🎵 muc - Music URI Converter

[![Checks](https://github.com/anirbanmu/muc/actions/workflows/checks.yml/badge.svg)](https://github.com/anirbanmu/muc/actions/workflows/checks.yml)

Paste a Spotify, YouTube, or other music link and get the same song on all platforms. Share music with anyone regardless
of their preferred streaming service.

## What it does

- **End the platform wars**: No more "I don't use that app" responses
- **Universal peace**: Share music without starting arguments about streaming services
- **Save friendships**: Because losing friends over Spotify vs Apple Music is just silly

## 🚀 Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Configure API keys** in `.env`:

   ```bash
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   YOUTUBE_API_KEY=your_youtube_api_key
   ```

3. **Build and start**:
   ```bash
   npm run all:start
   ```

Visit `http://localhost:3000` to use the app.

## 🛠️ Development

**Main commands:**

- `npm run all:start` - Build everything and start server
- `npm run build` - Build all packages
- `npm run test` - Run tests
- `npm run lint` - Lint all code

**Development workflow:**

```bash
# Start client dev server (after building common)
npm run build:common
npm run dev --workspace=@muc/client

# Start server in another terminal
npm run build && npm run start
```

## 🏗️ Architecture

**npm workspaces monorepo** with shared code architecture:

- **common/** - Core business logic shared between client and server
  - Platform API clients (Spotify, YouTube, Deezer, iTunes)
  - Normalized track types and data models
  - Media service abstractions
  - API route definitions and request/response types
- **server/** - Express API that imports media services from common
  - Thin API layer over common's BackendMediaService
  - Caching and rate limiting
- **client/** - Vue 3 frontend that imports types and utilities from common
  - Uses common's ClientMediaService and API client
  - Shares track identifiers and normalized data types
- **cli/** - Command-line tools

The common package enables type safety and code reuse - both client and server work with the same data structures and
business logic, just with different service implementations (backend vs API client).

## API

Endpoints at `/api/`:

- `POST /api/spotify/search` - Search Spotify
- `POST /api/youtube/search` - Search YouTube
- `POST /api/spotify/track` - Get track details
- `POST /api/youtube/video` - Get video details

## 🚢 Deployment

**Docker:**

```bash
docker build -t muc .
docker run -p 3000:3000 --env-file .env muc
```

**Fly.io:**

```bash
fly secrets set SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=xxx YOUTUBE_API_KEY=xxx
fly deploy
```

## 🔧 Tech Stack

**Frontend:** Vue 3, Vite, Pinia (state management), Vitest (testing)

**Backend:** Express.js, Node.js 22, NodeCache (in-memory caching)

**Shared:** TypeScript, ESBuild (bundling), npm workspaces

**Deployment:** Docker, Fly.io

**Dev Tools:** ESLint, Prettier, Morgan (logging), p-limit (concurrency)

_Way overengineered for what is essentially a "find song on other apps" button, but hey, I had fun building it_ 🤓

## 📚 History

This is a complete rewrite of the [original MUC](https://github.com/anirbanmu/muc/tree/vue2) which was built with Vue 2
and vanilla JavaScript. The original version is fully unmaintained but lives on in the `vue2` branch for posterity.

**Why rewrite?** Because apparently a simple Vue 2 app wasn't enterprise-grade enough. But more seriously, updating
dependencies became a chore with figuring out which libraries I can upgrade while still being on Vue 2.
