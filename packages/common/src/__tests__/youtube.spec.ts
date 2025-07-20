import { describe, it, expect } from 'vitest';
import { YoutubeClient } from '../youtube.js';

describe('YoutubeClient', () => {
  describe('parseId', () => {
    it('should correctly parse valid regular YouTube video URLs', () => {
      expect(YoutubeClient.parseId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(YoutubeClient.parseId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share')).toBe('dQw4w9WgXcQ');
      expect(YoutubeClient.parseId('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('should correctly parse valid shortened YouTube video URLs (youtu.be)', () => {
      expect(YoutubeClient.parseId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(YoutubeClient.parseId('https://youtu.be/dQw4w9WgXcQ?t=30s')).toBe('dQw4w9WgXcQ');
      expect(YoutubeClient.parseId('http://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('should return null for invalid or non-video YouTube URLs', () => {
      expect(YoutubeClient.parseId('https://www.youtube.com/playlist?list=PLsomething')).toBeNull();
      expect(YoutubeClient.parseId('https://www.youtube.com/channel/UCsomething')).toBeNull();
      expect(YoutubeClient.parseId('https://www.youtube.com/watch')).toBeNull();
      expect(YoutubeClient.parseId('https://youtu.be/')).toBeNull();
      expect(YoutubeClient.parseId('invalid-uri')).toBeNull();
      expect(YoutubeClient.parseId('')).toBeNull();
    });
  });

  describe('isUriParsable', () => {
    it('should return true for parsable regular YouTube video URLs', () => {
      expect(YoutubeClient.isUriParsable('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
      expect(YoutubeClient.isUriParsable('https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share')).toBe(true);
      expect(YoutubeClient.isUriParsable('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true); // Mobile URL
      expect(YoutubeClient.isUriParsable('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLsomething')).toBe(true); // With playlist param
    });

    it('should return true for parsable shortened YouTube video URLs (youtu.be)', () => {
      expect(YoutubeClient.isUriParsable('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
      expect(YoutubeClient.isUriParsable('https://youtu.be/dQw4w9WgXcQ?t=30s')).toBe(true); // With timestamp
      expect(YoutubeClient.isUriParsable('http://youtu.be/dQw4w9WgXcQ')).toBe(true); // http protocol
    });

    it('should return false for invalid or non-video YouTube URLs', () => {
      expect(YoutubeClient.isUriParsable('https://www.youtube.com/playlist?list=PLsomething')).toBe(false); // Playlist URL
      expect(YoutubeClient.isUriParsable('https://www.youtube.com/channel/UCsomething')).toBe(false); // Channel URL
      expect(YoutubeClient.isUriParsable('https://www.youtube.com/watch')).toBe(false); // Missing 'v' parameter
      expect(YoutubeClient.isUriParsable('https://youtu.be/')).toBe(false); // Missing video ID
      expect(YoutubeClient.isUriParsable('invalid-uri')).toBe(false);
      expect(YoutubeClient.isUriParsable('')).toBe(false);
      expect(YoutubeClient.isUriParsable('https://www.google.com')).toBe(false); // Non-YouTube URL
      expect(YoutubeClient.isUriParsable('https://open.spotify.com/track/123')).toBe(false); // Other platform
    });
  });
});
