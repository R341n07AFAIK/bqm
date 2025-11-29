#!/usr/bin/env node
/**
 * patcher.js
 *
 * Simple patch orchestration script for this repo.
 *
 * Usage:
 *   node patcher.js --list
 *   node patcher.js --dry-run
 *   node patcher.js --apply
 *   node patcher.js --apply --force
 *
 * Conventions:
 *   - Looks for *.patch and *.diff files inside: <repo-root>/patches
 *   - Applies patches in sorted filename order.
 *   - Uses `git apply --3way` by default.
 *   - With --force, retries failed patches with --reject --whitespace=nowarn.
 */

import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

// ------------------------------------------------------------
// Path helpers
// ------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Treat repo root as the directory containing patcher.js
const ROOT_DIR = __dirname;
const PATCH_DIR = path.join(ROOT_DIR, "patches");
const LOG_FILE = path.join(ROOT_DIR, "PATCH_LOG.md");

// ------------------------------------------------------------
// CLI parsing
// ------------------------------------------------------------

const args = process.argv.slice(2);

const options = {
  apply: false,
  dryRun: false,
  force: false,
  list: false,
  help: false,
};

for (const arg of args) {
  switch (arg) {
    case "--apply":
      options.apply = true;
      break;
    case "--dry-run":
      options.dryRun = true;
      break;
    case "--force":
      options.force = true;
      break;
    case "--list":
      options.list = true;
      break;
    case "--help":
    case "-h":
    case "-?":
      options.help = true;
      break;
    default:
      console.warn(`Unknown option: ${arg}`);
      options.help = true;
      break;
  }
}

// If nothing meaningful was passed, show help.
if (
  !options.apply &&
  !options.dryRun &&
  !options.list &&
  !options.help
) {
  options.help = true;
}

// ------------------------------------------------------------
// Utility functions
// ------------------------------------------------------------

function printHeader(title) {
  console.log(`\n=== ${title} ===`);
}

function fail(message, code = 1) {
  console.error(`\n✖ ${message}`);
  process.exit(code);
}

function ensureGitRepo() {
  const gitDir = path.join(ROOT_DIR, ".git");
  if (!fs.existsSync(gitDir)) {
    fail(`.git directory not found in ${ROOT_DIR}. Are you in the repo root?`);
  }
}

function ensurePatchDir() {
  if (!fs.existsSync(PATCH_DIR)) {
    fail(`Patch directory not found: ${PATCH_DIR}`);
  }
}

function findPatchFiles() {
  ensurePatchDir();
  const entries = fs.readdirSync(PATCH_DIR, { withFileTypes: true });

  const files = entries
    .filter(
      (e) =>
        e.isFile() &&
        (e.name.endsWith(".patch") || e.name.endsWith(".diff"))
    )
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, "en"));

  return files.map((name) => path.join(PATCH_DIR, name));
}

