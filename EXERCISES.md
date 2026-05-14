# Exercises — your turn (everyone has Claude open)

> **Same kit on every laptop. Same playground for every exercise.** Every "your turn" runs in `sandbox_repo/` — a pre-staged Express/TypeScript project with bloated CLAUDE.md, holey settings.json, a failing migration test, and seeded git history. No "I don't have a repo" excuses; no permission landmines on your day-job code.

| Time | Exercise | Duration | Where you run it |
|---|---|---|---|
| 09:30 | E1 — Bad prompt vs good prompt | 7 min | `cd sandbox_repo && claude` |
| 10:15 | E2 — Spot the lever (5 cards) | 10 min | Browser (`scenarios.html`) |
| 11:15 | E3 — CLAUDE.md surgery | 15 min | `sandbox_repo/CLAUDE.md` |
| 12:15 | E4 — Three sub-agents on one file | 15 min | `cd workshop_demo && claude` (root) |
| 14:15 | E5 — Hook fires on YOUR laptop | 10 min | `cd module5_hooks && claude` |
| 15:15 | E6 — /standup against the sandbox | 10 min | `cd sandbox_repo && claude` |
| 16:15 | E7 — MCP server on YOUR laptop | 12 min | `cd module7_mcp && claude` |
| 17:05 | E8 — Audit the holey settings.json | 8 min | `sandbox_repo/.claude/settings.json` |
| 17:35 | E9 — Headless one-shot, real JSON | 8 min | `bash module9_sdk/quick_demo.sh` |

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

Watch what happens. **2 minutes.** The model will probably try to edit something (the migration, the test, both) without checking which one is wrong. Watch your tool calls.

Then `/clear` and type the **good** prompt:

```
> The migration test in tests/db/migration_0042.test.ts is failing.
  Read the test first. Read the migration file it tests. Figure out
  which one is wrong — don't assume the migration is correct just
  because tests are easier to "fix." Use plan mode. Don't edit
  anything yet; surface a plan with the root cause.
```

Watch again. **2 minutes.** *(Spoiler — the migration's Down block contains just `-- TODO`; the test correctly catches this.)*

**Round-room (3 min):** one sentence each — what was the most surprising difference between the two runs?

---

## E2 — Spot the lever (10 min)

The trainer projects `module2_anatomy/scenarios.html`. **5 cards. Per card:**

1. Read the transcript. Decide which lever failed: context, tools, permissions, or loop control.
2. **Vote by hand-raise** when the trainer calls each lever name.
3. Trainer clicks reveal. Discuss for 30 seconds.

**Score on the whiteboard.** 5/5 = "diagnostician of the day" badge.

---

## E3 — CLAUDE.md surgery (15 min)

```bash
cd sandbox_repo
bat CLAUDE.md   # the bloated one, ~130 lines
```

**5 min — solo:**

Trim `sandbox_repo/CLAUDE.md` to ≤40 lines. Apply the rules from `module3_context/SURGERY.html`:
- Cut anything obvious from reading the code.
- Cut empty platitudes ("write good code").
- Cut style enforced by lint/format.
- Cut volatile state ("Sprint 23, Maya is on X").
- Cut credentials or paths to credentials.

Save your trimmed version as `CLAUDE.md.trimmed` (so we can diff against the original at the end).

**8 min — pair:**

Trade laptops with your neighbour. **They** cut your trimmed version further; **you** cut theirs. Defend or accept each cut.

**2 min — pick one:** the cut you most disagreed with. Round-room shares.

> **Reset your sandbox after:** if you want to start fresh on the original bloated version, run `git checkout CLAUDE.md` inside `sandbox_repo`.

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

**~5 min for the agents to run.** While they run, read `example2_parallel_review/OVERLAP.html` on your own.

**Compare in pairs (5 min):**
- Did your specialists find depth (payloads, attack chains)?
- Did your generalist find the route-ordering bug?
- How is your output different from `OVERLAP.html`?

**Round-room (2 min):** one takeaway each.

---

## E5 — Hook fires on your laptop (10 min)

```bash
cd ~/workshop_demo/module5_hooks
claude
```

```
> Update sample_files/prod_config.yaml — change the database host to "yours.internal"
```

You should see a red BLOCKED box. **Show your neighbour.** Then `/exit`.

**Stretch (5 min) — race:** Add a SECOND hook to `.claude/settings.json` that blocks any `Bash` command containing the word `curl`. First three people to demo it working in front of the room win.

Hint:
```json
"PreToolUse": [
  { "matcher": "Bash", "hooks": [...] }
]
```
And your hook script reads the JSON envelope's `.tool_input.command`.

---

## E6 — /standup against the sandbox (10 min)

```bash
cd ~/workshop_demo/sandbox_repo
mkdir -p .claude/commands
```

Create `.claude/commands/standup.md`. Crib from the good slash-command patterns in `WORKSHOP.html` M6:

- `allowed-tools` frontmatter restricting to `Bash(git:*)` and `Read`.
- Explicit step list: list commits since `main-stable`, show diff stats, find TODOs in the diff.
- Output contract: four named sections, capped length, no preamble.

```bash
claude
> /standup
```

**Show-and-tell (3 min):** vote on the most useful and the funniest output.

> **Why the sandbox works for this:** `bash scripts/setup.sh` seeded `sandbox_repo` with 6 backdated commits and a `main-stable` branch, so `/standup` has real material to summarise. Verify with `git log --oneline main-stable..HEAD` from inside `sandbox_repo`.

---

## E7 — MCP server on your laptop (12 min)

If you ran `scripts/setup.sh` last night, this just works:

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
cat pages.log    # see your page
```

**Stretch (5 min):** add a third tool `list_teams()` to `oncall_server.py` that returns the list of known teams. Restart claude. Test it.

**Compare:** did anyone manage the stretch? Show the diff.

---

## E8 — Audit the holey settings.json (8 min)

```bash
cd ~/workshop_demo/sandbox_repo
bat .claude/settings.json    # holey on purpose
bat ../module8_permissions/SUBTLE_HOLES.md   # the answer key
```

**5 min — solo:** find at least 4 of the 7 holes before reading SUBTLE_HOLES. Then read it and see what you missed.

**3 min — pair-share:** the hole you would have shipped without noticing.

---

## E9 — Headless one-shot, real JSON (8 min)

```bash
cd ~/workshop_demo/module9_sdk
bash quick_demo.sh
```

JSON triage report appears in <30s. Look at it. **3 min.**

**Pair-discuss (5 min):** in your day job, what would you wire `claude -p` into?
- Failing CI? (the demo)
- PR descriptions auto-generated from the diff?
- Daily summary of what your team merged?
- Triaging Sentry alerts?
- Something weirder?

Round-room: one answer each.

---

## Closing — pick your three commitments (5 min)

On a sticky note, write the three things you'll change in your workflow on Monday. **Three is the cap — anything more, you'll do none of them.** Hand the sticky to a colleague at the workshop. They follow up Friday.
