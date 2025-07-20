import { describe, it, expect } from 'vitest';
import { TrackIdentifier } from '../trackIdentifier.js';
import { MediaPlatform } from '../mediaService.js';

describe('TrackIdentifier', () => {
  describe('constructor', () => {
    it('should create a TrackIdentifier with valid platform and ID', () => {
      const identifier = new TrackIdentifier('spotify', '4BFd6LqI5Nf9h7Xm9tK3dY');
      expect(identifier.platform).toBe('spotify');
      expect(identifier.platformId).toBe('4BFd6LqI5Nf9h7Xm9tK3dY');
      expect(identifier.uniqueId).toBe('s4BFd6LqI5Nf9h7Xm9tK3dY');
    });

    it('should trim whitespace from platform ID', () => {
      const identifier = new TrackIdentifier('deezer', '  123456  ');
      expect(identifier.platformId).toBe('123456');
      expect(identifier.uniqueId).toBe('d123456');
    });

    it('should throw error for empty platform ID', () => {
      expect(() => new TrackIdentifier('spotify', '')).toThrow();
      expect(() => new TrackIdentifier('spotify', '   ')).toThrow();
    });
  });

  describe('generateUniqueId', () => {
    it('should generate correct unique IDs for each platform', () => {
      expect(TrackIdentifier.generateUniqueId('spotify', '4BFd6LqI5Nf9h7Xm9tK3dY')).toBe('s4BFd6LqI5Nf9h7Xm9tK3dY');
      expect(TrackIdentifier.generateUniqueId('deezer', '123456')).toBe('d123456');
      expect(TrackIdentifier.generateUniqueId('itunes', '789012')).toBe('i789012');
      expect(TrackIdentifier.generateUniqueId('youtube', 'dQw4w9WgXcQ')).toBe('ydQw4w9WgXcQ');
    });

    it('should trim whitespace from platform ID', () => {
      expect(TrackIdentifier.generateUniqueId('spotify', '  4BFd6LqI5Nf9h7Xm9tK3dY  ')).toBe('s4BFd6LqI5Nf9h7Xm9tK3dY');
    });

    it('should throw error for empty platform ID', () => {
      expect(() => TrackIdentifier.generateUniqueId('spotify', '')).toThrow();
      expect(() => TrackIdentifier.generateUniqueId('spotify', '   ')).toThrow();
    });
  });

  describe('parseUniqueId', () => {
    it('should correctly parse valid unique IDs', () => {
      expect(TrackIdentifier.parseUniqueId('s4BFd6LqI5Nf9h7Xm9tK3dY')).toEqual({
        platform: 'spotify',
        platformId: '4BFd6LqI5Nf9h7Xm9tK3dY',
      });
      expect(TrackIdentifier.parseUniqueId('d123456')).toEqual({
        platform: 'deezer',
        platformId: '123456',
      });
      expect(TrackIdentifier.parseUniqueId('i789012')).toEqual({
        platform: 'itunes',
        platformId: '789012',
      });
      expect(TrackIdentifier.parseUniqueId('ydQw4w9WgXcQ')).toEqual({
        platform: 'youtube',
        platformId: 'dQw4w9WgXcQ',
      });
    });

    it('should throw error for invalid unique ID format', () => {
      expect(() => TrackIdentifier.parseUniqueId('')).toThrow();
      expect(() => TrackIdentifier.parseUniqueId('x')).toThrow();
      expect(() => TrackIdentifier.parseUniqueId('s')).toThrow();
      expect(() => TrackIdentifier.parseUniqueId('z123456')).toThrow();
    });
  });

  describe('isValidUniqueId', () => {
    it('should return true for valid unique IDs', () => {
      expect(TrackIdentifier.isValidUniqueId('s4BFd6LqI5Nf9h7Xm9tK3dY')).toBe(true);
      expect(TrackIdentifier.isValidUniqueId('d123456')).toBe(true);
      expect(TrackIdentifier.isValidUniqueId('i789012')).toBe(true);
      expect(TrackIdentifier.isValidUniqueId('ydQw4w9WgXcQ')).toBe(true);
    });

    it('should return false for invalid unique IDs', () => {
      expect(TrackIdentifier.isValidUniqueId('')).toBe(false);
      expect(TrackIdentifier.isValidUniqueId('x123456')).toBe(false);
      expect(TrackIdentifier.isValidUniqueId('s')).toBe(false);
      expect(TrackIdentifier.isValidUniqueId('z123456')).toBe(false);
    });
  });

  describe('reconstructUriFromComponents', () => {
    it('should reconstruct correct URIs for each platform', () => {
      expect(TrackIdentifier.reconstructUriFromComponents('spotify', '4BFd6LqI5Nf9h7Xm9tK3dY')).toBe(
        'https://open.spotify.com/track/4BFd6LqI5Nf9h7Xm9tK3dY',
      );
      expect(TrackIdentifier.reconstructUriFromComponents('deezer', '123456')).toBe(
        'https://www.deezer.com/track/123456',
      );
      expect(TrackIdentifier.reconstructUriFromComponents('itunes', '789012')).toBe(
        'https://music.apple.com/album/id789012',
      );
      expect(TrackIdentifier.reconstructUriFromComponents('youtube', 'dQw4w9WgXcQ')).toBe(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      );
    });

    it('should trim whitespace from platform ID', () => {
      expect(TrackIdentifier.reconstructUriFromComponents('spotify', '  4BFd6LqI5Nf9h7Xm9tK3dY  ')).toBe(
        'https://open.spotify.com/track/4BFd6LqI5Nf9h7Xm9tK3dY',
      );
    });

    it('should throw error for empty platform ID', () => {
      expect(() => TrackIdentifier.reconstructUriFromComponents('spotify', '')).toThrow();
      expect(() => TrackIdentifier.reconstructUriFromComponents('spotify', '   ')).toThrow();
    });

    it('should throw error for unsupported platform', () => {
      expect(() => TrackIdentifier.reconstructUriFromComponents('unsupported' as MediaPlatform, '123456')).toThrow();
    });
  });

  describe('factory methods', () => {
    describe('fromPlatformId', () => {
      it('should create TrackIdentifier from platform and ID', () => {
        const identifier = TrackIdentifier.fromPlatformId('spotify', '4BFd6LqI5Nf9h7Xm9tK3dY');
        expect(identifier.platform).toBe('spotify');
        expect(identifier.platformId).toBe('4BFd6LqI5Nf9h7Xm9tK3dY');
        expect(identifier.uniqueId).toBe('s4BFd6LqI5Nf9h7Xm9tK3dY');
      });
    });

    describe('fromUniqueId', () => {
      it('should create TrackIdentifier from unique ID', () => {
        const identifier = TrackIdentifier.fromUniqueId('s4BFd6LqI5Nf9h7Xm9tK3dY');
        expect(identifier.platform).toBe('spotify');
        expect(identifier.platformId).toBe('4BFd6LqI5Nf9h7Xm9tK3dY');
        expect(identifier.uniqueId).toBe('s4BFd6LqI5Nf9h7Xm9tK3dY');
      });
    });

    describe('fromNormalizedTrack', () => {
      it('should create TrackIdentifier from NormalizedTrack', () => {
        const track = {
          platform: 'spotify' as const,
          id: '4BFd6LqI5Nf9h7Xm9tK3dY',
          title: 'Test Song',
          artistName: 'Test Artist',
          sourceUrl: 'https://open.spotify.com/track/4BFd6LqI5Nf9h7Xm9tK3dY',
          uniqueId: 's4BFd6LqI5Nf9h7Xm9tK3dY',
          albumName: 'Test Album',
        };

        const identifier = TrackIdentifier.fromNormalizedTrack(track);
        expect(identifier.platform).toBe('spotify');
        expect(identifier.platformId).toBe('4BFd6LqI5Nf9h7Xm9tK3dY');
        expect(identifier.uniqueId).toBe('s4BFd6LqI5Nf9h7Xm9tK3dY');
      });
    });
  });

  describe('instance methods', () => {
    describe('reconstructUri', () => {
      it('should reconstruct URI for the track', () => {
        const identifier = new TrackIdentifier('spotify', '4BFd6LqI5Nf9h7Xm9tK3dY');
        expect(identifier.reconstructUri()).toBe('https://open.spotify.com/track/4BFd6LqI5Nf9h7Xm9tK3dY');
      });
    });

    describe('toString', () => {
      it('should return the unique ID as string', () => {
        const identifier = new TrackIdentifier('spotify', '4BFd6LqI5Nf9h7Xm9tK3dY');
        expect(identifier.toString()).toBe('s4BFd6LqI5Nf9h7Xm9tK3dY');
      });
    });

    describe('equals', () => {
      it('should return true for identical identifiers', () => {
        const identifier1 = new TrackIdentifier('spotify', '4BFd6LqI5Nf9h7Xm9tK3dY');
        const identifier2 = new TrackIdentifier('spotify', '4BFd6LqI5Nf9h7Xm9tK3dY');
        expect(identifier1.equals(identifier2)).toBe(true);
      });

      it('should return false for different identifiers', () => {
        const identifier1 = new TrackIdentifier('spotify', '4BFd6LqI5Nf9h7Xm9tK3dY');
        const identifier2 = new TrackIdentifier('deezer', '123456');
        expect(identifier1.equals(identifier2)).toBe(false);
      });
    });
  });

  describe('error handling', () => {
    it('should handle platform client errors gracefully', () => {
      // Test error handling when platform client throws an error
      expect(() => TrackIdentifier.reconstructUriFromComponents('spotify', '')).toThrow();
    });
  });

  describe('NormalizedTrack mapper compatibility', () => {
    it('should work with all platform mappers', () => {
      // Test that TrackIdentifier works correctly with mapper output
      const testCases = [
        { platform: 'spotify' as const, id: '4BFd6LqI5Nf9h7Xm9tK3dY', expectedPrefix: 's' },
        { platform: 'deezer' as const, id: '123456', expectedPrefix: 'd' },
        { platform: 'itunes' as const, id: '789012', expectedPrefix: 'i' },
        { platform: 'youtube' as const, id: 'dQw4w9WgXcQ', expectedPrefix: 'y' },
      ];

      testCases.forEach(({ platform, id, expectedPrefix }) => {
        const uniqueId = TrackIdentifier.generateUniqueId(platform, id);
        expect(uniqueId).toMatch(new RegExp(`^${expectedPrefix}.+`));
        expect(TrackIdentifier.isValidUniqueId(uniqueId)).toBe(true);

        const identifier = TrackIdentifier.fromUniqueId(uniqueId);
        expect(identifier.platform).toBe(platform);
        expect(identifier.platformId).toBe(id);
      });
    });

    it('should maintain data integrity across different factory methods', () => {
      const testId = '4BFd6LqI5Nf9h7Xm9tK3dY';
      const platform = 'spotify';

      // Create identifier through different factory methods
      const fromPlatformId = TrackIdentifier.fromPlatformId(platform, testId);
      const fromUniqueId = TrackIdentifier.fromUniqueId(`s${testId}`);
      const fromConstructor = new TrackIdentifier(platform, testId);

      // All should produce identical results
      expect(fromPlatformId.uniqueId).toBe(fromUniqueId.uniqueId);
      expect(fromUniqueId.uniqueId).toBe(fromConstructor.uniqueId);
      expect(fromPlatformId.reconstructUri()).toBe(fromUniqueId.reconstructUri());
      expect(fromUniqueId.reconstructUri()).toBe(fromConstructor.reconstructUri());
    });

    it('should generate different unique IDs for same ID on different platforms', () => {
      const sameId = '123456';

      const spotifyId = TrackIdentifier.generateUniqueId('spotify', sameId);
      const deezerId = TrackIdentifier.generateUniqueId('deezer', sameId);
      const itunesId = TrackIdentifier.generateUniqueId('itunes', sameId);
      const youtubeId = TrackIdentifier.generateUniqueId('youtube', sameId);

      expect(spotifyId).toBe('s123456');
      expect(deezerId).toBe('d123456');
      expect(itunesId).toBe('i123456');
      expect(youtubeId).toBe('y123456');

      // All should be different
      const allIds = [spotifyId, deezerId, itunesId, youtubeId];
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(4);
    });

    it('should handle edge case IDs consistently', () => {
      const edgeCaseIds = ['', '   ', '123', 'a', 'very-long-id-with-special-chars-123456789'];

      edgeCaseIds.forEach(id => {
        if (id.trim() === '') {
          // Should throw for empty IDs
          expect(() => TrackIdentifier.generateUniqueId('spotify', id)).toThrow();
        } else {
          // Should work for non-empty IDs
          const uniqueId = TrackIdentifier.generateUniqueId('spotify', id);
          const parsed = TrackIdentifier.parseUniqueId(uniqueId);
          expect(parsed.platformId).toBe(id.trim());
        }
      });
    });
  });
});
