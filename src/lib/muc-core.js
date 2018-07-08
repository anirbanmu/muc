'use strict';

const SpotifyApi = require('./spotify-api');

class MucCore {
  constructor(apiTokens) {
    this.spotifyApi = new SpotifyApi(apiTokens.spotify);
  }

  async getUriMatches(uri) {
    const uriData = await this.getUriData(uri);
    return this.getMatches(uriData);
  }

  async getUriData(uri) {
    const lower = uri.toLowerCase();
    if (lower.includes('spotify')) {
      return this.spotifyApi.getUriDetails(uri);
    }
  }

  async getMatches(searchData) {
    const searchRequests = [
      {
        type: 'spotify',
        promise: this.spotifyApi.search(searchData)
      }
    ];

    const promises = Promise.all(searchRequests.map(s => s.promise));
    return promises.then(results => {
      let final = [];
      results.forEach((r, i) => {
        if (r !== null) {
          final.push({ type: searchRequests[i].type, item: r });
        }
      });
      return final;
    });
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
