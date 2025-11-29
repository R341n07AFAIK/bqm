 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/AGENTS.md b/AGENTS.md
new file mode 100644
index 0000000000000000000000000000000000000000..40fb1509d7925b15e36404822fe7f7839238e8d2
--- /dev/null
+++ b/AGENTS.md
@@ -0,0 +1,257 @@
+# **AGENTS.md**
+## **Agent Runtime Verification & Execution Rules for This Repository**
+
+This document defines how automated agents (Codex, MCP, CI runners, GitHub Actions, or any local automation) must verify, test, and safely execute this project’s operational scripts.  
+The goal is consistency, safety, and deterministic behavior across all environments.
+
+---
+
+# **1. Repository Integrity Requirements**
+
+Agents must not run any modification scripts unless the following conditions are true.
+
+### **1.1 Required directories**
+The repository must contain:
+
+```
+
+scripts/
+
+````
+
+and it must be writable.
+
+The `dist/` directory will be created automatically by scripts that need it.
+
+### **1.2 Required tools**
+
+Agents must confirm **all** of the following exist in PATH:
+
+| Tool        | Required | Purpose |
+|-------------|----------|---------|
+| `git`       | Yes | Repo init, commits, remote pushes |
+| `node`      | Yes | Execute project sources |
+| `npm`       | Yes | Build tooling |
+| `bash`      | Yes | Script execution |
+| `zip`       | Yes | Archive creation |
+| `gh`        | Optional | Auto-create GitHub repos |
+| `powershell`| Optional | Windows-specific scripts |
+
+If any required tool is missing, the agent must abort with a diagnostic.
+
+Agents must **not attempt workarounds** unless specified.
+
+---
+
+# **2. Script Verification Requirements**
+
+Every automation script must pass a deterministic “dry-run” validation step.
+
+## **2.1 `scripts/create_download_archive.sh`**
+The script must:
+
+- Be executable (`100755`).
+- Produce usage or error when invoked with illegal arguments.
+
+Validation:
+
+```bash
+bash scripts/create_download_archive.sh --help 2>/dev/null || true
+test -x scripts/create_download_archive.sh
+````
+
+## **2.2 `scripts/github_full_setup.sh`**
+
+Validation:
+
+```bash
+bash scripts/github_full_setup.sh --help 2>/dev/null || true
+test -x scripts/github_full_setup.sh
+```
+
+Must not attempt to initialize or push without parameters.
+
+## **2.3 PowerShell variants**
+
+Windows-based agents should verify:
+
+```powershell
+powershell -ExecutionPolicy Bypass -File scripts/create_download_archive.ps1 -Help
+powershell -ExecutionPolicy Bypass -File scripts/github_full_setup.ps1 -Help
+```
+
+These scripts must print usage guidance without performing real operations.
+
+---
+
+# **3. Git Sanity Tests**
+
+Agents must validate the git environment before running tasks.
+
+### **3.1 Valid git root**
+
+```bash
+git rev-parse --show-toplevel > /dev/null
+```
+
+If this fails, agents must create a repo:
+
+```bash
+git init
+git branch -M main
+```
+
+### **3.2 Clean remote configuration**
+
+Agents must confirm:
+
+```bash
+git remote -v
+```
+
+If no remote is configured, the agent must not push until directed.
+
+---
+
+# **4. Execution Path Tests**
+
+Scripts must be executed strictly from the repo root.
+
+### Valid:
+
+```bash
+./scripts/create_download_archive.sh
+./scripts/github_full_setup.sh <args>
+```
+
+### Invalid:
+
+```bash
+scripts/create_download_archive.sh
+scripts/github_full_setup.sh
+```
+
+Agents must ensure all `.sh` files under `scripts/` are executable:
+
+```bash
+chmod +x scripts/*.sh
+```
+
+---
+
+# **5. Environment Smoke Tests**
+
+Before any heavy operation (archive, GitHub push, compilation), agents must verify:
+
+### **5.1 Node works**
+
+```bash
+node -e "console.log('node-ok')"
+```
+
+### **5.2 npm works**
+
+```bash
+npm --version
+```
+
+### **5.3 git works**
+
+```bash
+git status --porcelain
+```
+
+---
+
+# **6. Archive Creation Test**
+
+Agents must be able to create a downloadable export.
+
+Command:
+
+```bash
+bash scripts/create_download_archive.sh
+```
+
+Then confirm:
+
+```bash
+[ -f dist/project_export.zip ]
+```
+
+If the archive does not exist or is zero bytes, automation must halt.
+
+---
+
+# **7. GitHub Full Setup Test**
+
+Before automation proceeds with SSH setup or GitHub repo creation, the agent must check:
+
+```bash
+bash scripts/github_full_setup.sh --help 2>/dev/null || true
+```
+
+Only when run with arguments may the script:
+
+* Generate SSH keys
+* Initialize repo (if missing)
+* Create GitHub repo via `gh`
+* Push state via SSH
+
+If invoked without arguments, the script must not mutate the environment.
+
+---
+
+# **8. Fail-Fast Behavior**
+
+If any of the following fail:
+
+* directory checks
+* tool presence
+* script executable tests
+* dry-run calls
+* environment sanity tests
+
+the agent must:
+
+* stop immediately
+* output a diagnostic error
+* perform **no changes** to the repo
+
+Agents must never attempt partial execution or fallbacks.
+
+---
+
+# **9. Agent Responsibility Summary**
+
+An agent is allowed to modify this repository only after confirming:
+
+* scripts exist and are executable
+* environment dependencies are met
+* git environment is valid
+* node and npm function
+* dry-run paths succeed
+
+If any condition is unmet → automation must halt.
+
+---
+
+# **10. Updates To This File**
+
+If new scripts are added, they must be declared here with:
+
+* filename
+* validation rules
+* required dependencies
+* expected runtime behavior
+
+## Agents must not modify this file unless explicitly told to do so.
+
+============================================================
+2) Do NOT modify any other files.
+=================================
+
+Only create or overwrite AGENTS.md with the content above. Do not change any other file.
+
+End of instructions.
+
 
EOF
)
