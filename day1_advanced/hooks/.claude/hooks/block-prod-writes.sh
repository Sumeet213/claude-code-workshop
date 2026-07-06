#!/usr/bin/env bash
# PreToolUse hook on Write|Edit.
# Blocks writes to any file matching prod_*.yaml or prod_*.yml.
# Logs every check to .claude/hook-debug.log so silent failures are visible.
#
# Workshop demo for Module 5. Walk the room through:
#   1. Reads JSON from stdin (Claude Code passes the tool call envelope).
#   2. Pulls the target file_path with jq.
#   3. Pattern-matches; on hit, writes a useful "why + how to override"
#      message to stderr and exits 2 (block).
#   4. Otherwise exits 0 (allow).

set -u

LOG_DIR="$(dirname "$0")/.."
mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/hook-debug.log"

INPUT=$(cat)
echo "[$(date -u +%FT%TZ)] block-prod-writes input=$INPUT" >> "$LOG" 2>/dev/null

# Extract the target path. jq is the right tool here; if it's not
# installed we fall back to grep so the hook still works.
if command -v jq >/dev/null 2>&1; then
  TARGET=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
else
  TARGET=$(echo "$INPUT" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]+"' | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
fi

# The actual rule: prod_*.yml or prod_*.yaml anywhere in the path.
if echo "$TARGET" | grep -qE '(^|/)prod_[^/]*\.(yml|yaml)$'; then
  if [ "${PROD_OVERRIDE:-0}" = "1" ]; then
    # Allow with audit trail.
    echo "[$(date -u +%FT%TZ)] PROD_OVERRIDE allowed write to $TARGET" >> "$LOG"
    exit 0
  fi
  cat <<EOF >&2

╔══════════════════════════════════════════════════════════════════╗
║  BLOCKED by .claude/hooks/block-prod-writes.sh                   ║
╠══════════════════════════════════════════════════════════════════╣
║  File:    $TARGET
║  Reason:  This file matches prod_*.yaml — production config
║           changes require human PR review, not agent edits.
║  Override: rerun this session with  PROD_OVERRIDE=1 claude
╚══════════════════════════════════════════════════════════════════╝

EOF
  exit 2
fi

exit 0
