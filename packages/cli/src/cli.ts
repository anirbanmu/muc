import { SpotifyClient } from '../../common/src/spotify.js';

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
  } catch (error) {
    console.error('An error occurred:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
