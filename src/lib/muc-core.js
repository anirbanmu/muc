'use strict';

const SpotifyApi = require('./spotify-api');

class MucCore {
  constructor(apiTokens) {
  }

  static generateApiTokens() {
    const tokenRequests = [
      {
        type: 'spotify',
        promise: SpotifyApi.getToken(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET)
      }
    ];

    const promises = Promise.all(tokenRequests.map(t => t.promise));
    return promises.then(tokens => {
      let tokenMap = {};
      tokens.forEach((t, i) => {
        tokenMap[tokenRequests[i].type] = t;
      });
      return tokenMap;
    });
  }
}

module.exports = MucCore;
