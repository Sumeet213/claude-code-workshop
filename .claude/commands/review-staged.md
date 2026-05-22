---
description: Senior-style review of git diff --cached
allowed-tools: Bash(git diff:*), Bash(git status:*), Read, Grep
---

Review staged changes for issues a senior reviewer would flag.

1. `git status -s` — see scope.
2. `git diff --cached` — see what's staged.
3. For any load-bearing file (migrations, auth, public APIs, config, anything in `src/db/`, `src/auth/`, `src/middleware/`), Read it fully — the diff alone hides context.

Output findings in this format (skip sections with no findings):

### Bugs
- **<file:line>** — <what's broken>. <one-line fix.>

### Security
- **<file:line>** — <vulnerability>. <why it matters or how to exploit.>

### Performance
- **<file:line>** — <regression>. <expected impact.>

### Style / nits
- **<file:line>** — <nit>.

Rules: cite file:line every time. Worst first within each section. Don't restate what the diff does — only what's wrong or missing. If there's nothing real, say "No blocking issues." and stop.
