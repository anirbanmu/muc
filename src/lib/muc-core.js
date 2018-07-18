"use strict";

import SpotifyApi from "./spotify-api";
import YoutubeApi from "./youtube-api";

export default class MucCore {
  constructor(apiTokens) {
    this.spotifyApi = new SpotifyApi(apiTokens.spotify);
    this.youtubeApi = new YoutubeApi(apiTokens.youtube);
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
    } else {
      throw new Error("bad URI");
    }
  }

  async getMatches(uriData) {
    const query = MucCore.buildQueryData(uriData);
    const searchRequests = [
      {
        type: "spotify",
        promise: this.spotifyApi.search(query).catch(() => null)
      },
      {
        type: "youtube",
        promise: this.youtubeApi.search(query).catch(() => null)
      }
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
        return uriData.data.snippet.title;
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
