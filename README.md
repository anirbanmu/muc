# MUC
### Music URL Converter
A simple application to take in a URL from various music streaming services & show the same track (when available) from other streaming services.

### Steps to run
- Clone the repo
- Make sure you have [Node](https://nodejs.org/en/download/package-manager/) & [yarn](https://yarnpkg.com/lang/en/docs/install) installed
- `yarn install`
- `yarn build` (builds Vue.js frontend)
- `yarn express` (starts trivial express server to template the page)

### Frontend
Most of the application code is client side which is a Vue.js app


### Backend
The backend consists of a very trivial express server thats sole purpose is to get some initial server side data & template the single page Vue.js app so it can then run independently from the backend.
