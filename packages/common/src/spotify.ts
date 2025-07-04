import axios from 'axios';
import qs from 'qs';

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

export interface SpotifyClientCredentials {
  access_token: string;
  token_type: string;
  expires_in: number;
}

const SPOTIFY_AUTHORIZATION_URI = 'https://accounts.spotify.com/api/token';
const SPOTIFY_BASE_URI = 'https://api.spotify.com/v1';
const SPOTIFY_SEARCH_URI = `${SPOTIFY_BASE_URI}/search`;

export class SpotifyClient {
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
    const response = await axios.request<SpotifyTrack>({
      url: apiUri,
      headers: this.headers,
    });
    return response.data;
  }

  public async searchTracks(query: string): Promise<SpotifyTrack | null> {
    const params = { q: query, type: 'track', limit: 1 };
    const response = await axios.request<{
      tracks: { total: number; items: SpotifyTrack[] };
    }>({
      url: SPOTIFY_SEARCH_URI,
      headers: this.headers,
      params: params,
    });

    return response.data.tracks.total > 0 ? response.data.tracks.items[0] : null;
  }

  private static parseTrackId(uri: string): string | null {
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

  public static async getClientCredentialsToken(
    clientId: string,
    clientSecret: string,
  ): Promise<SpotifyClientCredentials> {
    const base64Encoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${base64Encoded}`,
    };
    const params = { grant_type: 'client_credentials' };

    const response = await axios.post<SpotifyClientCredentials>(
      SPOTIFY_AUTHORIZATION_URI,
      qs.stringify(params),
      { headers: headers },
    );
    return response.data;
  }
}
