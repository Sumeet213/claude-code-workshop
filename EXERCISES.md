# Exercises — your turn

> **Same kit on every laptop. Same playground for every exercise.** Every "your turn" runs in `sandbox_repo/` — a pre-staged Express/TypeScript project with bloated CLAUDE.md, holey settings.json, a failing migration test, and seeded git history.

| # | Exercise | Duration | Where you run it |
|---|---|---|---|
| E1 | Bad prompt vs good prompt | 7 min | `cd sandbox_repo && claude` |
| E2 | Spot the lever (5 cards) | 10 min | Browser (`scenarios.html`) |
| E3 | CLAUDE.md surgery | 15 min | `sandbox_repo/CLAUDE.md` |
| E4 | Three sub-agents on one file | 15 min | `cd workshop_demo && claude` (root) |
| E5 | Hook fires on your laptop | 10 min | `cd module5_hooks && claude` |
| E6 | /standup against the sandbox | 10 min | `cd sandbox_repo && claude` |
| E7 | MCP server on your laptop | 12 min | `cd module7_mcp && claude` |
| E8 | Audit the holey settings.json | 8 min | `sandbox_repo/.claude/settings.json` |
| E9 | Headless one-shot, real JSON | 8 min | `bash module9_sdk/quick_demo.sh` |

---

## E1 — Bad prompt vs good prompt (7 min)

```bash
cd sandbox_repo
claude
```

In Claude, type the **bad** prompt:

```
> fix the failing migration test
```

Watch what happens for ~2 minutes. Notice every assumption the model makes.

Then `/clear` and type a **better** prompt — one that:
- Names the failing file precisely.
- Tells the model to read both the test AND what it's testing before deciding what's wrong.
- Forbids editing the test just to make it pass.
- Asks for plan mode and a surfaced root cause before any edits.

Run it. Watch again for ~2 minutes.

**Compare** with your neighbour: what was the most surprising difference between the two runs?

---

## E2 — Spot the lever (10 min)

Open `module2_anatomy/scenarios.html` in a browser. Five cards.

For each card:
1. Read the transcript. Decide which lever failed: **context, tools, permissions, or loop control**.
2. Commit to your answer.
3. Click reveal. Re-read the transcript with the answer in mind.

5/5 means you can already diagnose any failed Claude session. Most people get 3/5 on the first try.

---

## E3 — CLAUDE.md surgery (15 min)

```bash
cd sandbox_repo
bat CLAUDE.md   # the bloated one
```

**Solo (5 min):** trim `sandbox_repo/CLAUDE.md` to ≤40 lines. The instruction is:

> Only keep what the model can't derive from reading the code itself.

Save your trimmed version as `CLAUDE.md.trimmed`.

**Pair (8 min):** trade laptops with a neighbour. They cut yours further; you cut theirs. Defend or accept each cut.

**Reflect (2 min):** the cut you most disagreed with — and why.

> **Reset:** `git checkout CLAUDE.md` inside `sandbox_repo` restores the bloated original.

---

## E4 — Three sub-agents on one file (15 min)

Run from the workshop repo root (NOT sandbox_repo):

```bash
cd ~/workshop_demo
claude
```

Paste this prompt verbatim:

```
Spawn three sub-agents IN PARALLEL (in a single message) reviewing the
file example2_parallel_review/code_under_review/users_api.js:
  - Agent A: senior security engineer. Lane: injection, auth, secrets,
    SSRF, PII, DoS. Output to .review_security.md.
  - Agent B: senior backend engineer. Lane: event-loop blocking, error
    handling, validation, observability. Output to .review_quality.md.
  - Agent C: generalist. Find anything wrong. Output to .review_general.md.

Each must reference line numbers and severities. Each returns to me a
4-bullet summary, under 100 words.
```

**~5 min for the agents to run.**

**Compare in pairs:**
- Did your specialists go deep (payloads, attack chains)?
- Did your generalist catch anything that fell between the specialist lanes?
- Which review would you act on first?

---

## E5 — Hook fires on your laptop (10 min)

```bash
cd ~/workshop_demo/module5_hooks
claude
```

```
> Update sample_files/prod_config.yaml — change the database host to "yours.internal"
```

You should see a red BLOCKED box. Then `/exit`.

**Stretch:** add a SECOND hook to `.claude/settings.json` that blocks any `Bash` command containing the word `curl`. Use the existing hook script as your template — the JSON envelope's `.tool_input.command` is what you want to inspect.

---

## E6 — /standup against the sandbox (10 min)

```bash
cd ~/workshop_demo/sandbox_repo
mkdir -p .claude/commands
```

Create `.claude/commands/standup.md`. Make a slash-command that summarises your day's work:

- `allowed-tools` frontmatter restricting to `Bash(git:*)` and `Read`.
- Explicit step list (commits since `main-stable`, diff stats, TODOs in the diff).
- Output contract: named sections, capped length, no preamble.

```bash
claude
> /standup
```

> **Sandbox material:** `bash scripts/setup.sh` seeded `sandbox_repo` with backdated commits and a `main-stable` branch. Verify with `git log --oneline main-stable..HEAD` from inside `sandbox_repo`.

---

## E7 — MCP server on your laptop (12 min)

If `scripts/setup.sh` ran cleanly and you followed `module7_mcp/RUN.md`, this just works:

```bash
cd ~/workshop_demo/module7_mcp
claude
> /mcp
```

You should see `oncall` connected. Then:

```
> Who is on call for the search team? Page them about the workshop demo.
```

Watch Claude call both tools in order. Approve at the prompts.

```bash
cat pages.log
```

**Stretch:** add a third tool `list_teams()` to `oncall_server.py` that returns the known teams. Restart claude. Test it.

---

## E8 — Audit the holey settings.json (8 min)

```bash
cd ~/workshop_demo/sandbox_repo
bat .claude/settings.json    # holey on purpose
```

**Solo (5 min):** find as many problems as you can. Read each `allow` and `deny` rule and ask: *could this rule, as written, let through something I'd never approve in code review?*

**Pair (3 min):** the hole you would have shipped without noticing.

---

## E9 — Headless one-shot, real JSON (8 min)

```bash
cd ~/workshop_demo/module9_sdk
bash quick_demo.sh
```

JSON triage report appears in <30s. Read it.

**Pair-discuss:** in your day job, what would you wire `claude -p` into?
- Failing CI? (the demo)
- PR descriptions auto-generated from the diff?
- Daily summary of what your team merged?
- Triaging Sentry alerts?
- Something weirder?

---

## Closing — pick three commitments (5 min)

On a sticky note, write the three things you'll change in your workflow on Monday. **Three is the cap — more, you'll do none of them.** Hand it to a colleague. They follow up Friday.
