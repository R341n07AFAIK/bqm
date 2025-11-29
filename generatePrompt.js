#!/usr/bin/env node
// High-level prompt generator for OIP/BH style scenes.

const { collectMotifs } = require("../lexicon");

function parseArgs(argv) {
  const opts = {};
  argv.forEach((arg, idx) => {
    if (!arg.startsWith("--")) return;
    const [rawKey, rawValue] = arg.split("=", 2);
    const key = rawKey.replace(/^--/, "");
    if (rawValue !== undefined) {
      opts[key] = rawValue;
    } else {
      const next = argv[idx + 1];
      if (next && !next.startsWith("--")) {
        opts[key] = next;
      } else {
        opts[key] = true;
      }
    }
  });
  return opts;
}

function main() {
  const argv = process.argv.slice(2);
  const opts = parseArgs(argv);

  const world = opts.world || "OIP";
  const style = opts.style || "propaganda-noir";
  const seed = opts.seed || "auto";
  const cinema = opts.cinema || "35mm";
  const flux = opts.flux || "myth-engine";

  const motifs = collectMotifs([world], [style]);

  const prompt = `
World: ${world}
Style: ${style}
Cinema: ${cinema}
Flux: ${flux}
Seed: ${seed}

${motifs.join(", ")}.

The result should feel like a therapy-movie frame about a bureaucracy-sick society,
editorial, morally gray, deeply exhausted yet stylish, with occult relics hidden
inside modern and future absurdities instead of swords and sandals.
`.trim();

  console.log(prompt);
}

main();
