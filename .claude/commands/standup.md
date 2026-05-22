---
description: Standup summary from git activity
allowed-tools: Bash(git log:*), Bash(git diff:*), Bash(git status:*)
argument-hint: [base-ref]
---

Base ref: $ARGUMENTS

If $ARGUMENTS is empty, use `main` as the base ref.

Run these and use the output to produce the summary:

- `git log --oneline <base-ref>..HEAD`
- `git diff --stat <base-ref>..HEAD`
- `git status -s`

Produce exactly four sections, max 5 bullets each. No preamble, no closing line.

### Since last sync
- bullets, one per logical chunk (not one per commit)

### In progress
- uncommitted or half-done work

### Blockers
- TODOs / unknowns / external waits; "none" if none

### Today
- 1-3 next things based on the in-progress state
