#!/usr/bin/env bash
# ============================================================
# PREVIEW SYNTH BATCH
# - Shows:
#   • head of synth_output.txt
#   • head of out/synth_batch.csv
#   • some prompt files
#   • any ZIPs in out/
# ============================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

OUT_DIR="${ROOT_DIR}/out"

echo ">>> [1/4] synth_output.txt (first 10 lines)…"
if [[ -f "${ROOT_DIR}/synth_output.txt" ]]; then
  head -n 10 "${ROOT_DIR}/synth_output.txt"
else
  echo "synth_output.txt not found."
fi

echo
echo ">>> [2/4] out/synth_batch.csv (first 10 lines)…"
if [[ -f "${OUT_DIR}/synth_batch.csv" ]]; then
  head -n 10 "${OUT_DIR}/synth_batch.csv"
else
  echo "out/synth_batch.csv not found."
fi

echo
echo ">>> [3/4] Prompt files under ${OUT_DIR} (up to 10)…"
if [[ -d "${OUT_DIR}" ]]; then
  find "${OUT_DIR}" -maxdepth 2 -type f -name "*.txt" | head -n 10 || true
else
  echo "out/ directory not found."
fi

echo
echo ">>> [4/4] ZIP files in ${OUT_DIR}…"
if [[ -d "${OUT_DIR}" ]]; then
  ls -1 "${OUT_DIR}"/*.zip 2>/dev/null || echo "No ZIP files found."
else
  echo "out/ directory not found."
fi
