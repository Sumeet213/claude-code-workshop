#!/usr/bin/env bash
# Layer 2: LLM-as-judge. Shows the judge the SOURCE ticket + the output + a
# rubric, demands a JSON verdict. Usage:
#   bash judge.sh                      # judge every output
#   bash judge.sh outputs/output_4.json  # judge one
set -euo pipefail
cd "$(dirname "$0")"

command -v claude >/dev/null || { echo "claude CLI not found" >&2; exit 1; }
command -v jq >/dev/null || { echo "jq not found" >&2; exit 1; }

judge_one() {
  local out_file="$1"
  local ticket_file
  # Pull the ticket reference out of the output; fall back for invalid JSON.
  ticket_file=$(jq -r '.ticket // empty' "$out_file" 2>/dev/null || true)
  if [ -z "$ticket_file" ] || [ ! -f "tickets/$ticket_file" ]; then
    echo "$(basename "$out_file"): SKIPPED — structurally broken (layer 1 should have caught this)"
    return
  fi

  local verdict
  verdict=$(claude -p --max-turns 1 --output-format text <<EOF
You are an evaluation judge for a ticket-summarization system.

RUBRIC — judge ONLY against the source ticket below:
1. faithful: every claim in the summary must appear in the ticket. Any invented
   detail (amounts, dates, requests the customer never made) = unfaithful.
2. sentiment must match the ticket's actual tone.
3. score 1-5: 5 = faithful + complete + correct labels; subtract for each miss.

SOURCE TICKET:
$(cat "tickets/$ticket_file")

SYSTEM OUTPUT UNDER EVALUATION:
$(cat "$out_file")

Respond with ONLY this JSON, no prose, no code fences:
{"faithful": true|false, "score": 1-5, "reason": "<one sentence>"}
EOF
  )
  echo "$(basename "$out_file"): $verdict"
}

if [ $# -ge 1 ]; then
  judge_one "$1"
else
  for f in outputs/*.json; do
    judge_one "$f"
  done
fi
