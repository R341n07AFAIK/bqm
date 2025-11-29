# BH Project — Surreal Propaganda Noir Myth‑Engine

A Node‑based generator for the **BH** world (rain‑slick bureaucratic shrines, neon‑lit ID temples, etc.) plus a **Tiefling / Psionic Dragonborn duet generator** (`synth.js`).  

## Quick‑start (local)

```bash
git clone <repo‑url>
cd bh-project

# install all deps (minimist + archiver)
npm install

# 1️⃣  Generate a duet batch (10 lines)
node synth.js duet 10 > synth_output.txt

# 2️⃣  Convert batch → CSV + per‑prompt txt + zip
node scripts/synth_to_batch.js --input=synth_output.txt --out=out \
    --flags="--ar 3:4 --v 6 --stylize 900"

# 3️⃣  Preview everything
scripts/preview_synth_batch.sh

# 4️⃣  Run the full BH export & Midjourney conversion
npm run full:run   # runs export → MJ CSV → per‑prompt zip → Codex archive
```

## What each script does

| Script | Purpose |
|-------|---------|
| `synth.js` | Generates Tiefling / Psionic Dragonborn duets (or solo prompts) with random archetypes, actions, environments, lighting, and quality tags. |
| `scripts/synth_to_batch.js` | Parses the numbered synth output, creates `out/synth_batch.csv`, writes one `.txt` per prompt, and zips them (`out/synth_prompts_<ts>.zip`). |
| `scripts/preview_synth_batch.sh` | Handy validator: shows raw output, CSV preview, list of export folders/zips, and the first prompt file. |
| `scripts/bh_export_full.sh` | Original BH engine exporter – builds tar.gz + zip + checksum + optional GitHub release. |
| `scripts/convert_to_midjourney.js` | Turns BH JSON output (`out/bh_prompts.json`) into Midjourney‑ready CSV/TXT. |
| `scripts/mj_batch_uploader.js` | Reads a Midjourney CSV and posts each line to a Discord webhook (dry‑run supported). |
| `codex.sh` | “One‑script‑to‑rule‑them‑all”: rainbow graphics, Grok therapy‑film batch, frontend manifest, then packs everything into a Codex archive. |
| CI (`.github/workflows/bh_export.yml`) | Runs the full pipeline on every push (`export → MJ conversion → per‑prompt zip → Codex`) and uploads all artefacts as a GitHub Actions artifact. |

## Adding reference PDFs / Docx

Place any large binary reference files (OIP PDFs, etc.) into the `ref/` folder.  
If the files exceed ~10 MiB, enable Git LFS (the `.gitattributes` line is already present). The export script automatically bundles everything from `ref/` into the final archive.

## Environment variables (for Discord upload)

```bash
export MJ_WEBHOOK_URL="https://discord.com/api/webhooks/…"
```

## License

UNLICENSED – feel free to fork and adapt for your own projects.  

---

Enjoy creating endless Tiefling‑Dragonborn duets and BH‑style cinematic prompts! 🎉🚀
