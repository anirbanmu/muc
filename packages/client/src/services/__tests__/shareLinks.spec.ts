import { describe, it, expect } from 'vitest';
import { TrackIdentifier } from '@muc/common';
import { ShareLinkEncoder } from '../shareLinks';

describe('ShareLinkEncoder', () => {
  describe('encode/decode', () => {
    it('should handle round-trip for Spotify track', () => {
      const identifier = TrackIdentifier.fromPlatformId('spotify', '4BFd6LqI5Nf9h7Xm9tK3dY');

      const encoded = ShareLinkEncoder.encode(identifier);
      expect(encoded).toBeTruthy();
      expect(encoded).not.toBe(identifier.uniqueId);

      const decoded = ShareLinkEncoder.decode(encoded);
      expect(decoded.uniqueId).toBe(identifier.uniqueId);
      expect(decoded.platform).toBe('spotify');
      expect(decoded.platformId).toBe('4BFd6LqI5Nf9h7Xm9tK3dY');
    });

    it('should handle round-trip for Deezer track', () => {
      const identifier = TrackIdentifier.fromPlatformId('deezer', '123456789');

      const encoded = ShareLinkEncoder.encode(identifier);
      const decoded = ShareLinkEncoder.decode(encoded);

      expect(decoded.uniqueId).toBe(identifier.uniqueId);
      expect(decoded.platform).toBe('deezer');
      expect(decoded.platformId).toBe('123456789');
    });

    it('should handle round-trip for iTunes track', () => {
      const identifier = TrackIdentifier.fromPlatformId('itunes', '987654321');

      const encoded = ShareLinkEncoder.encode(identifier);
      const decoded = ShareLinkEncoder.decode(encoded);

      expect(decoded.uniqueId).toBe(identifier.uniqueId);
      expect(decoded.platform).toBe('itunes');
      expect(decoded.platformId).toBe('987654321');
    });

    it('should handle round-trip for YouTube track', () => {
      const identifier = TrackIdentifier.fromPlatformId('youtube', 'dQw4w9WgXcQ');

      const encoded = ShareLinkEncoder.encode(identifier);
      const decoded = ShareLinkEncoder.decode(encoded);

      expect(decoded.uniqueId).toBe(identifier.uniqueId);
      expect(decoded.platform).toBe('youtube');
      expect(decoded.platformId).toBe('dQw4w9WgXcQ');
    });

    it('should throw error for invalid TrackIdentifier', () => {
      expect(() => ShareLinkEncoder.encode(null as unknown as TrackIdentifier)).toThrow();
      expect(() => ShareLinkEncoder.encode({} as TrackIdentifier)).toThrow();
    });

    it('should throw error for empty encoded identifier', () => {
      expect(() => ShareLinkEncoder.decode('')).toThrow();
      expect(() => ShareLinkEncoder.decode('   ')).toThrow();
    });

    it('should throw error for invalid encoded identifier', () => {
      expect(() => ShareLinkEncoder.decode('invalid-base64!')).toThrow();
    });
  });

  describe('URL generation', () => {
    it('should create valid share URLs', () => {
      const identifier = TrackIdentifier.fromPlatformId('spotify', '4BFd6LqI5Nf9h7Xm9tK3dY');
      const shareUrl = ShareLinkEncoder.createShareUrl(identifier, 'https://example.com/app');

      expect(shareUrl).toMatch(/^https:\/\/example\.com\/app\?q=.+$/);

      // Extract the query parameter and verify it can be decoded
      const url = new URL(shareUrl);
      const encodedId = url.searchParams.get('q');
      expect(encodedId).toBeTruthy();

      const decoded = ShareLinkEncoder.decode(encodedId!);
      expect(decoded.uniqueId).toBe(identifier.uniqueId);
    });

    it('should reconstruct URIs correctly', () => {
      const identifier = TrackIdentifier.fromPlatformId('spotify', '4BFd6LqI5Nf9h7Xm9tK3dY');
      const encoded = ShareLinkEncoder.encode(identifier);

      const reconstructedUri = ShareLinkEncoder.reconstructUriFromEncoded(encoded);
      const expectedUri = identifier.reconstructUri();

      expect(reconstructedUri).toBe(expectedUri);
    });
  });
});
