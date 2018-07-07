'use strict';

const axios = require('axios');
const qs = require('qs');

const SPOTIFY_AUTHORIZATION_URI = 'https://accounts.spotify.com/api/token';

class SpotifyApi {
  constructor(apiToken) {
  }

  static getToken(clientId, clientSecret) {
    const base64Buffer = new Buffer(clientId + ':' + clientSecret);
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: 'Basic ' + base64Buffer.toString('base64') };
    const params = { grant_type: 'client_credentials' };
    return axios.post(SPOTIFY_AUTHORIZATION_URI, qs.stringify(params), { headers: headers }).then(r => r.data.access_token);
  }
}

module.exports = SpotifyApi;
