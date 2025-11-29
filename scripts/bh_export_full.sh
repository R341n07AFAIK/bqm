#!/usr/bin/env bash
# ============================================================
# BH EXPORT FULL — ARCHIVE BUILDER
# - Optional: runs BH generator if generate.js exists
# - Bundles out/ + ref/ into export/ tar.gz + zip
# - Writes SHA256 checksum
# ============================================================

set -euo pipefail

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd tar
require_cmd zip
require_cmd sha256sum

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

OUT_DIR="${ROOT_DIR}/out"
REF_DIR="${ROOT_DIR}/ref"
EXPORT_DIR="${ROOT_DIR}/export"

mkdir -p "${OUT_DIR}" "${EXPORT_DIR}"

timestamp() {
  date +"%Y%m%d_%H%M%S"
}

echo ">>> [BH] Optional prompt generation…"
if [[ -f "${ROOT_DIR}/generate.js" ]]; then
  if command -v node >/dev/null 2>&1; then
    node generate.js --generator=bh --world=BH --themes=bh_bureaucratic_shrine --styles=surreal-propaganda-noir || \
      echo "generate.js run failed; continuing with existing out/." >&2
  else
    echo "Node.js not found; skipping BH prompt generation." >&2
  fi
else
  echo "generate.js not found; skipping BH prompt generation."
fi

ARCHIVE_BASE="bh_export_$(timestamp)"
TAR_PATH="${EXPORT_DIR}/${ARCHIVE_BASE}.tar.gz"
ZIP_PATH="${EXPORT_DIR}/${ARCHIVE_BASE}.zip"
SHA_PATH="${EXPORT_DIR}/${ARCHIVE_BASE}.sha256"

echo ">>> Building tar.gz archive…"
tar -czf "${TAR_PATH}" \
  out \
  $( [[ -d "${REF_DIR}" ]] && echo "ref" || true ) \
  README.md \
  package.json

echo ">>> Building zip archive…"
(
  cd "${ROOT_DIR}"
  zip -r "${ZIP_PATH}" \
    out \
    $( [[ -d "${REF_DIR}" ]] && echo "ref" || true ) \
    README.md \
    package.json >/dev/null
)

echo ">>> Writing SHA256 checksum…"
sha256sum "${TAR_PATH}" "${ZIP_PATH}" > "${SHA_PATH}"

echo ">>> Export complete:"
echo "    ${TAR_PATH}"
echo "    ${ZIP_PATH}"
echo "    ${SHA_PATH}"
