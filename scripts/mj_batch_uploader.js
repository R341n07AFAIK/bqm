#!/usr/bin/env node
// =====================================================
// Midjourney Batch Uploader → Discord Webhook
// - Reads CSV: id,prompt,flags
// - Posts "prompt flags" to MJ Discord webhook
// - Uses MJ_WEBHOOK_URL env var or --webhook
// - Supports --dry for no-send mode
// =====================================================

const fs = require("fs");
const path = require("path");
const https = require("https");
const minimist = require("minimist");

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }

  result.push(current);
  return result;
}

function readCSV(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (!lines.length) return [];

  const header = parseCSVLine(lines[0]).map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const row = {};
    header.forEach((h, idx) => {
      row[h] = cols[idx] !== undefined ? cols[idx] : "";
    });
    rows.push(row);
  }

  return rows;
}

function postToWebhook(webhookUrl, content) {
  return new Promise((resolve, reject) => {
    const url = new URL(webhookUrl);

    const body = JSON.stringify({ content });

    const options = {
      method: "POST",
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(
            new Error(`Webhook HTTP ${res.statusCode}: ${data || "<no body>"}`)
          );
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const argv = minimist(process.argv.slice(2), {
    string: ["csv", "webhook"],
    boolean: ["dry"],
    default: {
      csv: "out/synth_batch.csv",
      dry: false
    }
  });

  const csvPath = path.resolve(argv.csv);
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }

  const webhook = argv.webhook || process.env.MJ_WEBHOOK_URL;
  if (!argv.dry && !webhook) {
    console.error("No webhook URL. Set MJ_WEBHOOK_URL or pass --webhook=…");
    process.exit(1);
  }

  const rows = readCSV(csvPath);
  if (!rows.length) {
    console.error("CSV has no data rows.");
    process.exit(1);
  }

  console.log(
    `Loaded ${rows.length} rows from ${csvPath}. dry=${argv.dry ? "yes" : "no"}`
  );

  for (const row of rows) {
    const id = row.id || "?";
    const prompt = (row.prompt || "").trim();
    const flags = (row.flags || "").trim();
    const content = `${prompt} ${flags}`.trim();

    if (!content) continue;

    if (argv.dry) {
      console.log(`[DRY] (${id}) ${content}`);
      continue;
    }

    console.log(`[SEND] (${id}) ${content}`);
    try {
      await postToWebhook(webhook, content);
    } catch (err) {
      console.error(`Failed to send row ${id}:`, err.message);
    }
  }

  console.log("Done.");
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
