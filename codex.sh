#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="out"
mkdir -p "$OUT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required to run this pipeline" >&2
  exit 1
fi

echo "[CODEX] Running BH export…"
scripts/bh_export_full.sh

echo "[CODEX] Generating duet preview…"
node synth.js duet 8 > "$OUT_DIR/codex_synth.txt"
node scripts/synth_to_batch.js --input="$OUT_DIR/codex_synth.txt" --out="$OUT_DIR" --flags="--ar 3:4 --v 6 --stylize 900"

echo "[CODEX] Converting BH prompts to Midjourney CSV…"
node scripts/convert_to_midjourney.js --input "$OUT_DIR/bh_prompts.json" --out "$OUT_DIR/midjourney"

echo "[CODEX] Building Codex archive…"
ZIP_NAME="$OUT_DIR/codex_bundle.zip"
rm -f "$ZIP_NAME"
zip -qr "$ZIP_NAME" "$OUT_DIR/bh_prompts.json" "$OUT_DIR/bh_export.tar.gz" "$OUT_DIR/bh_export.zip" "$OUT_DIR/synth_batch.csv" "$OUT_DIR/synth_prompts" "$OUT_DIR/midjourney" 2>/dev/null || true

if [ -f "$ZIP_NAME" ]; then
  echo "[CODEX] Codex bundle ready -> $ZIP_NAME"
else
  echo "[CODEX] Failed to create Codex bundle" >&2
  exit 1
fi
