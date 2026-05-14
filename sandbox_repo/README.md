# sandbox_repo — the shared playground

> **This is the repo every workshop exercise runs in.** Same starting point on every laptop. Same bloated CLAUDE.md, same holey settings, same failing migration test, same git history. You'll bootstrap Claude inside this directory throughout the day.

## What it pretends to be

A small TypeScript Express backend for a fitness app called Stride. You're not going to run it — there's no `node_modules`, no working test runner. Claude will *read* the files and you'll watch how it behaves. **The lesson is in the prompts, not the test pass.**

## Layout

```
sandbox_repo/
├── README.md
├── package.json                       — declared deps, scripts
├── CLAUDE.md                          — bloated; trim this in M3
├── .claude/
│   └── settings.json                  — holey; audit this in M8
├── src/
│   ├── app.ts                         — Express bootstrap
│   ├── middleware/auth.ts             — has TOKEN_CACHE references (M1's good prompt scenario)
│   ├── routes/users.ts                — API routes
│   └── db/
│       └── migrations/
│           └── 0042_add_soft_delete.sql   — has `-- TODO` in Down; breaks rollback
└── tests/
    ├── routes/users.test.ts
    └── db/migration_0042.test.ts      — fails because of the TODO above
```

## Exercises that use this directory

| Module | Exercise | What you do |
|---|---|---|
| M1 | E1 — bad/good prompt | `cd sandbox_repo && claude` then ask it about the failing migration test |
| M3 | E3 — CLAUDE.md surgery | Trim this directory's `CLAUDE.md`, pair-trade |
| M5 | E5 — hook fires | Use `module5_hooks/` (its own self-contained dir) |
| M6 | E6 — ship a slash command | Add `.claude/commands/standup.md` here; run it against this git history |
| M7 | E7 — MCP server | Use `module7_mcp/` (its own self-contained dir) |
| M8 | E8 — audit settings | Open `.claude/settings.json` — it's deliberately full of holes |
| M9 | E9 — headless one-shot | Use `module9_sdk/quick_demo.sh` (its own dir) |
| Capstone B | augment a repo | Default target is this sandbox; if you have a real repo, use that instead |

## Why we don't use participants' own repos

- Not everyone has one cloned locally.
- Those who do have one might be working on something sensitive or auth-walled.
- "Real" repos vary wildly in size, language, and convention — exercises become uneven.
- Pre-staging the sandbox means the failures, bloat, and holes are *known and reproducible*, so the comparison across the room is real.

If you finish early and want to try the same exercise on your own repo, go for it — but **first** complete it here so we're all working from the same baseline.

## Git history

This directory has a deliberately seeded git history (a handful of fake commits across a few days) so M6's `/standup` slash command has something to summarise. Run `git log --oneline` inside `sandbox_repo` to see.
