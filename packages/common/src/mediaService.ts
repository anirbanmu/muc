import {
  AnyNormalizedTrack,
  SpotifyNormalizedTrack,
  DeezerNormalizedTrack,
  ItunesNormalizedTrack,
  YoutubeNormalizedTrack,
  mapDeezerTrackToNormalizedTrack,
  mapItunesTrackToNormalizedTrack,
} from './normalizedTrack.js';
import { SpotifyClient } from './spotify.js';
import { DeezerClient, DeezerTrack } from './deezer.js';
import { ItunesClient, ItunesTrack } from './itunes.js';
import { YoutubeClient } from './youtube.js';

export type MediaPlatform =
  | SpotifyNormalizedTrack['platform']
  | DeezerNormalizedTrack['platform']
  | ItunesNormalizedTrack['platform']
  | YoutubeNormalizedTrack['platform'];

export abstract class MediaService {
  private deezerClient: DeezerClient;
  private itunesClient: ItunesClient;

  constructor() {
    this.deezerClient = new DeezerClient();
    this.itunesClient = new ItunesClient();
  }

  public abstract getSpotifyTrackDetails(uri: string): Promise<SpotifyNormalizedTrack>;
  public abstract searchSpotifyTracks(query: string): Promise<SpotifyNormalizedTrack | null>;
  public abstract getYoutubeVideoDetails(uri: string): Promise<YoutubeNormalizedTrack>;
  public abstract searchYoutubeVideos(query: string): Promise<YoutubeNormalizedTrack | null>;

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
        const deezerTrack: DeezerTrack = await this.deezerClient.getTrackDetails(uri);
        return mapDeezerTrackToNormalizedTrack(deezerTrack);
      case 'itunes':
        const itunesTrack: ItunesTrack = await this.itunesClient.getTrackDetails(uri);
        return mapItunesTrackToNormalizedTrack(itunesTrack);
    }
  }

  public async searchAllPlatforms(query: string): Promise<AnyNormalizedTrack[]> {
    const searchPromises: Promise<AnyNormalizedTrack | null>[] = [];

    searchPromises.push(
      (async () => {
        try {
          const track = await this.searchSpotifyTracks(query);
          return track;
        } catch (error) {
          console.error('Spotify search failed:', error);
          return null;
        }
      })(),
    );

    searchPromises.push(
      (async () => {
        try {
          const track = await this.searchYoutubeVideos(query);
          return track;
        } catch (error) {
          console.error('Youtube search failed:', error);
          return null;
        }
      })(),
    );

    searchPromises.push(
      (async () => {
        try {
          const track = await this.deezerClient.searchTracks(query);
          return track ? mapDeezerTrackToNormalizedTrack(track) : null;
        } catch (error) {
          console.error('Deezer search failed:', error);
          return null;
        }
      })(),
    );

    searchPromises.push(
      (async () => {
        try {
          const track = await this.itunesClient.searchTracks(query);
          return track ? mapItunesTrackToNormalizedTrack(track) : null;
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
