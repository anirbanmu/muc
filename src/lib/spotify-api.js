"use strict";

const axios = require("axios");
const qs = require("qs");

const SPOTIFY_AUTHORIZATION_URI = "https://accounts.spotify.com/api/token";
const SPOTIFY_BASE_URI = "https://api.spotify.com/v1";
const SPOTIFY_SEARCH_URI = SPOTIFY_BASE_URI + "/search";

export default class SpotifyApi {
  constructor(apiToken) {
    this.apiToken = apiToken;
  }

  headers() {
    return { Authorization: "Bearer " + this.apiToken };
  }

  async getUriDetails(uri) {
    const trackId = SpotifyApi._parseId(uri);
    const apiUri = `${SPOTIFY_BASE_URI}/tracks/${trackId}`;
    return axios
      .request({ url: apiUri, headers: this.headers() })
      .then(r => r.data);
  }

  async search(query) {
    const params = { q: query, type: "track", limit: 1 };
    return axios
      .request({
        url: SPOTIFY_SEARCH_URI,
        headers: this.headers(),
        params: params
      })
      .then(r => {
        const found = r.data.tracks.total > 0 ? r.data.tracks.items[0] : null;
        return found;
      });
  }

  static _parseId(uri) {
    const re = /track[:/]([0-9A-Za-z=]+)/;
    const parsed = re.exec(uri);
    if (parsed === null) {
      throw new Error("bad URI");
    }
    return parsed[1];
  }

  static getToken(clientId, clientSecret) {
    const base64Buffer = new Buffer(clientId + ":" + clientSecret);
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + base64Buffer.toString("base64")
    };
    const params = { grant_type: "client_credentials" };
    return axios
      .post(SPOTIFY_AUTHORIZATION_URI, qs.stringify(params), {
        headers: headers
      })
      .then(r => r.data.access_token);
  }
}
