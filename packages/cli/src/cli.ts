import { AnyNormalizedTrack, BackendMediaService } from '@muc/common';

async function main() {
  const mode = process.argv[2];
  const uriOrQuery = process.argv[3];

  if (!mode || (!uriOrQuery && mode !== 'search')) {
    console.error('Usage: tsx src/cli.ts lookup <uri>');
    console.error('Or:    tsx src/cli.ts search <query>');
    process.exit(1);
  }

  // Read API keys/secrets from environment variables
  const youtubeApiKey = process.env.YOUTUBE_API_KEY;

  let spotifyConfig: { clientId: string; clientSecret: string } | undefined;
  const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
  const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (spotifyClientId && spotifyClientSecret) {
    spotifyConfig = { clientId: spotifyClientId, clientSecret: spotifyClientSecret };
  }

  // Warn if essential keys are missing. For CLI, we can be strict about informing the user.
  if (!spotifyConfig) {
    console.warn(
      'Warning: SPOTIFY_CLIENT_ID and/or SPOTIFY_CLIENT_SECRET environment variables not set. Spotify features may not work.'
    );
  }
  if (!youtubeApiKey) {
    console.warn('Warning: YOUTUBE_API_KEY environment variable not set. YouTube features may not work.');
  }

  const backendMediaService = await BackendMediaService.create(spotifyConfig, youtubeApiKey);

  const printNormalizedTrack = (track: AnyNormalizedTrack, prefix: string = '') => {
    console.log(`${prefix}Platform: ${track.platform}`);
    console.log(`${prefix}Title: ${track.title}`);
    console.log(`${prefix}Artist: ${track.artistName}`);
    console.log(`${prefix}Source URL: ${track.sourceUrl}`);
    if ('albumName' in track && track.albumName) console.log(`${prefix}Album: ${track.albumName}`);
    if ('artistUrl' in track && track.artistUrl) console.log(`${prefix}Artist URL: ${track.artistUrl}`);
  };

  try {
    switch (mode) {
      case 'lookup':
        console.log(`\n--- Looking up details for URI: ${uriOrQuery} ---`);
        const trackDetails = await backendMediaService.getTrackDetails(uriOrQuery);
        if (trackDetails) {
          console.log('\n--- Track Details ---');
          printNormalizedTrack(trackDetails);

          let searchQuery: string;
          if (trackDetails.platform === 'youtube') {
            searchQuery = trackDetails.title;
          } else {
            searchQuery = `${trackDetails.title} ${trackDetails.artistName}`;
          }

          console.log(`\n--- Performing cross-platform search using query: "${searchQuery}" ---`);
          const searchResults = await backendMediaService.searchAllPlatforms(searchQuery);
          if (searchResults.length > 0) {
            console.log(`\n--- Found ${searchResults.length} Search Results ---`);
            searchResults.forEach((track, index) => {
              console.log(`\n${index + 1}.`);
              printNormalizedTrack(track, '   ');
            });
          } else {
            console.log(`No search results found for "${searchQuery}".`);
          }
        } else {
          console.error(`Could not find details for ${uriOrQuery}.`);
        }
        break;
      case 'search':
        console.log(`\n--- Performing cross-platform search for query: "${uriOrQuery}" ---`);
        const searchResultsOnly = await backendMediaService.searchAllPlatforms(uriOrQuery);
        if (searchResultsOnly.length > 0) {
          console.log(`\n--- Search Results for "${uriOrQuery}" ---`);
          searchResultsOnly.forEach((track, index) => {
            console.log(`\n${index + 1}.`);
            printNormalizedTrack(track, '   ');
          });
        } else {
          console.log(`No search results found for "${uriOrQuery}".`);
        }
        break;
      default:
        console.error('Invalid mode. Please use "lookup" or "search".');
        process.exit(1);
    }
  } catch (error) {
    console.error('An error occurred:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
