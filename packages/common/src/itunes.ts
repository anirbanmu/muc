const ITUNES_BASE_URI = 'https://itunes.apple.com';
const ITUNES_LOOKUP_URI = `${ITUNES_BASE_URI}/lookup`;
const ITUNES_SEARCH_URI = `${ITUNES_BASE_URI}/search`;

export interface ItunesTrack {
  artistName: string;
  artistViewUrl: string;
  trackName: string;
  trackViewUrl: string;
  trackId: number;
  collectionName: string;
  collectionId: number;
  collectionViewUrl: string;
  artworkUrl100: string;
}

interface ItunesLookupResponse {
  resultCount: number;
  results: ItunesTrack[];
}

interface ItunesSearchResponse {
  resultCount: number;
  results: ItunesTrack[];
}

export interface ItunesClientInterface {
  getTrackDetails(uri: string): Promise<ItunesTrack>;
  searchTracks(query: string): Promise<ItunesTrack | null>;
}

export class ItunesClient implements ItunesClientInterface {
  public async getTrackDetails(uri: string): Promise<ItunesTrack> {
    const id = ItunesClient.parseId(uri);
    if (id === null) {
      throw new Error('Invalid iTunes track URI format.');
    }

    const url = new URL(ITUNES_LOOKUP_URI);
    url.searchParams.set('id', id);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to get iTunes track details: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as ItunesLookupResponse;

    if (data.resultCount < 1) {
      throw new Error('Bad iTunes URI: No track found for the given ID.');
    }

    return data.results[0];
  }

  public async searchTracks(query: string): Promise<ItunesTrack | null> {
    const url = new URL(ITUNES_SEARCH_URI);
    url.searchParams.set('term', query);
    url.searchParams.set('limit', '1');
    url.searchParams.set('media', 'music');
    url.searchParams.set('entity', 'song');

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to search iTunes tracks: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as ItunesSearchResponse;
    return data.resultCount < 1 ? null : data.results[0];
  }

  public static parseId(uri: string): string | null {
    const match = uri.match(/album\/.+i=(\d+)/);
    return match?.[1] || null;
  }

  public static isUriParsable(uri: string): boolean {
    return ItunesClient.parseId(uri) !== null;
  }

  public static reconstructUri(trackId: string, albumId: string): string {
    if (!trackId || !albumId) {
      throw new Error('Both trackId and albumId are required to reconstruct the URI');
    }
    return `https://music.apple.com/us/album/${albumId}?i=${trackId}`;
  }
}
