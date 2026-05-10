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

echo "rendering show files ..."
render_md "module2_anatomy/scenarios.md"                "M2 — Spot the lever"
render_md "module3_context/before_CLAUDE.md"            "M3 — Bloated CLAUDE.md (before surgery)"
render_md "module3_context/after_CLAUDE.md"             "M3 — Trimmed CLAUDE.md (after surgery)"
render_md "module3_context/SURGERY.md"                  "M3 — Surgery debrief"
render_md "example2_parallel_review/OVERLAP.md"         "M4 — Three reviewers, same file"
render_md "module6_commands_skills/COMPARISON.md"       "M6 — Skill comparison"
render_md "module5_hooks/RUN.md"                        "M5 — Hook demo run-book"
render_md "module7_mcp/RUN.md"                          "M7 — MCP server run-book"
render_md "module9_sdk/RUN.md"                          "M9 — Headless run-book"
render_md "EXERCISES.md"                                "Workshop Exercises (your turn)"
render_md "PARTICIPANT_SETUP.md"                        "Pre-flight setup for participants"
render_md "DEMO_COOKBOOK.md"                            "Conductor Cookbook (trainer)"
render_md "CAPSTONE.md"                                 "Capstone — ship a CI triage bot"
render_md "START_HERE.md"                               "Start Here"
render_md "RUNBOOK.md"                                  "Workshop Runbook"

# SCRIPT.md gets its own larger-font teleprompter CSS.
echo "  rendering SCRIPT.html (teleprompter style)"
pandoc SCRIPT.md \
  --standalone \
  --metadata title="Trainer Script" \
  --highlight-style=breezedark \
  --css=scripts/script.css --self-contained \
  --include-after-body=<(printf '<script>\n%s\n</script>\n' "$JS_SNIPPET") \
  -o SCRIPT.html
echo "  rendered SCRIPT.html"

echo "rendering transcripts ..."
render_txt_as_pre "module1_mental_model/transcripts/bad_prompt.txt"  "M1 — Bad prompt transcript"
render_txt_as_pre "module1_mental_model/transcripts/good_prompt.txt" "M1 — Good prompt transcript"

echo ""
echo "done. show files:"
find . -name "*.html" -not -name "WORKSHOP.html" -not -path "*/live_demo_*" | sort
