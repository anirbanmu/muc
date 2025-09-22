export interface DeezerArtist {
  name: string;
  link: string;
}

export interface DeezerAlbum {
  title: string;
}

export interface DeezerTrack {
  id: number;
  title: string;
  link: string;
  artist: DeezerArtist;
  album: DeezerAlbum;
}

const DEEZER_BASE_URI = 'https://api.deezer.com';
const DEEZER_TRACK_URI = DEEZER_BASE_URI + '/track';
const DEEZER_TRACK_SEARCH_URI = DEEZER_BASE_URI + '/search/track';

export interface DeezerClientInterface {
  getTrackDetails(uri: string): Promise<DeezerTrack>;
  searchTracks(query: string): Promise<DeezerTrack | null>;
}

export class DeezerClient implements DeezerClientInterface {
  public async getTrackDetails(uri: string): Promise<DeezerTrack> {
    const id = DeezerClient.parseId(uri);
    if (id === null) {
      throw new Error('Invalid Deezer track URI format.');
    }

    const response = await fetch(`${DEEZER_TRACK_URI}/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to get Deezer track details: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as DeezerTrack & { error?: { message: string } };

    if (data.error) {
      throw new Error(`Bad Deezer URI: ${data.error.message || 'Unknown error'}`);
    }

    return data;
  }

  public async searchTracks(query: string): Promise<DeezerTrack | null> {
    const url = new URL(DEEZER_TRACK_SEARCH_URI);
    url.searchParams.set('q', query);
    url.searchParams.set('limit', '1');

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to search Deezer tracks: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      data: DeezerTrack[];
      total: number;
      error?: { message: string };
    };

    if (data.error) {
      throw new Error(`Deezer search error: ${data.error.message || 'Unknown error'}`);
    }

    return data.total > 0 ? data.data[0] : null;
  }

  public static parseId(uri: string): string | null {
    const match = uri.match(/track\/(\d+)/);
    return match?.[1] || null;
  }

  public static isUriParsable(uri: string): boolean {
    return DeezerClient.parseId(uri) !== null;
  }

  public static reconstructUri(trackId: string): string {
    if (!trackId || trackId.trim() === '') {
      throw new Error('Track ID cannot be empty');
    }
    return `https://www.deezer.com/track/${trackId.trim()}`;
  }
}
