# MUC
### Music URL Converter
A simple application to take in a URL from various music streaming services & show the same track (when available) from other streaming services. You can see a live demo @ https://muc-app.herokuapp.com/?queries[]=spotify:track:2HYr8LZRlJKEfMbIgT0365

#### Query params

- `queries[]=spotify:track:2HYr8LZRlJKEfMbIgT0365` - array type query param (can have multiple) that can be passed as the initial queries to the app.

#### Supported services

It currently supports Spotify, YouTube, iTunes/Apple Music & Deezer.

### Setup

- Make sure you have [Node](https://nodejs.org/en/download/package-manager/) & [yarn](https://yarnpkg.com/lang/en/docs/install) installed
- Clone the repo
- `cd` into repo directory
- `yarn install`

#### Frontend

The front end must be built & ready to go before the backend can successfully serve the app.

For development (will build, watch for changes & rebuild Vue.js frontend):

    yarn build-watch

For production (will build only):

    yarn build

Built files are placed in the `./dist` directory.

#### Backend

The backend requires API keys to be set so that the respective APIs can be used.

    SPOTIFY_CLIENT_ID=<spotify client ID> [REQUIRED]
    SPOTIFY_CLIENT_SECRET=<spotify client secret> [REQUIRED]
    YOUTUBE_API_KEY=<youtube API key> [REQUIRED]
    GOOGLE_SITE_VERIFICATION_CODE=<google site verification code via meta tag> [OPTIONAL]

After having set the environment variables, you can start the backend server locally with:

    yarn express

You should now be able to access the application locally @ http://localhost:8081

#### Heroku

The application is ready to be deployed on Heroku. Just create a Heroku application using [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) & push to the Heroku remote.

### Details
#### Frontend
Most of the application code is client side which is a Vue.js app. This handles all rendering, parsing of URLs, & converting them to other services.

#### Backend
The backend consists of a very trivial express server thats sole purpose is to get some initial server side data (API tokens) & template the single page Vue.js app so it can then run independently from the backend. It also serves an API to get the API tokens by themselves without so that the frontend can refresh it's tokens periodically.
