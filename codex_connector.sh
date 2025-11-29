(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
diff --git a/AGENTS.md b/AGENTS.md
new file mode 100644
index 0000000000000000000000000000000000000000..c30c211fba72ee30ddf1b85cccf5f4e63f580fef
--- /dev/null
+++ b/AGENTS.md
@@ -0,0 +1,86 @@
+# Project Agents
+
+This file describes the “agents” / roles that interact with this project, including the ChatGPT **Codex Connector**.
+
+The goal is to make it trivial for ChatGPT (and other tooling) to:
+- Ingest this repo as a project.
+- Understand the core entry points.
+- Run the right scripts without guesswork.
+
+---
+
+## 1. Codex Connector Agent (ChatGPT)
+
+**Role:**  
+The Codex Connector Agent is the ChatGPT-side “project brain” that:
+- Reads this repository tree.
+- Uses the configuration in `codex/codex_connector.config.json`.
+- Follows the summary and checks produced by `scripts/print_codex_summary.cjs`.
+
+**Responsibilities:**
+- Identify the core engines:
+  - `generate.js` (main generation entrypoint)
+  - `promptGenerators.js` (Grok / MJ / SD / Flux / graphics)
+  - `graphicsEngine.js` (Paper / Tilt / Glide, “rainbow graphics”)
+  - Any world configs under `config/worlds/**` (BH, OIP, etc.)
+- Use the existing scripts (e.g. `scripts/ctsce_all.sh`, export scripts) when running or extending the project.
+- Keep new code consistent with the existing style and file layout.
+
+**How Codex should start:**
+1. Run:
+   ```bash
+   node scripts/print_codex_summary.cjs
+   ```
+2. Read the printed summary to understand:
+   - Main commands
+   - Important files
+   - Any missing pieces / warnings
+3. Use that information as the anchor for further edits.
+
+---
+
+## 2. Local Operator (You)
+
+**Role:**  
+Human operator / owner of the myth-engine. Runs commands locally, decides when to install dependencies and when to commit changes.
+
+**Key commands:**
+- Inspect summary for Codex:
+  ```bash
+  node scripts/print_codex_summary.cjs
+  ```
+- Bash wrapper:
+  ```bash
+  ./scripts/codex_connector.sh
+  ```
+- PowerShell wrapper (Windows):
+  ```powershell
+  ./scripts/codex_connector.ps1
+  ```
+
+**Workflow for you:**
+1. Run the connector script once after any big project change.
+2. Commit updated `codex/` files (`codex_connector.config.json`, any future manifests).
+3. When attaching this repo to ChatGPT, mention:
+   - “Use `codex/codex_connector.config.json` and `scripts/print_codex_summary.cjs` as your map.”
+
+---
+
+## 3. Future Agents (Optional)
+
+You can extend this file later with:
+- **Export Agent** – handles packaging to `.zip` / `.tar.gz` for distribution.
+- **World Canon Agent** – maintains BH / OIP / hybrid lore manifests.
+- **Graphics Agent** – focuses only on Paper/Tilt/Glide and prompt style consistency.
+
+For now, the only hard requirement for Codex is:
+- `AGENTS.md` (this file)
+- `codex/codex_connector.config.json`
+- `scripts/print_codex_summary.cjs`
+
+If any of those are missing, Codex should create/fix them rather than guessing.
+
diff --git a/codex/CODEX_CONNECTOR.md b/codex/CODEX_CONNECTOR.md
new file mode 100644
index 0000000000000000000000000000000000000000..0b5851c7c053f759711aa080503d7a317a16b24f
--- /dev/null
+++ b/codex/CODEX_CONNECTOR.md
@@ -0,0 +1,107 @@
+# ChatGPT Codex Connector
+
+This directory defines how ChatGPT (via the Codex-style project connector) should understand and navigate this project.
+
+The connector has three pillars:
+
+1. **Config file** – `codex_connector.config.json`
+2. **Runtime summary script** – `../scripts/print_codex_summary.cjs`
+3. **Optional wrapper scripts** – `../scripts/codex_connector.sh` and `../scripts/codex_connector.ps1`
+
+The idea is:
+- Codex doesn’t need to “guess” what this project is.
+- There is a single canonical summary + list of important entry points.
+- Both you and ChatGPT can use the same hooks.
+
+---
+
+## Files
+
+### 1. `codex_connector.config.json`
+
+Static configuration for this repo, meant to be read by ChatGPT or other tooling.
+
+Key fields:
+- `projectName` – Human-readable project label.
+- `entryPoints` – Files Codex should treat as importan
