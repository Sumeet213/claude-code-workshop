# Capstone — Claude-augment a repo

> **2 hours, four phases of 30 min each, real artifact at the end.** Works for any attendee with just a laptop and the workshop repo — no internal systems, no corporate auth, no "I'd love to but my team uses X" excuses.

> **Take a repo and Claude-ify it end-to-end.** By 19:00 it has a load-bearing CLAUDE.md, two committed hooks, two slash commands you'll use, and one headless workflow. **Real PR-able commit.**

> **The default target is `sandbox_repo/`** — the pre-staged Express/TypeScript project everyone has on disk. It's already a git repo with seeded history (via `scripts/setup.sh`). It has the bloated CLAUDE.md and holey settings.json you saw in M3 and M8. **You're going to fix all of it end-to-end.**
>
> **Upgrade path:** if you have a real repo on this laptop you'd rather work on, swap it in. The phases below are identical regardless of target.

## Phases

| Time | Phase | What you ship |
|---|---|---|
| 17:00 – 17:30 | **P1 — Bootstrap** | `CLAUDE.md` + `.claude/settings.json` + first hook in your chosen repo |
| 17:30 – 18:00 | **P2 — Workflows** | Two slash commands (`/standup`, plus one of your choice) |
| 18:00 – 18:30 | **P3 — Tools** | One MCP server connection (oncall sample, OR a small local-CLI wrap) |
| 18:30 – 19:00 | **P4 — Headless** | One `claude -p` script in `scripts/` you'd actually run weekly |

## P1 — Bootstrap

```bash
cd ~/workshop_demo/sandbox_repo
```

**Steps**
1. The bloated CLAUDE.md is already here. Cut bloat, keep load-bearing invariants. Aim for ≤40 lines. (If you went through E3, start from your trimmed version.)
2. The holey `.claude/settings.json` is already here too. Replace it with a tight allow-list (`pnpm test:*`, `pnpm lint:*`, `pnpm typecheck`, `git:*`, `gh:*`) and a paranoid deny-list (destructive shell, force-push, secret-file reads, the wrong package manager, curl-to-shell).
3. Add `.claude/hooks/block-migrations.sh` — a hook that blocks any `Edit` or `Write` whose `file_path` matches `src/db/migrations/*.sql`. Use `module5_hooks/.claude/hooks/block-prod-writes.sh` as the template.

**Verify:** `cd sandbox_repo && claude`, ask it to edit `src/db/migrations/0042_add_soft_delete.sql`. Hook fires.

## P2 — Workflows

**Goal:** two slash commands you'll actually use.

**Pick two from this list, or invent your own (all work locally, no auth):**

- `/standup` — summarises commits since `main`, uncommitted changes, open TODOs in the diff.
- `/pr-body` — generates a PR description from your branch's diff.
- `/explain-this` — given a file, explains what it does, where it's called, what it depends on.
- `/find-similar` — given a function, finds others in the repo with similar shape.
- `/review-staged` — reviews `git diff --cached` for issues before you commit.
- `/spike <topic>` — research mode: model lists 3-5 implementation options for a feature, no code.
- `/why-flaky <test>` — analyses a test history (via `git log -p`) for flakiness patterns.

Each lives in `.claude/commands/<name>.md`. Use the bad/good prompt patterns from M6 — `allowed-tools` frontmatter, explicit step list, output contract.

**Verify:** run `/standup` (or whatever you picked). Iterate the prompt until the output is genuinely useful.

## P3 — Tools

**Two paths — pick one:**

**Path A: wire the workshop's oncall server (5 min).** Already configured in `module7_mcp/`. Adapt your `.claude/settings.json` to point at it. Verify with `/mcp`. Trivial; lets you focus on P4.

**Path B: wrap a local CLI as MCP (25 min).** Build a small MCP server wrapping one local CLI tool — `git`, `gh`, or `rg`. Two tools, structured returns. Use `module7_mcp/oncall_server.py` as the template. Universal — every laptop has these CLIs.

**Stretch:** add a `PreToolUse` hook that requires confirmation for any *write-shaped* MCP tool.

## P4 — Headless

**Goal:** one `claude -p` script in `scripts/` you'd cron, slack-bot, or hook into git.

**All of these work locally, no external auth:**

- `pre-commit-review.sh` — runs `claude -p` on `git diff --cached`, prints findings, exits non-zero on critical. Wire as `.git/hooks/pre-commit`.
- `daily-summary.sh` — summarises yesterday's merges (from `git log`), prints to terminal.
- `explain-failure.sh` — runs `claude -p` on a failing test log, outputs a structured JSON triage report.
- `commit-msg.sh` — generates a conventional commit message from `git diff --cached`.

**Hardening:** all of the same — `--max-turns N`, `--permission-mode plan`, `--output-format json`, `jq -e` validation, cost cap.

## Show-and-tell

**60 seconds each:** "this is my CLAUDE.md, this is the hook I added, this is the slash command I'll run tomorrow morning, this is the headless script I'll cron." Open the actual files on screen.

**Take-home:** open a PR to your repo with all of the above. Title it "Add Claude Code workflow". Your team has a working starting point Monday morning.

---

# Common rules

- **Phase boundaries are real.** Don't skip ahead.
- **Show-and-tell at 18:30 is non-negotiable.** That's when the workshop's lessons land.
- **Stretch goals exist for fast finishers.** No idle waiting.
- **Three things commitment at the end** — same as the workshop's main close. Sticky notes, partner follows up Friday.

The thesis the capstone proves: **you spent the day learning a tool. The capstone is where you used it to ship infrastructure your team is going to keep using long after you forget the workshop.**
