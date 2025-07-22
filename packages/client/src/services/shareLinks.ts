import { TrackIdentifier } from '@muc/common';
import { Base64 } from 'js-base64';

export class ShareLinkEncoder {
  static encode(identifier: TrackIdentifier): string {
    if (!identifier) {
      throw new Error('TrackIdentifier is required');
    }

    return Base64.encodeURL(identifier.uniqueId);
  }

  static decode(encodedId: string): TrackIdentifier {
    if (!encodedId || encodedId.trim() === '') {
      throw new Error('Encoded identifier cannot be empty');
    }

    try {
      const decoded = Base64.decode(encodedId.trim());
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
