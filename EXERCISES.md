# Exercises — your turn (everyone has Claude open)

> **The whole workshop reframed:** the repo is on every laptop. The trainer conducts; you run. Each exercise is timeboxed. After the timer, we compare across the room — LLMs are non-deterministic, so everyone gets something slightly different. That's the lesson.

| Time | Exercise | Duration | Compare format |
|---|---|---|---|
| 09:30 | E1 — Bad prompt vs good prompt | 7 min | Round-room, one diff each |
| 10:15 | E2 — Spot the lever (5 cards) | 10 min | Hand-raise vote per card |
| 11:15 | E3 — CLAUDE.md surgery (your repo) | 15 min | Pair-trade with neighbour |
| 12:15 | E4 — Three sub-agents on one file | 15 min | Compare to OVERLAP.html |
| 14:15 | E5 — Hook fires on YOUR laptop | 10 min | Race: who shipped a working hook first? |
| 15:15 | E6 — /standup against your repo | 10 min | Show-and-tell, pick the funniest |
| 16:15 | E7 — MCP server on YOUR laptop | 12 min | Did `/mcp` see it? |
| 17:05 | E8 — Audit your settings.json | 8 min | Pair-share, one takeaway each |
| 17:35 | E9 — Headless one-shot, real JSON | 8 min | Pair-discuss: where would you wire this? |

---

## E1 — Bad prompt vs good prompt (7 min)

Open Claude in any small repo of your own.

```
> fix a failing test
```

Watch what happens. **2 minutes.** Then `/clear` and:

```
> Pick a test file at random in this repo. Read it carefully. Identify
  the most fragile assertion in the test (something that would break if
  the implementation changed in a reasonable way). Don't edit anything.
  Use plan mode. Report what you found.
```

**Round-room (5 min):** one sentence each — what was the most surprising difference between the two runs?

---

## E2 — Spot the lever (10 min)

The trainer projects `module2_anatomy/scenarios.html`. **5 cards. Per card:**

1. Read the transcript. Decide which lever failed: context, tools, permissions, or loop control.
2. **Vote by hand-raise** when the trainer calls each lever name.
3. Trainer clicks reveal. Discuss for 30 seconds.

**Score on the whiteboard.** 5/5 = "diagnostician of the day" badge.

---

## E3 — CLAUDE.md surgery (15 min)

**5 min — solo:**

In your own repo (the one you brought):

```bash
cd ~/your-repo
ls CLAUDE.md       # or run /init in claude to seed one
```

Apply the surgery rules from `module3_context/SURGERY.html`. Cut anything that's:
- Obvious from reading the code.
- An empty platitude ("write good code").
- Style that the linter enforces.
- Volatile state.
- Credentials or paths to credentials.

Aim to reduce by ≥30% without losing load-bearing rules.

**8 min — pair:**

Trade laptops with your neighbour. **They** cut yours; **you** cut theirs. Defend or accept each cut.

**2 min — pick one:** the cut you most disagreed with. Round-room shares.

---

## E4 — Three sub-agents on one file (15 min)

Open Claude in the workshop repo:

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

## E6 — /standup against your repo (10 min)

```bash
cp module6_commands_skills/COMPARISON.md /tmp/  # not really used, just keeping you in repo
cd ~/your-repo  # the one you brought
mkdir -p .claude/commands
```

Create `.claude/commands/standup.md`. Crib from the good prompt in WORKSHOP.html M6 if you need a starter.

```bash
claude
> /standup
```

**Show-and-tell (3 min):** vote on the most useful and the funniest output.

---

## E7 — MCP server on your laptop (12 min)

If you ran `scripts/setup.sh` last night, this should just work:

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

## E8 — Audit your settings.json (8 min)

```bash
bat ~/.claude/settings.json    # your global
bat ~/your-repo/.claude/settings.json   # if you have one
diff ~/your-repo/.claude/settings.json /Users/sdesai/work/workshop_demo/module8_permissions/good_settings.json 2>/dev/null || \
  bat /Users/sdesai/work/workshop_demo/module8_permissions/good_settings.json
```

**5 min — solo:** pick three rules from `good_settings.json` you'd add to your own settings. Pick one rule you think is overly paranoid for your team and skip it.

**3 min — pair-share:** one addition + one rejection each.

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
