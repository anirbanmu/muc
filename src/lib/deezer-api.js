"use strict";

import { isBrowser } from "browser-or-node";

// Using jsonp on browsers because deezer doesn't work with CORS
const jsonp = require("jsonp");
const axios = require("axios");
const qs = require("qs");

const DEEZER_BASE_URI = "https://api.deezer.com";
const DEEZER_TRACK_URI = DEEZER_BASE_URI + "/track";
const DEEZER_TRACK_SEARCH_URI = DEEZER_BASE_URI + "/search/track";

export default class DeezerApi {
  async getUriDetails(uri) {
    const id = DeezerApi._parseId(uri);
    const deezerUri = `${DEEZER_TRACK_URI}/${id}`;

    if (isBrowser) {
      const params = { output: "jsonp" };
      return new Promise(function(resolve, reject) {
        jsonp(`${deezerUri}&${qs.stringify(params)}`, null, (error, data) => {
          if (error || data.error) {
            reject(new Error("bad URI"));
          } else {
            resolve(data);
          }
        });
      });
    }

    return axios.get(deezerUri).then(r => {
      if (r.data.error) throw new Error("bad URI");
      return r.data;
    });
  }

  async search(query) {
    const baseParams = {
      q: query,
      limit: 1
    };

    if (isBrowser) {
      const params = Object.assign({ output: "jsonp" }, baseParams);
      return new Promise(function(resolve, reject) {
        jsonp(
          `${DEEZER_TRACK_SEARCH_URI}?${qs.stringify(params)}`,
          null,
          (error, data) => {
            if (error) {
              reject(new Error("bad URI"));
            } else {
              const found = data.error || data.total < 1 ? null : data.data[0];
              resolve(found);
            }
          }
        );
      });
    }

    return axios
      .request({
        url: DEEZER_TRACK_SEARCH_URI,
        params: baseParams
      })
      .then(r => {
        const found = r.data.error || r.data.total < 1 ? null : r.data.data[0];
        return found;
      });
  }

  static _parseId(uri) {
    const re = /track\/(\d+)/;
    const parsed = re.exec(uri);
    if (parsed === null) {
      throw new Error("bad URI");
    }
    return parsed[1];
  }
}
