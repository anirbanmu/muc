import { MediaPlatform } from './mediaService.js';
import { AnyNormalizedTrack } from './normalizedTrack.js';
import { SpotifyClient } from './spotify.js';
import { DeezerClient } from './deezer.js';
import { ItunesClient } from './itunes.js';
import { YoutubeClient } from './youtube.js';

/**
 * TrackIdentifier provides a unified unique identifier system for tracks across different music platforms.
 * It creates compact, deterministic identifiers that encode both platform type and platform-specific ID.
 */
export class TrackIdentifier {
  public readonly platform: MediaPlatform;
  public readonly platformId: string;
  public readonly uniqueId: string;

  private static readonly PLATFORM_PREFIXES: Record<MediaPlatform, string> = {
    spotify: 's',
    deezer: 'd',
    itunes: 'i',
    youtube: 'y',
  };

  private static readonly PREFIX_TO_PLATFORM: Record<string, MediaPlatform> = {
    s: 'spotify',
    d: 'deezer',
    i: 'itunes',
    y: 'youtube',
  };

  constructor(platform: MediaPlatform, platformId: string) {
    if (!platformId || platformId.trim() === '') {
      throw new Error('Platform ID cannot be empty');
    }

    this.platform = platform;
    this.platformId = platformId.trim();
    this.uniqueId = TrackIdentifier.generateUniqueId(platform, this.platformId);
  }

  /**
   * Reconstructs the original URI/URL for this track identifier
   */
  reconstructUri(): string {
    return TrackIdentifier.reconstructUriFromComponents(this.platform, this.platformId);
  }

  /**
   * Returns the unique identifier as a string
   */
  toString(): string {
    return this.uniqueId;
  }

  /**
   * Checks if this identifier equals another identifier
   */
  equals(other: TrackIdentifier): boolean {
    return this.uniqueId === other.uniqueId;
  }

  // Static factory methods

  /**
   * Creates a TrackIdentifier from platform and platform ID
   */
  static fromPlatformId(platform: MediaPlatform, platformId: string): TrackIdentifier {
    return new TrackIdentifier(platform, platformId);
  }

  /**
   * Creates a TrackIdentifier from a unique identifier string
   */
  static fromUniqueId(uniqueId: string): TrackIdentifier {
    const { platform, platformId } = TrackIdentifier.parseUniqueId(uniqueId);
    return new TrackIdentifier(platform, platformId);
  }

  /**
   * Creates a TrackIdentifier from a NormalizedTrack object
   */
  static fromNormalizedTrack(track: AnyNormalizedTrack): TrackIdentifier {
    const uniqueId = track.uniqueId;
    const { platform, platformId } = TrackIdentifier.parseUniqueId(uniqueId);
    return new TrackIdentifier(platform, platformId);
  }

  // Static utility methods

  /**
   * Generates a unique identifier from platform and platform ID
   */
  static generateUniqueId(platform: MediaPlatform, platformId: string): string {
    if (!platformId || platformId.trim() === '') {
      throw new Error('Platform ID cannot be empty');
    }

    const prefix = TrackIdentifier.PLATFORM_PREFIXES[platform];
    if (!prefix) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    return `${prefix}${platformId.trim()}`;
  }

  static encodePlatformId(platform: MediaPlatform, components: string[]): string {
    return components.join('-');
  }

  static decodePlatformId(platform: MediaPlatform, encodedId: string): string[] {
    return encodedId.split('-');
  }

  /**
   * Parses a unique identifier string into platform and platform ID components
   */
  static parseUniqueId(uniqueId: string): { platform: MediaPlatform; platformId: string } {
    if (!uniqueId || uniqueId.length < 2) {
      throw new Error('Invalid unique identifier format');
    }

    const prefix = uniqueId.charAt(0);
    const platformId = uniqueId.slice(1);

    const platform = TrackIdentifier.PREFIX_TO_PLATFORM[prefix];
    if (!platform) {
      throw new Error(`Invalid platform prefix: ${prefix}`);
    }

    if (!platformId || platformId.trim() === '') {
      throw new Error('Platform ID cannot be empty');
    }

    return { platform, platformId };
  }

  /**
   * Validates whether a string is a valid unique identifier
   */
  static isValidUniqueId(uniqueId: string): boolean {
    try {
      TrackIdentifier.parseUniqueId(uniqueId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Reconstructs the original URI/URL from platform and platform ID components
   */
  static reconstructUriFromComponents(platform: MediaPlatform, platformId: string): string {
    if (!platformId || platformId.trim() === '') {
      throw new Error('Platform ID cannot be empty');
    }

    const cleanPlatformId = platformId.trim();

    switch (platform) {
      case 'spotify':
        return SpotifyClient.reconstructUri(cleanPlatformId);
      case 'deezer':
        return DeezerClient.reconstructUri(cleanPlatformId);
      case 'itunes': {
        const components = TrackIdentifier.decodePlatformId(platform, cleanPlatformId);
        if (components.length !== 2) {
          throw new Error('Invalid platform ID format for iTunes');
        }
        const [albumId, trackId] = components;
        return ItunesClient.reconstructUri(trackId, albumId);
      }
      case 'youtube':
        return YoutubeClient.reconstructUri(cleanPlatformId);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}
