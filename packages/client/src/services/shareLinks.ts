import { TrackIdentifier } from '@muc/common';

export class ShareLinkEncoder {
  static encode(identifier: TrackIdentifier): string {
    if (!identifier || !identifier.uniqueId) {
      throw new Error('TrackIdentifier is required');
    }

    // Convert string to base64 using native btoa and make it URL-safe
    return btoa(identifier.uniqueId).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  static decode(encodedId: string): TrackIdentifier {
    if (!encodedId || encodedId.trim() === '') {
      throw new Error('Encoded identifier cannot be empty');
    }

    try {
      // Convert URL-safe base64 back to standard base64 and decode
      let base64 = encodedId.trim().replace(/-/g, '+').replace(/_/g, '/');

      // Add padding if needed
      const padding = (4 - (base64.length % 4)) % 4;
      base64 += '='.repeat(padding);

      const decoded = atob(base64);
      return TrackIdentifier.fromUniqueId(decoded);
    } catch (error) {
      throw new Error(`Failed to decode share link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static createShareUrl(
    identifier: TrackIdentifier,
    baseUrl: string = window.location.origin + window.location.pathname,
  ): string {
    const encoded = ShareLinkEncoder.encode(identifier);
    const url = new URL(baseUrl);
    url.searchParams.set('q', encoded);
    return url.toString();
  }

  static reconstructUriFromEncoded(encodedId: string): string {
    const identifier = ShareLinkEncoder.decode(encodedId);
    return identifier.reconstructUri();
  }
}
