#!/usr/bin/env bash
# ============================================================
# CTSCE FULL EXPORT SCRIPT — reconstructed
# Packs rainbow + grok + manifest into a tar.gz bundle.
# ============================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${ROOT_DIR}/out"
EXPORT_DIR="${ROOT_DIR}/export"
BUNDLE_NAME="ctsce_full_export.tar.gz"

mkdir -p "${OUT_DIR}" "${EXPORT_DIR}"

"${ROOT_DIR}/scripts/ctsce_all.sh"

echo "[export_full] Packing bundle ..."
tar -C "${OUT_DIR}" -czf "${EXPORT_DIR}/${BUNDLE_NAME}" .

echo "[export_full] Ready: ${EXPORT_DIR}/${BUNDLE_NAME}"
