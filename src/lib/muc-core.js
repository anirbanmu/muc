"use strict";

import SpotifyApi from "./spotify-api";
import YoutubeApi from "./youtube-api";
import DeezerApi from "./deezer-api";
import ItunesApi from "./itunes-api";

export default class MucCore {
  constructor(apiTokens) {
    this.spotifyApi = new SpotifyApi(apiTokens.spotify);
    this.youtubeApi = new YoutubeApi(apiTokens.youtube);
    this.itunesApi = new ItunesApi();
    this.deezerApi = new DeezerApi();
  }

  async getUriMatches(uri) {
    const uriData = await this.getUriData(uri);
    return this.getMatches(uriData);
  }

  async getUriData(uri) {
    const lower = uri.toLowerCase();
    if (lower.includes("spotify")) {
      const spotifyData = await this.spotifyApi.getUriDetails(uri);
      return { data: spotifyData, type: "spotify" };
    } else if (/youtu\.{0,1}be/.test(lower)) {
      const youtubeData = await this.youtubeApi.getUriDetails(uri);
      return { data: youtubeData, type: "youtube" };
    } else if (lower.includes("itunes")) {
      const itunesData = await this.itunesApi.getUriDetails(uri);
      return { data: itunesData, type: "itunes" };
    } else if (lower.includes("deezer")) {
      const deezerData = await this.deezerApi.getUriDetails(uri);
      return { data: deezerData, type: "deezer" };
    } else {
      throw new Error("bad URI");
    }
  }

  async getMatches(uriData) {
    const query = MucCore.buildQueryData(uriData);
    const searchRequests = [
      MucCore.buildSearchPromise("spotify", this.spotifyApi, query, uriData),
      MucCore.buildSearchPromise("youtube", this.youtubeApi, query, uriData),
      MucCore.buildSearchPromise("itunes", this.itunesApi, query, uriData),
      MucCore.buildSearchPromise("deezer", this.deezerApi, query, uriData)
    ];

    const promises = Promise.all(searchRequests.map(s => s.promise));
    return promises.then(results => {
      let final = [];
      results.forEach((r, i) => {
        if (r !== null) {
          final.push({ type: searchRequests[i].type, data: r });
        }
      });
      return final;
    });
  }

  static buildSearchPromise(apiType, api, queryString, queryData) {
    return {
      type: apiType,
      promise:
        queryData.type == apiType
          ? Promise.resolve(queryData.data)
          : api.search(queryString).catch(() => null)
    };
  }

  static buildQueryData(uriData) {
    switch (uriData.type) {
      case "spotify": {
        const artist =
          uriData.data.artists.length > 0
            ? uriData.data.artists[0].name + " "
            : null;
        return artist + uriData.data.name;
      }
      case "youtube": {
        return uriData.data.snippet.title
          .replace(/(\[.*?official.*?])|(\(.*?official.*?\))/gi, "")
          .trim();
      }
      case "itunes": {
        return `${uriData.data.artistName} ${uriData.data.trackName}`;
      }
      case "deezer": {
        return `${uriData.data.artist.name} ${uriData.data.title}`;
      }
    }
  }

  static generateApiTokens() {
    const tokenRequests = [
      {
        type: "spotify",
        promise: SpotifyApi.getToken(
          process.env.SPOTIFY_CLIENT_ID,
          process.env.SPOTIFY_CLIENT_SECRET
        )
      },
      {
        type: "youtube",
        promise: YoutubeApi.getToken(process.env.YOUTUBE_API_KEY)
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
