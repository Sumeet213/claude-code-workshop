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
echo "[1/7] Required tools"
command -v claude >/dev/null  && pass "claude ($(claude --version 2>&1 | head -1))" || fail "claude — install with: npm i -g @anthropic-ai/claude-code"
command -v jq     >/dev/null  && pass "jq ($(jq --version))"                       || fail "jq — install with: brew install jq"
command -v git    >/dev/null  && pass "git"                                         || fail "git"
command -v node   >/dev/null  && pass "node ($(node --version))"                    || fail "node — needed for day2_adlc (kata + evals)"
command -v bat    >/dev/null  && pass "bat"                                         || info "bat not installed (cat fallback works)"

# ── 2. Module 5 — hook script ─────────────────────────────────────────
echo ""
echo "[2/7] Module 5 — hook fires on prod_*.yaml"

# Block path
out=$(echo '{"tool_input":{"file_path":"/x/prod_config.yaml"}}' | \
      bash day1_advanced/hooks/.claude/hooks/block-prod-writes.sh 2>&1)
ec=$?
if [ "$ec" = "2" ] && echo "$out" | grep -q "BLOCKED"; then
  pass "blocks prod_config.yaml (exit 2, BLOCKED message visible)"
else
  fail "expected exit 2 + BLOCKED message; got exit $ec"
fi

# Allow path
echo '{"tool_input":{"file_path":"/x/dev.yaml"}}' | \
  bash day1_advanced/hooks/.claude/hooks/block-prod-writes.sh >/dev/null 2>&1
ec=$?
[ "$ec" = "0" ] && pass "allows dev.yaml (exit 0)" || fail "expected exit 0 for non-prod; got $ec"

# Override path
out=$(PROD_OVERRIDE=1 bash -c \
  "echo '{\"tool_input\":{\"file_path\":\"/x/prod_config.yaml\"}}' | \
   bash day1_advanced/hooks/.claude/hooks/block-prod-writes.sh" 2>&1)
ec=$?
[ "$ec" = "0" ] && pass "PROD_OVERRIDE=1 allows prod write (exit 0)" || fail "override path; got $ec"

# ── 3. Module 7 — MCP server loads ────────────────────────────────────
echo ""
echo "[3/7] Module 7 — MCP server module loads"

VENV_PY="day1_advanced/mcp/.venv/bin/python"
[ -x "$VENV_PY" ] || VENV_PY="day1_advanced/mcp/.venv/Scripts/python.exe"
if [ -x "$VENV_PY" ]; then
  if "$VENV_PY" -c "import sys; sys.path.insert(0, 'day1_advanced/mcp'); import oncall_server" 2>/dev/null; then
    pass "day1_advanced/mcp/.venv ready, oncall_server imports cleanly"
  else
    fail "oncall_server failed to import"
  fi

  # Verify settings.json points at the venv python (not /usr/bin/python3 which has no mcp).
  if grep -q ".venv" day1_advanced/mcp/.claude/settings.json; then
    pass "day1_advanced/mcp/.claude/settings.json points at venv python"
  else
    fail "settings.json doesn't reference the venv — re-run scripts/setup.sh"
  fi
else
  fail "day1_advanced/mcp/.venv missing — run: bash scripts/setup.sh"
fi

# ── 4. Module 9 — headless demo (OPT-IN, costs money) ──────────────────
echo ""
echo "[4/7] Module 9 — headless quick_demo.sh"

if [ "${RUN_HEADLESS:-0}" = "1" ]; then
  info "running quick_demo.sh (this calls claude -p, ~5-30s, ~\$0.07)"
  out=$(bash day2_adlc/headless/quick_demo.sh 2>&1)
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
echo "[5/7] sandbox_repo (the shared exercise playground)"

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

# ── 6. Day 2 ADLC assets ─────────────────────────────────────────────
echo ""
echo "[6/7] day2_adlc (specs, kata, evals, cicd, cloud, monitoring)"

[ -f day2_adlc/specs/SPEC_TEMPLATE.md ] && [ -f day2_adlc/specs/example_spec_export_endpoint.md ] \
  && pass "specs (template + example)" || fail "day2_adlc/specs files missing"

if command -v node >/dev/null && [ -f day2_adlc/tdd_kata/ratelimiter.test.js ]; then
  kata_out=$( (cd day2_adlc/tdd_kata && node --test 2>&1) )
  if echo "$kata_out" | grep -q "not implemented"; then
    pass "tdd_kata runs and starts red (stub not implemented — by design)"
  else
    fail "tdd_kata: expected red run mentioning 'not implemented' (was the stub solved and committed?)"
  fi
else
  fail "tdd_kata missing or node unavailable"
