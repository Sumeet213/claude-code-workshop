#!/usr/bin/env bash
# Verify every demo in the workshop kit works on this machine.
# Run from repo root:  bash scripts/test_all.sh
# Costs ~$0.07 if you opt into the headless test (requires claude auth).

set -u
cd "$(dirname "$0")/.."

PASS=0
FAIL=0

pass() { printf "  \033[32m✓\033[0m %s\n" "$1"; PASS=$((PASS+1)); }
fail() { printf "  \033[31m✗\033[0m %s\n" "$1"; FAIL=$((FAIL+1)); }
info() { printf "  \033[33m·\033[0m %s\n" "$1"; }

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  Workshop kit verification"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# ── 1. Tools ─────────────────────────────────────────────────────────
echo "[1/5] Required tools"
command -v claude >/dev/null  && pass "claude ($(claude --version 2>&1 | head -1))" || fail "claude — install with: npm i -g @anthropic-ai/claude-code"
command -v jq     >/dev/null  && pass "jq ($(jq --version))"                       || fail "jq — install with: brew install jq"
command -v git    >/dev/null  && pass "git"                                         || fail "git"
command -v bat    >/dev/null  && pass "bat"                                         || info "bat not installed (cat fallback works)"

# ── 2. Module 5 — hook script ─────────────────────────────────────────
echo ""
echo "[2/5] Module 5 — hook fires on prod_*.yaml"

# Block path
out=$(echo '{"tool_input":{"file_path":"/x/prod_config.yaml"}}' | \
      bash module5_hooks/.claude/hooks/block-prod-writes.sh 2>&1)
ec=$?
if [ "$ec" = "2" ] && echo "$out" | grep -q "BLOCKED"; then
  pass "blocks prod_config.yaml (exit 2, BLOCKED message visible)"
else
  fail "expected exit 2 + BLOCKED message; got exit $ec"
fi

# Allow path
echo '{"tool_input":{"file_path":"/x/dev.yaml"}}' | \
  bash module5_hooks/.claude/hooks/block-prod-writes.sh >/dev/null 2>&1
ec=$?
[ "$ec" = "0" ] && pass "allows dev.yaml (exit 0)" || fail "expected exit 0 for non-prod; got $ec"

# Override path
out=$(PROD_OVERRIDE=1 bash -c \
  "echo '{\"tool_input\":{\"file_path\":\"/x/prod_config.yaml\"}}' | \
   bash module5_hooks/.claude/hooks/block-prod-writes.sh" 2>&1)
ec=$?
[ "$ec" = "0" ] && pass "PROD_OVERRIDE=1 allows prod write (exit 0)" || fail "override path; got $ec"

# ── 3. Module 7 — MCP server loads ────────────────────────────────────
echo ""
echo "[3/5] Module 7 — MCP server module loads"

if [ -x module7_mcp/.venv/bin/python ]; then
  if module7_mcp/.venv/bin/python -c "import sys; sys.path.insert(0, 'module7_mcp'); import oncall_server" 2>/dev/null; then
    pass "module7_mcp/.venv ready, oncall_server imports cleanly"
  else
    fail "oncall_server failed to import"
  fi

  # Verify settings.json points at the venv python (not /usr/bin/python3 which has no mcp).
  if grep -q ".venv/bin/python" module7_mcp/.claude/settings.json; then
    pass "module7_mcp/.claude/settings.json points at venv python"
  else
    fail "settings.json doesn't reference the venv — re-run scripts/setup.sh"
  fi
else
  fail "module7_mcp/.venv missing — run: bash scripts/setup.sh"
fi

# ── 4. Module 9 — headless demo (OPT-IN, costs money) ──────────────────
echo ""
echo "[4/5] Module 9 — headless quick_demo.sh"

if [ "${RUN_HEADLESS:-0}" = "1" ]; then
  info "running quick_demo.sh (this calls claude -p, ~5-30s, ~\$0.07)"
  out=$(bash module9_sdk/quick_demo.sh 2>&1)
  if echo "$out" | grep -q '"failing_test"'; then
    pass "quick_demo.sh returned valid JSON with failing_test field"
  else
    fail "quick_demo.sh did not produce expected JSON"
    echo "$out" | tail -10 | sed 's/^/      /'
  fi
