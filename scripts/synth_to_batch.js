#!/usr/bin/env node
// =====================================================
// SYNTH → BATCH CONVERTER
// - Input: numbered lines from synth.js (e.g. "1. prompt…")
// - Output:
//   • out/synth_batch.csv (id,prompt,flags)
//   • out/prompts_<ts>/*.txt
//   • out/synth_prompts_<ts>.zip
// =====================================================

const fs = require("fs");
const path = require("path");
const minimist = require("minimist");
const archiver = require("archiver");

function parseSynthLines(text) {
  const lines = text.split(/\r?\n/);
  const prompts = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const m = trimmed.match(/^\s*(\d+)[\.\)\-]\s*(.+)$/);
    if (m) {
      prompts.push({ id: parseInt(m[1], 10), prompt: m[2].trim() });
    } else {
      prompts.push({ id: prompts.length + 1, prompt: trimmed });
    }
  }

  return prompts;
}

function writeCSV(outDir, prompts, flags) {
  const csvPath = path.join(outDir, "synth_batch.csv");
  const lines = ["id,prompt,flags"];

  for (const item of prompts) {
    const escapedPrompt = item.prompt.replace(/"/g, '""');
    const escapedFlags = flags.replace(/"/g, '""');
    lines.push(`${item.id},"${escapedPrompt}","${escapedFlags}"`);
  }

  fs.writeFileSync(csvPath, lines.join("\n"), "utf8");
  return csvPath;
}

function writePromptFiles(outDir, prompts) {
  const ts = new Date().toISOString().replace(/[:.]/g, "").replace("T", "_").slice(0, 15);
  const batchDir = path.join(outDir, `prompts_${ts}`);

  fs.mkdirSync(batchDir, { recursive: true });

  for (const item of prompts) {
    const filePath = path.join(batchDir, `${String(item.id).padStart(3, "0")}.txt`);
    fs.writeFileSync(filePath, item.prompt + "\n", "utf8");
  }

  return batchDir;
}

function zipPromptDir(outDir, promptDir) {
  const ts = new Date().toISOString().replace(/[:.]/g, "").replace("T", "_").slice(0, 15);
  const zipPath = path.join(outDir, `synth_prompts_${ts}.zip`);

  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on("close", () => resolve(zipPath));
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(promptDir, false);
    archive.finalize();
  });
}

async function main() {
  const argv = minimist(process.argv.slice(2), {
    string: ["input", "out", "flags"],
    default: {
      input: "",
      out: "out",
      flags: "--ar 3:4 --v 6 --stylize 900"
    }
  });

  const outDir = path.resolve(argv.out);
  fs.mkdirSync(outDir, { recursive: true });

  let raw;
  if (argv.input) {
    const inputPath = path.resolve(argv.input);
    if (!fs.existsSync(inputPath)) {
      console.error(`Input file not found: ${inputPath}`);
      process.exit(1);
    }
    raw = fs.readFileSync(inputPath, "utf8");
  } else {
    raw = fs.readFileSync(0, "utf8"); // stdin
  }

  const prompts = parseSynthLines(raw);
  if (!prompts.length) {
    console.error("No prompts parsed from input.");
    process.exit(1);
  }

  const csvPath = writeCSV(outDir, prompts, argv.flags);
  const promptDir = writePromptFiles(outDir, prompts);
  const zipPath = await zipPromptDir(outDir, promptDir);

  console.log(`Parsed ${prompts.length} prompts.`);
  console.log(`CSV:    ${csvPath}`);
  console.log(`Folder: ${promptDir}`);
  console.log(`ZIP:    ${zipPath}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
