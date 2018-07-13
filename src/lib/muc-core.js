'use strict';

import SpotifyApi from './spotify-api';

export default class MucCore {
  constructor(apiTokens) {
    this.spotifyApi = new SpotifyApi(apiTokens.spotify);
  }

  async getUriMatches(uri) {
    const uriData = await this.getUriData(uri);
    const query = this.buildQueryData(uriData);
    return this.getMatches(query);
  }

  async getUriData(uri) {
    const lower = uri.toLowerCase();
    if (lower.includes('spotify')) {
      const spotifyData = await this.spotifyApi.getUriDetails(uri);
      return { data: spotifyData, type: 'spotify' };
    }
    else {
      throw new Error('bad URI');
    }
  }

  buildQueryData(uriData) {
    switch(uriData.type) {
      case 'spotify':
        const artist = uriData.data.artists.length > 0 ? uriData.data.artists[0].name + ' ' : null;
        return artist + uriData.data.name;
    }
  }

  async getMatches(searchData) {
    const searchRequests = [
      {
        type: 'spotify',
        promise: this.spotifyApi.search(searchData).catch(e => null)
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