else
  info "skipped (set RUN_HEADLESS=1 to actually call claude -p)"
fi

# ── 5. Sandbox repo seeded ────────────────────────────────────────────
echo ""
echo "[5/6] sandbox_repo (the shared exercise playground)"

[ -d sandbox_repo ] && pass "sandbox_repo present"                            || fail "sandbox_repo missing"
[ -f sandbox_repo/CLAUDE.md ] && pass "sandbox_repo/CLAUDE.md (bloated; for E3)" || fail "sandbox_repo/CLAUDE.md missing"
[ -f sandbox_repo/.claude/settings.json ] && pass "sandbox_repo/.claude/settings.json (holey; for E8)" || fail "settings.json missing"
[ -f sandbox_repo/src/db/migrations/0042_add_soft_delete.sql ] && pass "sandbox_repo migration 0042 (for E1)" || fail "migration missing"

if [ -d sandbox_repo/.git ]; then
  commits=$(cd sandbox_repo && git log --oneline 2>/dev/null | wc -l | tr -d ' ')
  if [ "$commits" -ge 6 ]; then
    pass "sandbox_repo git history seeded ($commits commits)"
  else
    fail "sandbox_repo has only $commits commits — re-run scripts/setup.sh"
  fi
  if (cd sandbox_repo && git rev-parse main-stable >/dev/null 2>&1); then
    pass "sandbox_repo main-stable branch present (for /standup)"
  else
    fail "main-stable branch missing — re-run scripts/setup.sh"
  fi
else
  fail "sandbox_repo/.git not initialised — run: bash scripts/setup.sh"
fi

# ── 6. Pre-built artifacts present ────────────────────────────────────
echo ""
echo "[6/6] Pre-built demo artifacts"

[ -f example2_parallel_review/OVERLAP.md ]                  && pass "M4 OVERLAP.md (3-reviewer table)"          || fail "M4 OVERLAP.md missing"
[ -f example2_parallel_review/code_under_review/users_api.js ] && pass "M4 users_api.js (flawed file)"          || fail "M4 flawed file missing"
[ -d module6_commands_skills/live_demo_with_skill ]         && pass "M6 live_demo_with_skill (32 files)"       || fail "M6 with-skill dir missing"
[ -d module6_commands_skills/live_demo_without_skill ]      && pass "M6 live_demo_without_skill (12 files)"    || fail "M6 without-skill dir missing"
[ -f module6_commands_skills/COMPARISON.md ]                && pass "M6 COMPARISON.md"                         || fail "M6 COMPARISON.md missing"

# Show files
[ -f WORKSHOP.html ]            && pass "WORKSHOP.html (trainer reference)"         || fail "WORKSHOP.html — run: bash scripts/render-show.sh"
[ -f SCRIPT.html ]              && pass "SCRIPT.html (read-through script)"        || fail "SCRIPT.html — run: bash scripts/render-show.sh"
[ -f EXERCISES.html ]           && pass "EXERCISES.html (project for participants)" || fail "EXERCISES.html — run: bash scripts/render-show.sh"
[ -f DEMO_COOKBOOK.html ]       && pass "DEMO_COOKBOOK.html (conductor playbook)"  || fail "DEMO_COOKBOOK.html — run: bash scripts/render-show.sh"

# ── Summary ───────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════════════"
if [ "$FAIL" = "0" ]; then
  printf "  \033[32m✓ all %d checks passed.\033[0m  Workshop kit is ready.\n" "$PASS"
else
  printf "  \033[31m✗ %d failed, %d passed.\033[0m  Fix above before the workshop.\n" "$FAIL" "$PASS"
fi
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "Manual checks the script can't automate (do once before the day):"
echo ""
echo "  M5 hook live:"
echo "    cd module5_hooks && claude"
echo "    > Update sample_files/prod_config.yaml — change host to test.local"
echo "    expect: red BLOCKED box visible"
echo ""
echo "  M7 MCP server live:"
echo "    cd module7_mcp && claude"
echo "    > /mcp"
echo "    expect: 'oncall' server listed with 2 tools"
echo "    > Who is on call for payments? Page them about the demo."
echo "    expect: claude calls get_oncall then page_oncall"
echo ""

[ "$FAIL" = "0" ]