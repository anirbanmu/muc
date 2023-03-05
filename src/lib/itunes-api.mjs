'use strict';

import { isBrowser } from 'browser-or-node';

// Using jsonp on browsers because itunes doesn't work with CORS
import jsonp from 'jsonp';
import axios from 'axios';
import qs from 'qs';

const ITUNES_BASE_URI = 'https://itunes.apple.com';
const ITUNES_LOOKUP_URI = ITUNES_BASE_URI + '/lookup';
const ITUNES_SEARCH_URI = ITUNES_BASE_URI + '/search';

export default class ItunesApi {
  async getUriDetails(uri) {
    const id = ItunesApi._parseId(uri);
    const params = { id: id };

    if (isBrowser) {
      return ItunesApi._getUriDetailsJsonp(params);
    }

    return axios
      .request({
        url: ITUNES_LOOKUP_URI,
        params: params
      })
      .then((r) => {
        if (r.data.resultCount < 1) throw new Error('bad URI');
        return r.data.results[0];
      });
  }

  static _getUriDetailsJsonp(params) {
    const queryString = qs.stringify(params);
    return new Promise(function (resolve, reject) {
      jsonp(`${ITUNES_LOOKUP_URI}?${queryString}`, null, (error, data) => {
        if (error || data.resultCount < 1) {
          reject(new Error('bad URI'));
        } else {
          resolve(data.results[0]);
        }
      });
    });
  }

  async search(query) {
    const params = {
      term: query,
      limit: 1,
      media: 'music',
      entity: 'song'
    };

    if (isBrowser) {
      return ItunesApi._searchJsonp(params);
    }

    return axios
      .request({
        url: ITUNES_SEARCH_URI,
        params: params
      })
      .then((r) => {
        const found = r.data.resultCount < 1 ? null : r.data.results[0];
        return found;
      });
  }

  static _searchJsonp(params) {
    const queryString = qs.stringify(params);

    return new Promise(function (resolve, reject) {
      jsonp(`${ITUNES_SEARCH_URI}?${queryString}`, null, (error, data) => {
        if (error) {
          reject(new Error('bad URI'));
        } else {
          const found = data.resultCount < 1 ? null : data.results[0];
          resolve(found);
        }
      });
    });
  }

  static _parseId(uri) {
    const re = /album\/.+i=(\d+)/;
    const parsed = re.exec(uri);
    if (parsed === null) {
      throw new Error('bad URI');
    }
    return parsed[1];
  }
}
