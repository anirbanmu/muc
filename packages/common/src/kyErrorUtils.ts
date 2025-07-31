import { HTTPError, TimeoutError } from 'ky';

export function isHTTPError(error: unknown): error is HTTPError {
  return error instanceof HTTPError;
}

export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError;
}

interface ApiErrorData {
  error?: {
    message?: string;
  };
}

function hasApiErrorStructure(data: unknown): data is ApiErrorData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as Record<string, unknown>).error === 'object' &&
    (data as Record<string, unknown>).error !== null
  );
}

/**
 * Utility function to extract error message from API response data
 * Used for APIs like Deezer that return error info in response body
 */
export function extractApiErrorMessage(errorData: unknown, defaultMessage = 'Unknown error'): string {
  if (hasApiErrorStructure(errorData) && typeof errorData.error?.message === 'string') {
    return errorData.error.message;
  }

  return defaultMessage;
}
