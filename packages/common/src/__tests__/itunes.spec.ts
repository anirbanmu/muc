import { describe, it, expect } from 'vitest';
import { ItunesClient } from '../itunes.js';

describe('ItunesClient', () => {
  describe('parseId', () => {
    it('should correctly parse valid iTunes track URIs/URLs', () => {
      expect(
        ItunesClient.parseId(
          'https://music.apple.com/us/album/unwritten-ep/1440810457?i=1440810461',
        ),
      ).toBe('1440810461');
      expect(
        ItunesClient.parseId('https://itunes.apple.com/us/album/some-album/id12345?i=67890'),
      ).toBe('67890');
      expect(ItunesClient.parseId('https://itunes.apple.com/jp/album/foo/id999?i=111222')).toBe(
        '111222',
      );
    });

    it('should return null for invalid or non-track iTunes URIs/URLs', () => {
      expect(ItunesClient.parseId('https://itunes.apple.com/us/album/id12345')).toBeNull();
      expect(ItunesClient.parseId('https://itunes.apple.com/us/artist/id12345')).toBeNull();
      expect(ItunesClient.parseId('https://itunes.apple.com/us/track/id12345')).toBeNull();
      expect(ItunesClient.parseId('invalid-uri')).toBeNull();
      expect(ItunesClient.parseId('')).toBeNull();
      expect(
        ItunesClient.parseId('https://music.apple.com/us/album/unwritten-ep/1440810457'),
      ).toBeNull();
    });
  });

  describe('isUriParsable', () => {
    it('should return true for parsable iTunes track URIs/URLs', () => {
      // URL format matching the regex /album\/.+i=(\d+)/
      expect(
        ItunesClient.isUriParsable(
          'https://music.apple.com/us/album/unwritten-ep/1440810457?i=1440810461',
        ),
      ).toBe(true);
      expect(
        ItunesClient.isUriParsable('https://itunes.apple.com/us/album/some-album/id12345?i=67890'),
      ).toBe(true);
      expect(
        ItunesClient.isUriParsable('https://itunes.apple.com/jp/album/foo/id999?i=111222'),
      ).toBe(true);
    });

    it('should return false for unparsable or non-track iTunes URIs/URLs', () => {
      expect(ItunesClient.isUriParsable('https://itunes.apple.com/us/album/id12345')).toBe(false); // Missing ?i=
      expect(ItunesClient.isUriParsable('https://itunes.apple.com/us/artist/id12345')).toBe(false);
      expect(ItunesClient.isUriParsable('https://itunes.apple.com/us/track/id12345')).toBe(false); // Does not match `album/.+i=(\d+)` pattern
      expect(ItunesClient.isUriParsable('invalid-uri')).toBe(false);
      expect(ItunesClient.isUriParsable('')).toBe(false);
      expect(
        ItunesClient.isUriParsable('https://music.apple.com/us/album/unwritten-ep/1440810457'),
      ).toBe(false); // Missing ?i=
      expect(ItunesClient.isUriParsable('https://www.deezer.com/track/123')).toBe(false); // Other platform
    });
  });
});