function runGit(args, opts = {}) {
  const result = spawnSync("git", args, {
    cwd: ROOT_DIR,
    stdio: opts.capture ? "pipe" : "inherit",
    encoding: "utf8",
  });

  if (opts.capture) {
    return result;
  }

  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

function logPatchResult(patchPath, status, mode) {
  const rel = path.relative(ROOT_DIR, patchPath);
  const now = new Date().toISOString();

  const line = `- ${now} — \`${rel}\` — **${status}** (${mode})\n`;

  try {
    if (!fs.existsSync(LOG_FILE)) {
      const header = "# Patch Log\n\n";
      fs.writeFileSync(LOG_FILE, header + line, "utf8");
    } else {
      fs.appendFileSync(LOG_FILE, line, "utf8");
    }
  } catch (err) {
    console.warn(`⚠ Failed to write patch log: ${err.message}`);
  }
}

// ------------------------------------------------------------
// Core patch application logic
// ------------------------------------------------------------

function applyPatch(patchPath, { dryRun, force }) {
  const rel = path.relative(ROOT_DIR, patchPath);
  const mode = dryRun ? "dry-run" : force ? "apply+force" : "apply";

  console.log(`\n→ Processing patch: ${rel} [${mode}]`);

  // First attempt: standard 3-way apply
  const baseArgs = ["apply", "--3way"];

  if (dryRun) {
    baseArgs.push("--check");
  }

  const args = [...baseArgs, rel];

  const result = runGit(args, { capture: true });

  if (result.status === 0) {
    console.log(`✔ ${dryRun ? "Patch would apply cleanly" : "Patch applied"}: ${rel}`);
    logPatchResult(patchPath, dryRun ? "CHECK_OK" : "APPLIED", mode);
    return;
  }

  console.warn(`⚠ Primary apply failed for ${rel}`);
  if (result.stderr) {
    console.warn(result.stderr.trim());
  }

  if (!force || dryRun) {
    // In dry-run or non-force mode, we stop here.
    logPatchResult(patchPath, "FAILED", mode);
    fail(`Patch failed: ${rel}`);
  }

  // Force mode: attempt a more permissive apply with rejects
  console.log(`… retrying with --reject --whitespace=nowarn (force mode)`);

  const forceArgs = [
    "apply",
    "--reject",
    "--whitespace=nowarn",
    rel,
  ];

  const forceResult = runGit(forceArgs, { capture: true });

  if (forceResult.status === 0) {
    console.log(`✔ Patch applied with rejects: ${rel}`);
    console.log(
      "   → Check *.rej files and resolve conflicts manually."
    );
    logPatchResult(patchPath, "APPLIED_WITH_REJECTS", mode);
    return;
  }

  console.error(`✖ Forced apply still failed for ${rel}`);
  if (forceResult.stderr) {
    console.error(forceResult.stderr.trim());
  }

  logPatchResult(patchPath, "FORCE_FAILED", mode);
  fail(`Patch failed irrecoverably: ${rel}`);
}

// ------------------------------------------------------------
// Mode handlers
// ------------------------------------------------------------

function showHelp() {
  console.log(`
Usage:
  node patcher.js --list
      List all detected patches in ./patches

  node patcher.js --dry-run
      Run "git apply --3way --check" for each patch, abort on first failure.

  node patcher.js --apply
      Apply all patches with "git apply --3way", abort on first failure.

  node patcher.js --apply --force
      Apply all patches with "git apply --3way".
      If a patch fails, retry with:
        git apply --reject --whitespace=nowarn
      Leaves *.rej hunks for manual resolution.

Conventions:
  - Repo root is the directory containing patcher.js
  - Patches live in: ./patches
  - Supported extensions: *.patch, *.diff
  - Writes a simple log to: PATCH_LOG.md
`);
}

function listPatches() {
  ensureGitRepo();
  const patches = findPatchFiles();

  printHeader("Available patches");
  if (patches.length === 0) {
    console.log(`(none found in ${path.relative(ROOT_DIR, PATCH_DIR)})`);
    return;
  }

  for (const p of patches) {
    console.log("•", path.relative(ROOT_DIR, p));
  }
}

function runDryRun() {
  ensureGitRepo();
  const patches = findPatchFiles();

  printHeader("Dry run");
  if (patches.length === 0) {
    console.log("No patches to check.");
    return;
  }

  for (const patch of patches) {
    applyPatch(patch, { dryRun: true, force: false });
  }

  console.log("\n✅ All patches would apply cleanly.");
}

function runApply(force) {
  ensureGitRepo();
  const patches = findPatchFiles();

  printHeader(force ? "Apply (force mode)" : "Apply");
  if (patches.length === 0) {
    console.log("No patches to apply.");
    return;
  }

  for (const patch of patches) {
    applyPatch(patch, { dryRun: false, force });
  }

  console.log("\n✅ All patches applied.");
}

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------

if (options.help) {
  showHelp();
  process.exit(0);
}

if (options.list) {
  listPatches();
}

if (options.dryRun) {
  runDryRun();
}

if (options.apply) {
  runApply(options.force);
}
