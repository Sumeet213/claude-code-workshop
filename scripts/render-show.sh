#!/usr/bin/env bash
# Render the show-files to standalone HTML with big-font projection CSS.
# Run from the repo root: bash scripts/render-show.sh

set -e
cd "$(dirname "$0")/.."

CSS="scripts/show.css"
JS_SNIPPET=$(cat scripts/post.js)

render_md() {
  local src="$1"
  local out="${src%.md}.html"
  local title="$2"
  pandoc "$src" \
    --standalone \
    --metadata title="$title" \
    --highlight-style=breezedark \
    --css="$CSS" --self-contained \
    --include-after-body=<(printf '<script>\n%s\n</script>\n' "$JS_SNIPPET") \
    -o "$out"
  echo "  rendered $out"
}

render_txt_as_pre() {
  local src="$1"
  local out="${src%.txt}.html"
  local title="$2"
  # Wrap raw text in <pre> and feed through pandoc as HTML.
  {
    printf '<pre><code>'
    sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g' "$src"
    printf '</code></pre>\n'
  } | pandoc \
    --from html --to html \
    --standalone \
    --metadata title="$title" \
    --css="$CSS" --self-contained \
    --include-after-body=<(printf '<script>\n%s\n</script>\n' "$JS_SNIPPET") \
    -o "$out"
  echo "  rendered $out"
}

# Renders only files that exist, so the same script works in the public repo.
render_if_present() {
  [ -f "$1" ] && render_md "$1" "$2" || true
}

echo "rendering show files ..."
render_if_present "module2_anatomy/scenarios.md"                "Spot the lever"
render_if_present "module3_context/before_CLAUDE.md"            "Bloated CLAUDE.md (before surgery)"
render_if_present "module3_context/after_CLAUDE.md"             "Trimmed CLAUDE.md (after surgery)"
render_if_present "module3_context/SURGERY.md"                  "Surgery debrief"
render_if_present "example2_parallel_review/OVERLAP.md"         "Three reviewers, same file"
render_if_present "module6_commands_skills/COMPARISON.md"       "Skill comparison"
render_if_present "module5_hooks/RUN.md"                        "Hook demo run-book"
render_if_present "module7_mcp/RUN.md"                          "MCP server run-book"
render_if_present "module9_sdk/RUN.md"                          "Headless run-book"
render_if_present "day1_kickoff/ICEBREAKER.md"                  "Section 0 — Kickoff run sheet"
render_if_present "day2_adlc/tdd_kata/README.md"                "TDD kata"
render_if_present "day2_adlc/evals/README.md"                   "AI evals — three layers"
render_if_present "day2_adlc/cicd/README.md"                    "CI/CD with an agent in the loop"
render_if_present "day2_adlc/cloud_aws/README.md"               "Cloud development (AWS)"
render_if_present "day2_adlc/monitoring/README.md"              "Production monitoring for AI"
render_if_present "EXERCISES.md"                                "Hands-On Exercises (E1–E13)"
render_if_present "PARTICIPANT_SETUP.md"                        "Pre-flight setup for participants"
render_if_present "CAPSTONE.md"                                 "Capstone — teams of 4, one shipped thing"
render_if_present "RUNBOOK.md"                                  "Workshop Runbook"
render_if_present "WORKSHOP.md"                                 "Deep-Dive Reference"

# SCRIPT.md gets its own larger-font teleprompter CSS (trainer repo only).
if [ -f SCRIPT.md ]; then
  echo "  rendering SCRIPT.html (teleprompter style)"
  pandoc SCRIPT.md \
    --standalone \
    --metadata title="Trainer Script — 2-Day Workshop" \
    --highlight-style=breezedark \
    --css=scripts/script.css --self-contained \
    --include-after-body=<(printf '<script>\n%s\n</script>\n' "$JS_SNIPPET") \
    -o SCRIPT.html
  echo "  rendered SCRIPT.html"
fi

echo "rendering transcripts ..."
if [ -f module1_mental_model/transcripts/bad_prompt.txt ]; then
  render_txt_as_pre "module1_mental_model/transcripts/bad_prompt.txt"  "Bad prompt transcript"
fi
if [ -f module1_mental_model/transcripts/good_prompt.txt ]; then
  render_txt_as_pre "module1_mental_model/transcripts/good_prompt.txt" "Good prompt transcript"
fi

echo ""
echo "done. show files:"
find . -name "*.html" -not -name "WORKSHOP.html" -not -path "*/live_demo_*" | sort
