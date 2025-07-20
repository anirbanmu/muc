import { describe, it, expect } from 'vitest';
import { DeezerClient } from '../deezer.js';

describe('DeezerClient', () => {
  describe('parseId', () => {
    it('should correctly parse valid Deezer track URIs', () => {
      expect(DeezerClient.parseId('https://www.deezer.com/track/123456789')).toBe('123456789');
      expect(DeezerClient.parseId('https://www.deezer.com/us/track/987654321?foo=bar')).toBe('987654321');
      expect(DeezerClient.parseId('http://www.deezer.com/track/123')).toBe('123');
    });

    it('should return null for invalid or non-track Deezer URIs', () => {
      expect(DeezerClient.parseId('https://www.deezer.com/artist/123')).toBeNull();
      expect(DeezerClient.parseId('https://www.deezer.com/album/456')).toBeNull();
      expect(DeezerClient.parseId('https://www.deezer.com/track/')).toBeNull();
      expect(DeezerClient.parseId('invalid-uri')).toBeNull();
      expect(DeezerClient.parseId('')).toBeNull();
      expect(DeezerClient.parseId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
    });
  });

  describe('isUriParsable', () => {
    it('should return true for parsable Deezer track URIs', () => {
      expect(DeezerClient.isUriParsable('https://www.deezer.com/track/123456789')).toBe(true);
      expect(DeezerClient.isUriParsable('https://www.deezer.com/us/track/987654321?foo=bar')).toBe(true);
      expect(DeezerClient.isUriParsable('http://www.deezer.com/track/123')).toBe(true); // http protocol
    });

    it('should return false for unparsable or non-track Deezer URIs', () => {
      expect(DeezerClient.isUriParsable('https://www.deezer.com/artist/123')).toBe(false);
      expect(DeezerClient.isUriParsable('https://www.deezer.com/album/456')).toBe(false);
      expect(DeezerClient.isUriParsable('https://www.deezer.com/track/')).toBe(false); // Missing ID
      expect(DeezerClient.isUriParsable('invalid-uri')).toBe(false);
      expect(DeezerClient.isUriParsable('')).toBe(false);
      expect(DeezerClient.isUriParsable('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(false); // Other platform
    });
  });
});
