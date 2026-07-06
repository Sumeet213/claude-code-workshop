#!/usr/bin/env bash
# Module 9 — headless one-shot demo.
# Pipe a fake test failure into `claude -p` and get back a structured JSON
# triage report in <30s. The same pattern wires into a GitHub Action.

set -e
cd "$(dirname "$0")"

INPUT=$(cat sample_test_failure.txt)

echo ">> calling claude -p (this will take ~15-30s) ..."

claude -p "$(cat <<PROMPT
You are a CI assistant called by GitHub Actions on a failing test.
The test output is below.

Produce ONLY a JSON object with these keys, no preamble, no trailing prose:
  failing_test:     string  — fully qualified name of the failing test
  hypothesis:       string  — one-paragraph guess at the root cause
  files_to_inspect: array of string — paths a human should open

If you cannot determine the failing test, return {"error": "<reason>"}.

--- TEST OUTPUT ---
$INPUT
--- END ---
PROMPT
)" \
  --max-turns 4 \
  --output-format json \
  > /tmp/claude-result.json

echo ""
echo ">> raw result envelope:"
cat /tmp/claude-result.json | jq -C '.' | head -40

echo ""
echo ">> extracted assistant message:"
cat /tmp/claude-result.json | jq -r '.result // .messages[-1].content // .'
