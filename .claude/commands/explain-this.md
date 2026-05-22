---
description: Explain a file — purpose, control flow, callers, history
allowed-tools: Read, Grep, Glob, Bash(git log:*)
argument-hint: <path/to/file>
---

Explain the file at: $ARGUMENTS

Steps:

1. Read $ARGUMENTS in full.
2. Grep the repo for imports/references to its exports — find callers.
3. List what it imports, especially internal modules.
4. `git log --oneline -10 -- $ARGUMENTS` for recent history.

Output:

### Purpose
<2-3 sentences. What problem does this file solve?>

### How it works
<3-6 bullets walking through the main flow. Reference functions by name. Don't reproduce code — explain control flow.>

### Who calls it
<list call sites with `path:line`. If only tests, say so.>

### Depends on
<internal modules it imports, one-line note for each.>

### Recent changes
<one line per recent commit that touched this file. Skip if just "initial commit".>

### Gotchas
<non-obvious invariants, error paths, perf characteristics. Skip if none.>

If the file is empty or doesn't exist, say so and stop.
