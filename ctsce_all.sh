#!/usr/bin/env bash
# ============================================================
# CTSCE ALL-IN-ONE RUNNER (reconstructed)
# - 1) Rainbow graphics prompts (Paper/Tilt/Glide style stub)
# - 2) Grok batch prompts (if XAI_API_KEY present)
# - 3) Frontend-ready manifest via generate.js
# ============================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${ROOT_DIR}/out"

mkdir -p "${OUT_DIR}"

echo "[ctsce_all] 1/3 — rainbow graphics ..."
node "${ROOT_DIR}/generate.js" \
  --generator=graphics \
  --world=BH \
  --themes=bh_bureaucratic_shrine \
  --styles=surreal-propaganda-noir \
  --out="${OUT_DIR}/rainbow_graphics.json"

echo "[ctsce_all] 2/3 — grok batch (fallback if XAI_API_KEY missing) ..."
node "${ROOT_DIR}/generate.js" \
  --generator=grok \
  --world=BH \
  --themes=bh_bureaucratic_shrine \
  --styles=surreal-propaganda-noir \
  --mode=therapy-film \
  --num=10 \
  --out="${OUT_DIR}/grok_prompts_ctsce.json"

echo "[ctsce_all] 3/3 — frontend manifest stub ..."
node "${ROOT_DIR}/generate.js" \
  --generator=flux \
  --world=BH \
  --themes=bh_bureaucratic_shrine \
  --styles=surreal-propaganda-noir \
  --mode=frontend-manifest \
  --out="${OUT_DIR}/frontend_manifest.json"

echo "[ctsce_all] done. Files in ${OUT_DIR}"
