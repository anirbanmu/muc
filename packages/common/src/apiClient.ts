import ky from 'ky';
import { API_ROUTES } from './apiRoutes.js';
import { SearchRequest, SearchResponse } from './apiTypes.js';
import { isHTTPError, isTimeoutError } from './kyErrorUtils.js';

export class ApiClient {
  private readonly client: typeof ky;

  constructor(baseURL: string) {
    this.client = ky.create({
      prefixUrl: baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public async search(uri: string): Promise<SearchResponse> {
    try {
      return await this.client
        .post(API_ROUTES.search, {
          json: {
            uri,
          } as SearchRequest,
        })
        .json<SearchResponse>();
    } catch (error) {
      if (isHTTPError(error) || isTimeoutError(error)) {
        throw error;
      }
      throw new Error(`Failed to search: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
