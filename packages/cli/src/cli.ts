import { SpotifyClient } from '@muc/common';

async function main() {
  const trackUri = process.argv[2];

  if (!trackUri) {
    console.error('Usage: ts-node src/cli.ts <spotify-track-uri>');
    process.exit(1);
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error(
      'Error: SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables must be set.',
    );
    process.exit(1);
  }

  try {
    console.log('Fetching Spotify client credentials token...');
    const apiToken = await SpotifyClient.getClientCredentialsToken(clientId, clientSecret);
    const spotifyClient = new SpotifyClient(apiToken);

    console.log(`Fetching details for track: ${trackUri}`);
    const trackDetails = await spotifyClient.getTrackDetails(trackUri);

    console.log('\n--- Track Details ---');
    console.log(`Name: ${trackDetails.name}`);
    console.log(`Artist(s): ${trackDetails.artists.map((artist) => artist.name).join(', ')}`);
    console.log(`Album: ${trackDetails.album.name}`);
    console.log(`Spotify URL: ${trackDetails.external_urls.spotify}`);

    console.log('\n--- Testing Search Functionality ---');
    const searchQuery = `${trackDetails.name} ${trackDetails.artists[0].name}`;
    console.log(`Searching for: "${searchQuery}"`);
    const searchResult = await spotifyClient.searchTracks(searchQuery);

    if (searchResult) {
      console.log(
        `Found track by search: ${searchResult.name} by ${searchResult.artists.map((artist) => artist.name).join(', ')}`,
      );
      console.log(`Spotify URL (search result): ${searchResult.external_urls.spotify}`);
    } else {
      console.log('No track found with the given search query.');
    }
  } catch (error) {
    console.error('An error occurred:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
