# MUC
### Music URL Converter
A simple application to take in a URL from various music streaming services & show the same track (when available) from other streaming services.

### Steps to run
- Clone the repo
- Make sure you have [Node](https://nodejs.org/en/download/package-manager/) & [yarn](https://yarnpkg.com/lang/en/docs/install) installed
- `yarn install`

#### Frontend

`yarn build` (builds Vue.js frontend)

#### Backend

The backend requires API keys to be set so that the respective APIs can be used. The following are needed:

    SPOTIFY_CLIENT_ID=<spotify client ID>
    SPOTIFY_CLIENT_SECRET=<spotify client secret>
    YOUTUBE_API_KEY=<youtube API key>

After having set the environment variables, you can start the backend server locally with:

    yarn express

You should now be able to access the application locally @ http://localhost:8081

### Frontend
Most of the application code is client side which is a Vue.js app

### Backend
The backend consists of a very trivial express server thats sole purpose is to get some initial server side data & template the single page Vue.js app so it can then run independently from the backend.
