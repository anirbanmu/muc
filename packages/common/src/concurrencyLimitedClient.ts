import pLimit from 'p-limit';
import { SpotifyClientInterface, SpotifyTrack } from './spotify.js';
import { YoutubeClientInterface, YoutubeVideoDetails, YoutubeSearchResultItem } from './youtube.js';
import { DeezerClientInterface, DeezerTrack } from './deezer.js';
import { ItunesClientInterface, ItunesTrack } from './itunes.js';

abstract class ConcurrencyLimitedClient<T> {
  protected readonly limit: <T>(fn: () => Promise<T>) => Promise<T>;

  constructor(
    protected readonly client: T,
    concurrency: number = 10,
  ) {
    this.limit = pLimit(concurrency);
  }
}

export class ConcurrencyLimitedSpotifyClient
  extends ConcurrencyLimitedClient<SpotifyClientInterface>
  implements SpotifyClientInterface
{
  async getTrackDetails(uri: string): Promise<SpotifyTrack> {
    return this.limit(() => this.client.getTrackDetails(uri));
  }

  async searchTracks(query: string): Promise<SpotifyTrack | null> {
    return this.limit(() => this.client.searchTracks(query));
  }
}

export class ConcurrencyLimitedYoutubeClient
  extends ConcurrencyLimitedClient<YoutubeClientInterface>
  implements YoutubeClientInterface
{
  async getVideoDetails(uri: string): Promise<YoutubeVideoDetails> {
    return this.limit(() => this.client.getVideoDetails(uri));
  }

  async searchVideos(query: string): Promise<YoutubeSearchResultItem | null> {
    return this.limit(() => this.client.searchVideos(query));
  }
}

export class ConcurrencyLimitedDeezerClient
  extends ConcurrencyLimitedClient<DeezerClientInterface>
  implements DeezerClientInterface
{
  async getTrackDetails(uri: string): Promise<DeezerTrack> {
    return this.limit(() => this.client.getTrackDetails(uri));
  }

  async searchTracks(query: string): Promise<DeezerTrack | null> {
    return this.limit(() => this.client.searchTracks(query));
  }
}

export class ConcurrencyLimitedItunesClient
  extends ConcurrencyLimitedClient<ItunesClientInterface>
  implements ItunesClientInterface
{
  async getTrackDetails(uri: string): Promise<ItunesTrack> {
    return this.limit(() => this.client.getTrackDetails(uri));
  }

  async searchTracks(query: string): Promise<ItunesTrack | null> {
    return this.limit(() => this.client.searchTracks(query));
  }
}
