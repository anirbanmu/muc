import { describe, it, expect } from 'vitest';
import { SpotifyClient } from '../spotify.js';

describe('SpotifyClient', () => {
  describe('parseTrackId', () => {
    it('should correctly parse valid Spotify track URIs and URLs', () => {
      expect(SpotifyClient.parseTrackId('spotify:track:4BFd6LqI5Nf9h7Xm9tK3dY')).toBe(
        '4BFd6LqI5Nf9h7Xm9tK3dY',
      );
      expect(
        SpotifyClient.parseTrackId(
          'https://open.spotify.com/track/4BFd6LqI5Nf9h7Xm9tK3dY?si=example&utm_source=copy-link',
        ),
      ).toBe('4BFd6LqI5Nf9h7Xm9tK3dY');
      expect(
        SpotifyClient.parseTrackId('https://open.spotify.com/track/1PjdBtE4b0XnDj7rR3X4G5'),
      ).toBe('1PjdBtE4b0XnDj7rR3X4G5');
    });

    it('should return null for invalid or non-track Spotify URIs/URLs', () => {
      expect(SpotifyClient.parseTrackId('spotify:album:invaliduri')).toBeNull();
      expect(SpotifyClient.parseTrackId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
      expect(SpotifyClient.parseTrackId('')).toBeNull();
      expect(SpotifyClient.parseTrackId('spotify:track:')).toBeNull();
      expect(
        SpotifyClient.parseTrackId('https://open.spotify.com/album/6Kb8K0Q1f7oU4pQ9yM0hK1'),
      ).toBeNull();
      expect(SpotifyClient.parseTrackId('spotify:artist:2euFFrbx2zQdDDsoUA7oF2')).toBeNull();
    });
  });

  describe('isUriParsable', () => {
    it('should return true for parsable Spotify track URIs/URLs', () => {
      expect(SpotifyClient.isUriParsable('spotify:track:4BFd6LqI5Nf9h7Xm9tK3dY')).toBe(true);
      expect(
        SpotifyClient.isUriParsable(
          'https://open.spotify.com/track/4BFd6LqI5Nf9h7Xm9tK3dY?si=example',
        ),
      ).toBe(true);
      expect(
        SpotifyClient.isUriParsable('https://open.spotify.com/track/1PjdBtE4b0XnDj7rR3X4G5'),
      ).toBe(true);
    });

    it('should return false for unparsable or non-track Spotify URIs/URLs', () => {
      expect(SpotifyClient.isUriParsable('spotify:album:invaliduri')).toBe(false);
      expect(SpotifyClient.isUriParsable('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
        false,
      );
      expect(SpotifyClient.isUriParsable('')).toBe(false);
      expect(SpotifyClient.isUriParsable('spotify:track:')).toBe(false);
      expect(
        SpotifyClient.isUriParsable('https://open.spotify.com/album/6Kb8K0Q1f7oU4pQ9yM0hK1'),
      ).toBe(false);
      expect(SpotifyClient.isUriParsable('spotify:artist:2euFFrbx2zQdDDsoUA7oF2')).toBe(false);
    });
  });
});
