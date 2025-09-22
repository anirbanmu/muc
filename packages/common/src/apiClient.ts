import { API_ROUTES } from './apiRoutes.js';
import { SearchRequest, SearchResponse } from './apiTypes.js';

export class ApiClient {
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;
  }

  public async search(uri: string): Promise<SearchResponse> {
    const response = await fetch(`${this.baseURL}${API_ROUTES.search}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uri } as SearchRequest),
    });

    if (!response.ok) {
      throw new Error(`API search failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
