#!/usr/bin/env node
// =====================================================
// BH JSON → Midjourney CSV Converter
// - Input: out/bh_prompts.json (flexible shape)
// - Output: out/bh_midjourney.csv
// =====================================================

const fs = require("fs");
const path = require("path");
const minimist = require("minimist");

function loadJSON(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Input JSON not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function extractPrompts(data) {
  if (Array.isArray(data)) {
    return data.map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        return (
          item.prompt ||
          item.text ||
          item.description ||
          JSON.stringify(item)
        );
      }
      return String(item);
    });
  }

  // Try common container keys
  const candidates = ["prompts", "records", "items", "data"];
  for (const key of candidates) {
    if (Array.isArray(data[key])) {
      return extractPrompts(data[key]);
    }
  }

  // Fallback: treat as single object
  return [JSON.stringify(data)];
}

function toCSV(prompts) {
  const lines = ["id,prompt"];
  prompts.forEach((p, idx) => {
    const id = idx + 1;
    const escaped = String(p).replace(/"/g, '""');
    lines.push(`${id},"${escaped}"`);
  });
  return lines.join("\n");
}

function main() {
  const argv = minimist(process.argv.slice(2), {
    string: ["input", "out", "csv"],
    alias: { i: "input", o: "out" },
    default: {
      input: "out/bh_prompts.json",
      out: "out",
      csv: "bh_midjourney.csv"
    }
  });

  const inputPath = path.resolve(argv.input);
  const outDir = path.resolve(argv.out);
  const csvName = argv.csv;

  const data = loadJSON(inputPath);
  const prompts = extractPrompts(data);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const csvPath = path.join(outDir, csvName);
  fs.writeFileSync(csvPath, toCSV(prompts), "utf8");

  console.log(`Wrote Midjourney CSV with ${prompts.length} rows → ${csvPath}`);
}

if (require.main === module) {
  main();
}
