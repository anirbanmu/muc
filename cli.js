"use strict";

const MucCore = require("esm")(module)("./src/lib/muc-core");

async function matchesForUri(uri) {
  const tokens = await MucCore.generateApiTokens();
  const mucCore = new MucCore(tokens);
  return mucCore.getUriMatches(uri);
}

async function main(uri) {
  const matches = await matchesForUri(uri);
  matches.forEach(m => {
    switch (m.type) {
      case "spotify": {
        console.log(m.data.external_urls);
        break;
      }
      case "youtube": {
        const link = `https://www.youtube.com/watch?v=${
          m.data.id.videoId ? m.data.id.videoId : m.data.id
        }`;
        console.log({ youtube: link });
        break;
      }
      case "deezer": {
        console.log({ deezer: m.data.link });
        break;
      }
      case "itunes": {
        console.log({ itunes: m.data.trackViewUrl });
      }
    }
  });
}

if (process.argv.length < 3) {
  console.log("ERROR: Please provide a URL to convert");
  process.exit(-1);
}

main(process.argv[2]).catch(e => console.log(e));
