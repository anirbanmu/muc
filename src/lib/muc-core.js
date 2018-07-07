'use strict';

const SpotifyApi = require('./spotify-api');

class MucCore {
  constructor(apiTokens) {
  }

  static generateApiTokens() {
    return SpotifyApi.getToken(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET).then(token => {
      return { spotify: token };
    });
  }
}

module.exports = MucCore;
