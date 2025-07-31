import { describe, it, expect } from 'vitest';
import { HTTPError, TimeoutError } from 'ky';
import { extractApiErrorMessage, isHTTPError, isTimeoutError } from '../kyErrorUtils.js';

describe('kyErrorUtils', () => {
  describe('extractApiErrorMessage', () => {
    it('should extract message from error object', () => {
      const errorData = { error: { message: 'API error message' } };
      expect(extractApiErrorMessage(errorData)).toBe('API error message');
    });

    it('should return default message for unknown formats', () => {
      expect(extractApiErrorMessage(null)).toBe('Unknown error');
      expect(extractApiErrorMessage({})).toBe('Unknown error');
      expect(extractApiErrorMessage(123)).toBe('Unknown error');
      expect(extractApiErrorMessage(null, 'Custom default')).toBe('Custom default');
    });

    it('should handle nested error objects', () => {
      const errorData = { error: { message: 'Nested error' } };
      expect(extractApiErrorMessage(errorData)).toBe('Nested error');
    });

    it('should handle missing message in error object', () => {
      const errorData = { error: {} };
      expect(extractApiErrorMessage(errorData)).toBe('Unknown error');
    });
  });

  describe('isHTTPError', () => {
    it('should correctly identify HTTPError instances', () => {
      const mockHttpError = Object.create(HTTPError.prototype);
      mockHttpError.response = { status: 404, statusText: 'Not Found' };

      expect(isHTTPError(mockHttpError)).toBe(true);
    });

    it('should return false for non-HTTPError instances', () => {
      const regularError = new Error('Regular error');
      const mockTimeoutError = Object.create(TimeoutError.prototype);

      expect(isHTTPError(regularError)).toBe(false);
      expect(isHTTPError(mockTimeoutError)).toBe(false);
      expect(isHTTPError(null)).toBe(false);
      expect(isHTTPError(undefined)).toBe(false);
      expect(isHTTPError('string')).toBe(false);
      expect(isHTTPError({})).toBe(false);
    });
  });

  describe('isTimeoutError', () => {
    it('should correctly identify TimeoutError instances', () => {
      const mockTimeoutError = Object.create(TimeoutError.prototype);

      expect(isTimeoutError(mockTimeoutError)).toBe(true);
    });

    it('should return false for non-TimeoutError instances', () => {
      const regularError = new Error('Regular error');
      const mockHttpError = Object.create(HTTPError.prototype);

      expect(isTimeoutError(regularError)).toBe(false);
      expect(isTimeoutError(mockHttpError)).toBe(false);
      expect(isTimeoutError(null)).toBe(false);
      expect(isTimeoutError(undefined)).toBe(false);
      expect(isTimeoutError('string')).toBe(false);
      expect(isTimeoutError({})).toBe(false);
    });
  });
});
