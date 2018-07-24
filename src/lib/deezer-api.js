"use strict";

// Using jsonp because deezer doesn't work with CORS
const jsonp = require("jsonp");
const qs = require("qs");

const DEEZER_BASE_URI = "https://api.deezer.com";
const DEEZER_TRACK_URI = DEEZER_BASE_URI + "/track";
const DEEZER_TRACK_SEARCH_URI = DEEZER_BASE_URI + "/search/track";

export default class DeezerApi {
  async getUriDetails(uri) {
    const id = DeezerApi._parseId(uri);
    const params = { output: "jsonp" };
    return new Promise(function(resolve, reject) {
      jsonp(
        `${DEEZER_TRACK_URI}/${id}&${qs.stringify(params)}`,
        null,
        (error, data) => {
          if (error || data.error) {
            reject(new Error("bad URI"));
          } else {
            resolve(data);
          }
        }
      );
    });
  }

  async search(query) {
    const params = {
      q: query,
      limit: 1,
      output: "jsonp"
    };
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

  static _parseId(uri) {
    const re = /track\/(\d+)/;
    const parsed = re.exec(uri);
    if (parsed === null) {
      throw new Error("bad URI");
    }
    return parsed[1];
  }
}
