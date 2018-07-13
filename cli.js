"use strict";

const MucCore = require("esm")(module)("./src/lib/muc-core").default;

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
        console.log(m.item.external_urls);
        break;
      }
    }
  });
}

if (process.argv.length < 3) {
  console.log("ERROR: Please provide a URL to convert");
  process.exit(-1);
}

main(process.argv[2]).catch(e => console.log(e));
