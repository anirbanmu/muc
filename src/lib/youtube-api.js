'use strict';

const axios = require('axios');
const qs = require('qs');

const YOUTUBE_BASE_URI = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_VIDEOS_URI = YOUTUBE_BASE_URI + '/videos';
const YOUTUBE_SEARCH_URI = YOUTUBE_BASE_URI + '/search';

export default class YoutubeApi {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  addKey(params) {
    return Object.assign(params, { key: this.apiKey });
  }

  async getUriDetails(uri) {
    const id = YoutubeApi._parseId(uri);
    return axios
      .request({
        url: YOUTUBE_VIDEOS_URI,
        params: this.addKey({ id: id, part: 'snippet' })
      })
      .then((r) => {
        if (r.data.items.length < 1) throw new Error('bad URI');
        return r.data.items[0];
      });
  }

  async search(query) {
    const params = this.addKey({
      q: query,
      type: 'video',
      maxResults: 1,
      part: 'snippet'
    });
    return axios
      .request({
        url: YOUTUBE_SEARCH_URI,
        params: params
      })
      .then((r) => {
        const found = r.data.items.length > 0 ? r.data.items[0] : null;
        return found;
      });
  }

  static _parseId(uri) {
    let id = YoutubeApi._parseRegularLinkId(uri);
    if (id) return id;
    id = YoutubeApi._parseShortLinkId(uri);
    if (id) return id;
    throw new Error('bad URI');
  }

  static _parseRegularLinkId(uri) {
    const queryString = uri.split('?', 2);
    if (queryString.length == 2) {
      return qs.parse(queryString[1]).v;
    }
  }

  static _parseShortLinkId(uri) {
    const parts = uri.split('youtu.be/', 2);
    if (parts.length == 2) {
      return parts[1];
    }
  }

  static async getToken(apiKey) {
    return apiKey;
  }
}
