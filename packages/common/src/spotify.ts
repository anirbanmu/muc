import ky from 'ky';
import qs from 'qs';
import { isHTTPError } from './kyErrorUtils.js';

export interface SpotifyExternalUrls {
  spotify: string;
}

export interface SpotifyArtist {
  name: string;
  external_urls: SpotifyExternalUrls;
}

export interface SpotifyAlbum {
  name: string;
  external_urls: SpotifyExternalUrls;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_urls: SpotifyExternalUrls;
}

export interface SpotifyClientCredentialsToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface SpotifyClientCredentials {
  clientId: string;
  clientSecret: string;
}

const SPOTIFY_AUTHORIZATION_URI = 'https://accounts.spotify.com/api/token';
const SPOTIFY_BASE_URI = 'https://api.spotify.com/v1';
const SPOTIFY_SEARCH_URI = `${SPOTIFY_BASE_URI}/search`;

export interface SpotifyClientInterface {
  getTrackDetails(uri: string): Promise<SpotifyTrack>;
  searchTracks(query: string): Promise<SpotifyTrack | null>;
}

export class SpotifyClient implements SpotifyClientInterface {
  private clientId: string;
  private clientSecret: string;

  private accessToken: string | undefined;
  private tokenExpiry: number | undefined; // Unix timestamp in milliseconds
  private readonly TOKEN_REFRESH_BUFFER_MS = 300 * 1000; // Refresh token 5 minutes before expiry

  private internalClient: InstanceType<typeof SpotifyClient.actualClient> | undefined;

  private constructor(credentials: SpotifyClientCredentials) {
    this.clientId = credentials.clientId;
    this.clientSecret = credentials.clientSecret;
  }

  public static async create(credentials: SpotifyClientCredentials): Promise<SpotifyClient> {
    const instance = new SpotifyClient(credentials);
    await instance.ensureAccessToken();
    return instance;
  }

  private async ensureAccessToken(): Promise<void> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - this.TOKEN_REFRESH_BUFFER_MS) {
      return;
    }

    console.log('Refreshing Spotify access token...');
    const auth: SpotifyClientCredentialsToken = await SpotifyClient.getClientCredentialsToken(
      this.clientId,
      this.clientSecret,
    );
    this.accessToken = auth.access_token;
    this.tokenExpiry = Date.now() + auth.expires_in * 1000;
    this.internalClient = new SpotifyClient.actualClient(this.accessToken);
  }

  public async getTrackDetails(uri: string): Promise<SpotifyTrack> {
    await this.ensureAccessToken();
    return this.internalClient!.getTrackDetails(uri);
  }

  public async searchTracks(query: string): Promise<SpotifyTrack | null> {
    await this.ensureAccessToken();
    return this.internalClient!.searchTracks(query);
  }

  public static parseTrackId(uri: string): string | null {
    const re = /track[:/]([0-9A-Za-z=]+)/;
    const parsed = re.exec(uri);
    if (parsed === null || !parsed[1]) {
      return null;
    }
    return parsed[1];
  }

  public static isUriParsable(uri: string): boolean {
    return SpotifyClient.parseTrackId(uri) !== null;
  }

  public static reconstructUri(trackId: string): string {
    if (!trackId || trackId.trim() === '') {
      throw new Error('Track ID cannot be empty');
    }
    return `https://open.spotify.com/track/${trackId.trim()}`;
  }

  private static async getClientCredentialsToken(
    clientId: string,
    clientSecret: string,
  ): Promise<SpotifyClientCredentialsToken> {
    const base64Encoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${base64Encoded}`,
    };
    const params = { grant_type: 'client_credentials' };

    try {
      const response = await ky
        .post(SPOTIFY_AUTHORIZATION_URI, {
          headers: headers,
          body: qs.stringify(params),
        })
        .json<SpotifyClientCredentialsToken>();
      return response;
    } catch (error) {
      if (isHTTPError(error)) {
        throw new Error(`Spotify authentication failed: ${error.response.status} ${error.response.statusText}`);
      }
      throw error;
    }
  }

  private static readonly actualClient = class {
    private apiToken: string;

    constructor(apiToken: string) {
      this.apiToken = apiToken;
    }

    private get headers(): { [key: string]: string } {
      return { Authorization: `Bearer ${this.apiToken}` };
    }

    public async getTrackDetails(uri: string): Promise<SpotifyTrack> {
      const trackId = SpotifyClient.parseTrackId(uri);
      if (trackId === null) {
        throw new Error('Invalid Spotify track URI format.');
      }
      const apiUri = `${SPOTIFY_BASE_URI}/tracks/${trackId}`;
      try {
        const response = await ky
          .get(apiUri, {
            headers: this.headers,
          })
          .json<SpotifyTrack>();
        return response;
      } catch (error) {
        if (isHTTPError(error)) {
          throw new Error(`Failed to get Spotify track details: ${error.response.status} ${error.response.statusText}`);
        }
        throw error;
      }
    }

    public async searchTracks(query: string): Promise<SpotifyTrack | null> {
      const searchParams = new URLSearchParams({ q: query, type: 'track', limit: '1' });
      try {
        const response = await ky
          .get(SPOTIFY_SEARCH_URI, {
            headers: this.headers,
            searchParams: searchParams,
          })
          .json<{
            tracks: { total: number; items: SpotifyTrack[] };
          }>();

        return response.tracks.total > 0 ? response.tracks.items[0] : null;
      } catch (error) {
        if (isHTTPError(error)) {
          throw new Error(`Failed to search Spotify tracks: ${error.response.status} ${error.response.statusText}`);
        }
        throw error;
      }
    }
  };
}
