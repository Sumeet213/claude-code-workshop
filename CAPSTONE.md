**A real artifact at the end.** Three phases.

Take a repo and Claude-ify it end-to-end. By the end it has a load-bearing CLAUDE.md, a committed hook, two slash commands you'll actually use, and a connected MCP server. **A real PR-able commit.**

**Default target:** `sandbox_repo/` — the pre-staged Express/TypeScript project everyone has on disk. Already a git repo with seeded history (via `scripts/setup.sh`), a bloated CLAUDE.md, and a holey settings.json.

**Or:** swap in a real repo on this laptop. The phases below are identical regardless of target.

## Phases

| Phase | What you ship |
|---|---|
| **P1 — Bootstrap** | `CLAUDE.md` + `.claude/settings.json` + first hook in your chosen repo |
| **P2 — Workflows** | Two slash commands (`/standup`, plus one of your choice) |
| **P3 — Tools** | One MCP server connection (oncall sample, OR a small local-CLI wrap) |

## P1 — Bootstrap

```bash
cd ~/workshop_demo/sandbox_repo
```

**Steps**
1. The bloated CLAUDE.md is already here. Cut bloat, keep load-bearing invariants. Aim for ≤40 lines.
2. The holey `.claude/settings.json` is already here too. Replace it with a tight allow-list (`pnpm test:*`, `pnpm lint:*`, `pnpm typecheck`, `git:*`, `gh:*`) and a paranoid deny-list (destructive shell, force-push, secret-file reads, the wrong package manager, curl-to-shell).
3. Add `.claude/hooks/block-migrations.sh` — a hook that blocks any `Edit` or `Write` whose `file_path` matches `src/db/migrations/*.sql`. Use `module5_hooks/.claude/hooks/block-prod-writes.sh` as the template.

**Verify:** `cd sandbox_repo && claude`, ask it to edit `src/db/migrations/0042_add_soft_delete.sql`. Hook fires.

## P2 — Workflows

Two slash commands you'll actually use.

**Pick two from this list, or invent your own:**

- `/standup` — summarises commits since `main`, uncommitted changes, open TODOs in the diff.
- `/pr-body` — generates a PR description from your branch's diff.
- `/explain-this` — given a file, explains what it does, where it's called, what it depends on.
- `/find-similar` — given a function, finds others in the repo with similar shape.
- `/review-staged` — reviews `git diff --cached` for issues before you commit.
- `/spike <topic>` — research mode: model lists 3-5 implementation options for a feature, no code.
- `/why-flaky <test>` — analyses a test history (via `git log -p`) for flakiness patterns.

Each lives in `.claude/commands/<name>.md`. Use the patterns from M6 — `allowed-tools` frontmatter, explicit step list, output contract.

**Verify:** run `/standup` (or whatever you picked). Iterate the prompt until the output is genuinely useful.

## P3 — Tools

**Two paths — pick one:**

**Path A: wire the workshop's oncall server.** Already configured in `module7_mcp/`. Adapt your `.claude/settings.json` to point at it. Verify with `/mcp`.

**Path B: wrap a local CLI as MCP.** Build a small MCP server wrapping one local CLI tool — `git`, `gh`, or `rg`. Two tools, structured returns. Use `module7_mcp/oncall_server.py` as the template.

**Stretch:** add a `PreToolUse` hook that requires confirmation for any *write-shaped* MCP tool.

## Take-home

Open a PR to your repo with all of the above. Title it "Add Claude Code workflow". Your team has a working starting point Monday morning.

---

## The hard one

Build a slash command that is genuinely hard to do well:

**`/safe-bump <package>`** — bump a dependency to the latest version. The command must:

1. Read the changelog between the currently-installed version and the latest.
2. Classify each changelog entry as **breaking**, **behavioural**, or **patch**.
3. Find every callsite in your repo that touches the affected APIs.
4. Output a verdict: is this bump safe? If not, what specifically needs to change first?

The obvious one-pass implementation is wrong. You'll find out whether you can prompt-engineer your way through, whether you need sub-agents, or whether the task actually wants a skill.
