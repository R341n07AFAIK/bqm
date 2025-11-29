#!/usr/bin/env node
// Main CLI for generation bundle: lists generators or emits JSON records.

const fs = require("fs");
const path = require("path");
const { generateRecord, listGenerators } = require("./promptGenerators");

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

async function main() {
  const argv = process.argv.slice(2);
  const opts = parseArgs(argv);

  if (opts["list-generators"] || opts.listGenerators) {
    const payload = { generators: listGenerators() };
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const generator = opts.generator || "midjourney";
  const world = opts.world || "BH";
  const themes = (opts.themes || "bh_bureaucratic_shrine")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const styles = (opts.styles || "surreal-propaganda-noir")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const mode = opts.mode || null;
  const num = parseInt(opts.num || "8", 10);

  const record = await generateRecord({
    generator,
    world,
    themes,
    styles,
    mode,
    num
  });

  const out = {
    config: {
      generator,
      world,
      themes,
      styles,
      mode,
      timestamp: new Date().toISOString()
    },
    result: record
  };

  if (opts.out) {
    const outPath = path.resolve(String(opts.out));
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
  } else {
    console.log(JSON.stringify(out, null, 2));
  }
}

main().catch((err) => {
  console.error("Generation failed:", err);
  process.exit(1);
});
