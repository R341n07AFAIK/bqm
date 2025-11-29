#!/usr/bin/env node
/**
 * Turn a newline-delimited list of prompts into a simple batch JSON
 * for downstream APIs.
 */

const fs = require("fs");
const path = require("path");

function usage() {
  console.error("Usage: synth_to_batch.js --in=INPUT.txt --out=OUTPUT.json");
  process.exit(1);
}

function parseArgs(argv) {
  const opts = {};
  argv.forEach((arg) => {
    if (!arg.startsWith("--")) return;
    const [k, v] = arg.split("=", 2);
    opts[k.slice(2)] = v;
  });
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.in || !opts.out) usage();

  const inPath = path.resolve(opts.in);
  const outPath = path.resolve(opts.out);

  const raw = fs.readFileSync(inPath, "utf8");
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const batch = lines.map((prompt, idx) => ({
    id: idx + 1,
    prompt
  }));

  fs.writeFileSync(outPath, JSON.stringify({ batch }, null, 2), "utf8");
  console.log(`[synth_to_batch] Wrote ${batch.length} entries to ${outPath}`);
}

if (require.main === module) {
  main();
}
