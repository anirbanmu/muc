import {
  AnyNormalizedTrack,
  SpotifyNormalizedTrack,
  DeezerNormalizedTrack,
  ItunesNormalizedTrack,
  YoutubeNormalizedTrack,
} from './normalizedTrack.js';
import { SpotifyClient } from './spotify.js';
import { DeezerClient } from './deezer.js';
import { ItunesClient } from './itunes.js';
import { YoutubeClient } from './youtube.js';

export type MediaPlatform =
  | SpotifyNormalizedTrack['platform']
  | DeezerNormalizedTrack['platform']
  | ItunesNormalizedTrack['platform']
  | YoutubeNormalizedTrack['platform'];

export abstract class MediaService {
  constructor() {}

  public abstract getSpotifyTrackDetails(uri: string): Promise<SpotifyNormalizedTrack>;
  public abstract searchSpotifyTracks(query: string): Promise<SpotifyNormalizedTrack | null>;
  public abstract getYoutubeVideoDetails(uri: string): Promise<YoutubeNormalizedTrack>;
  public abstract searchYoutubeVideos(query: string): Promise<YoutubeNormalizedTrack | null>;
  public abstract getDeezerTrackDetails(uri: string): Promise<DeezerNormalizedTrack>;
  public abstract searchDeezerTracks(query: string): Promise<DeezerNormalizedTrack | null>;
  public abstract getItunesTrackDetails(uri: string): Promise<ItunesNormalizedTrack>;
  public abstract searchItunesTracks(query: string): Promise<ItunesNormalizedTrack | null>;

  private static classifyUri(uri: string): MediaPlatform | null {
    if (uri.includes('spotify.com') || uri.startsWith('spotify:')) {
      if (SpotifyClient.isUriParsable(uri)) return 'spotify';
    }
    if (uri.includes('youtube.com') || uri.includes('youtu.be')) {
      if (YoutubeClient.isUriParsable(uri)) return 'youtube';
    }
    if (uri.includes('deezer.com')) {
      if (DeezerClient.isUriParsable(uri)) return 'deezer';
    }
    if (uri.includes('itunes.apple.com') || uri.includes('music.apple.com')) {
      if (ItunesClient.isUriParsable(uri)) return 'itunes';
    }

    return null;
  }

  public async getTrackDetails(uri: string): Promise<AnyNormalizedTrack | null> {
    const platform = MediaService.classifyUri(uri);

    if (!platform) {
      return null;
    }

    switch (platform) {
      case 'spotify':
        return await this.getSpotifyTrackDetails(uri);
      case 'youtube':
        return await this.getYoutubeVideoDetails(uri);
      case 'deezer':
        return await this.getDeezerTrackDetails(uri);
      case 'itunes':
        return await this.getItunesTrackDetails(uri);
    }
  }

  public async searchAllPlatforms(query: string): Promise<AnyNormalizedTrack[]> {
    const searchPromises: Promise<AnyNormalizedTrack | null>[] = [];

    searchPromises.push(
      (async () => {
        try {
          return await this.searchSpotifyTracks(query);
        } catch (error) {
          console.error('Spotify search failed:', error);
          return null;
        }
      })(),
    );

    searchPromises.push(
      (async () => {
        try {
          return await this.searchYoutubeVideos(query);
        } catch (error) {
          console.error('Youtube search failed:', error);
          return null;
        }
      })(),
    );

    searchPromises.push(
      (async () => {
        try {
          return await this.searchDeezerTracks(query);
        } catch (error) {
          console.error('Deezer search failed:', error);
          return null;
        }
      })(),
    );

    searchPromises.push(
      (async () => {
        try {
          return await this.searchItunesTracks(query);
        } catch (error) {
          console.error('iTunes search failed:', error);
          return null;
        }
      })(),
    );

    const allSearchResults = await Promise.allSettled(searchPromises);

    const results: AnyNormalizedTrack[] = [];
    for (const result of allSearchResults) {
      if (result.status === 'fulfilled' && result.value !== null) {
        results.push(result.value);
      }
    }

    return results;
  }
}
