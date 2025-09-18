import { SpotifyClientInterface, SpotifyTrack } from '@muc/common';
import { YoutubeClientInterface, YoutubeVideoDetails, YoutubeSearchResultItem } from '@muc/common';
import { DeezerClientInterface, DeezerTrack } from '@muc/common';
import { ItunesClientInterface, ItunesTrack } from '@muc/common';
import { getLogger } from './logger.js';

abstract class TimedClient<T> {
  constructor(
    protected readonly client: T,
    private readonly getRequestId: () => string = () => '',
  ) {}

  protected async timeOperation<R>(operationName: string, operation: () => Promise<R>): Promise<R> {
    const start = performance.now();

    try {
      const result = await operation();
      const duration = performance.now() - start;
      getLogger().timing(operationName, duration, this.getRequestId());
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      getLogger().timing(operationName, duration, this.getRequestId(), true);
      throw error;
    }
  }
}

export class TimedSpotifyClient extends TimedClient<SpotifyClientInterface> implements SpotifyClientInterface {
  async getTrackDetails(uri: string): Promise<SpotifyTrack> {
    return this.timeOperation('Spotify.getTrackDetails', () => this.client.getTrackDetails(uri));
  }

  async searchTracks(query: string): Promise<SpotifyTrack | null> {
    return this.timeOperation('Spotify.searchTracks', () => this.client.searchTracks(query));
  }
}

export class TimedYoutubeClient extends TimedClient<YoutubeClientInterface> implements YoutubeClientInterface {
  async getVideoDetails(uri: string): Promise<YoutubeVideoDetails> {
    return this.timeOperation('YouTube.getVideoDetails', () => this.client.getVideoDetails(uri));
  }

  async searchVideos(query: string): Promise<YoutubeSearchResultItem | null> {
    return this.timeOperation('YouTube.searchVideos', () => this.client.searchVideos(query));
  }
}

export class TimedDeezerClient extends TimedClient<DeezerClientInterface> implements DeezerClientInterface {
  async getTrackDetails(uri: string): Promise<DeezerTrack> {
    return this.timeOperation('Deezer.getTrackDetails', () => this.client.getTrackDetails(uri));
  }

  async searchTracks(query: string): Promise<DeezerTrack | null> {
    return this.timeOperation('Deezer.searchTracks', () => this.client.searchTracks(query));
  }
}

export class TimedItunesClient extends TimedClient<ItunesClientInterface> implements ItunesClientInterface {
  async getTrackDetails(uri: string): Promise<ItunesTrack> {
    return this.timeOperation('iTunes.getTrackDetails', () => this.client.getTrackDetails(uri));
  }

  async searchTracks(query: string): Promise<ItunesTrack | null> {
    return this.timeOperation('iTunes.searchTracks', () => this.client.searchTracks(query));
  }
}
