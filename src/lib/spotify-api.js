'use strict';

const axios = require('axios');
const qs = require('qs');

const SPOTIFY_AUTHORIZATION_URI = 'https://accounts.spotify.com/api/token';
const SPOTIFY_BASE_URI = 'https://api.spotify.com/v1';
const SPOTIFY_SEARCH_URI = SPOTIFY_BASE_URI + '/search';

export default class SpotifyApi {
  constructor(apiToken) {
    this.apiToken = apiToken;
  }

  headers() {
    return { Authorization: 'Bearer ' + this.apiToken };
  }

  async getUriDetails(uri) {
    const parsed = SpotifyApi._parseIdAndType(uri);
    const apiUri = SPOTIFY_BASE_URI + '/' + parsed[1] + 's/' + parsed[2];
    return axios.request({ url: apiUri, headers: this.headers() }).then(r => {
      return {
        name: r.data.name,
        artistName: r.data.artists.length > 0 ? r.data.artists[0].name : null
      }
    });
  }

  async search(query) {
    const params = { q: query.artistName + ' ' + query.name, type: 'track', limit: 1 };
    return axios.request({ url: SPOTIFY_SEARCH_URI, headers: this.headers(), params: params}).then(r => {
      const found = r.data.tracks.total > 0 ? r.data.tracks.items[0] : null;
      return found;
    });
  }

  static _parseIdAndType(uri) {
    const re = /(track|album)[:|\/]([0-9A-Za-z=]+)/;
    const parsed = re.exec(uri);
    if (parsed === null) {
      throw new Error('bad URI');
    }
    return parsed;
  }

  static getToken(clientId, clientSecret) {
    const base64Buffer = new Buffer(clientId + ':' + clientSecret);
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: 'Basic ' + base64Buffer.toString('base64') };
    const params = { grant_type: 'client_credentials' };
    return axios.post(SPOTIFY_AUTHORIZATION_URI, qs.stringify(params), { headers: headers }).then(r => r.data.access_token);
  }
}