fi

if command -v node >/dev/null && [ -f day2_adlc/evals/check.js ]; then
  evals_out=$(node day2_adlc/evals/check.js 2>&1)
  ec=$?
  if [ "$ec" = "1" ] && echo "$evals_out" | grep -q "3/5 outputs pass"; then
    pass "evals check.js catches exactly the 2 seeded structural flaws"
  else
    fail "evals check.js: expected exit 1 with '3/5 outputs pass'; got exit $ec"
  fi
else
  fail "evals/check.js missing or node unavailable"
fi

[ -x day2_adlc/evals/judge.sh ] || [ -f day2_adlc/evals/judge.sh ] && pass "evals judge.sh present (live-run it once before Day 2)" || fail "evals/judge.sh missing"
[ -f day2_adlc/cicd/claude-pr-review.yml ] && [ -f day2_adlc/cicd/deploy-pipeline.yml ] \
  && pass "cicd workflow samples" || fail "day2_adlc/cicd YAMLs missing"
[ -f day2_adlc/cloud_aws/README.md ] && [ -f day2_adlc/monitoring/README.md ] \
  && pass "cloud_aws + monitoring notes" || fail "cloud_aws/monitoring README missing"
[ -f day2_adlc/crewai/crew_demo.py ] && pass "crewai demo present (pip install 'crewai[anthropic]' to run)" || fail "crewai demo missing"

# Trainer-only kickoff material (skipped in the public repo).
if [ -d day1_kickoff ]; then
  [ -f day1_kickoff/ICEBREAKER.md ] && [ -f day1_kickoff/wow_demo.md ] \
    && pass "day1_kickoff (icebreaker + wow demo)" || fail "day1_kickoff files missing"
fi

# ── 7. Pre-built artifacts present ────────────────────────────────────
echo ""
echo "[7/7] Pre-built demo artifacts"

[ -f day1_advanced/parallel_review/code_under_review/users_api.js ] && pass "E5 users_api.js (flawed file)"          || fail "E5 flawed file missing"

# Trainer-only pre-built reveals (absent in the public participant repo).
if [ -f trainer/SCRIPT.md ]; then
  [ -f day1_advanced/parallel_review/OVERLAP.md ]              && pass "E5 OVERLAP.md (3-reviewer answer key)"    || fail "E5 OVERLAP.md missing"
  [ -d day1_advanced/skills/live_demo_with_skill ]     && pass "skills live_demo_with_skill (32 files)"   || fail "with-skill dir missing"
  [ -d day1_advanced/skills/live_demo_without_skill ]  && pass "skills live_demo_without_skill (12 files)" || fail "without-skill dir missing"
  [ -f day1_advanced/skills/COMPARISON.md ]            && pass "skills COMPARISON.md"                     || fail "COMPARISON.md missing"
fi

# Show files — trainer-only HTMLs are skipped if the matching .md isn't here.
if [ -f trainer/SCRIPT.md ]; then
  [ -f DECK.html ]      && pass "DECK.html (slide deck, trainer-only: contains reveals)" || fail "DECK.html missing"
fi
[ -f EXERCISES.html ]   && pass "EXERCISES.html (project for room)"      || fail "EXERCISES.html — run: bash scripts/render-show.sh"
[ -f CAPSTONE.html ]    && pass "CAPSTONE.html (team capstone)"          || fail "CAPSTONE.html — run: bash scripts/render-show.sh"

# Trainer-only show files (only check if you're in the trainer repo).
if [ -f trainer/WORKSHOP.md ]; then [ -f trainer/WORKSHOP.html ] && pass "trainer/WORKSHOP.html (deep-dive reference)" || fail "trainer/WORKSHOP.html — run: bash scripts/render-show.sh"; fi
if [ -f trainer/SCRIPT.md ]; then [ -f trainer/SCRIPT.html ] && pass "trainer/SCRIPT.html" || fail "trainer/SCRIPT.html"; fi
if [ -f trainer/RUNBOOK.md ]; then [ -f trainer/RUNBOOK.html ] && pass "trainer/RUNBOOK.html" || fail "trainer/RUNBOOK.html"; fi

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
echo "    cd day1_advanced/hooks && claude"
echo "    > Update sample_files/prod_config.yaml — change host to test.local"
echo "    expect: red BLOCKED box visible"
echo ""
echo "  M7 MCP server live:"
echo "    cd day1_advanced/mcp && claude"
echo "    > /mcp"
echo "    expect: 'oncall' server listed with 2 tools"
echo "    > Who is on call for payments? Page them about the demo."
echo "    expect: claude calls get_oncall then page_oncall"
echo ""

[ "$FAIL" = "0" ]