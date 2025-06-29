import { SpotifyClient, YoutubeClient } from '@muc/common';

async function runSpotifyCli(trackUri: string) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error(
      'Error: SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables must be set.',
    );
    process.exit(1);
  }

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
}

async function runYoutubeCli(videoUri: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error('Error: YOUTUBE_API_KEY environment variable must be set.');
    process.exit(1);
  }

  console.log('Initializing YouTube client...');
  const youtubeClient = new YoutubeClient(apiKey);

  console.log(`Fetching details for video: ${videoUri}`);
  const videoDetails = await youtubeClient.getVideoDetails(videoUri);

  console.log('\n--- Video Details ---');
  console.log(`Title: ${videoDetails.snippet.title}`);
  console.log(`Video ID: ${videoDetails.id}`);

  console.log('\n--- Testing Search Functionality ---');
  const searchQuery = videoDetails.snippet.title;
  console.log(`Searching for: "${searchQuery}"`);
  const searchResult = await youtubeClient.searchVideos(searchQuery);

  if (searchResult && searchResult.id.videoId) {
    console.log(
      `Found video by search: ${searchResult.snippet.title} (ID: ${searchResult.id.videoId})`,
    );
    console.log(
      `YouTube URL (search result): https://www.youtube.com/watch?v=${searchResult.id.videoId}`,
    );
  } else {
    console.log('No video found with the given search query.');
  }
}

async function main() {
  const mode = process.argv[2];
  const uri = process.argv[3];

  if (!mode || !uri) {
    console.error('Usage: tsx src/cli.ts <spotify|yt> <uri>');
    process.exit(1);
  }

  try {
    switch (mode) {
      case 'spotify':
        await runSpotifyCli(uri);
        break;
      case 'yt':
        await runYoutubeCli(uri);
        break;
      default:
        console.error(`Error: Unknown mode "${mode}". Please use "spotify" or "yt".`);
        process.exit(1);
    }
  } catch (error) {
    console.error('An error occurred:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
