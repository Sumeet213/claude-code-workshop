# Hands-On Exercises — 2-Day Agentic Coding Workshop

> Keep this open all workshop. Every exercise is timeboxed, every exercise
> ends with something you can steal for your real job on Monday.
>
> Unless told otherwise, run everything inside **`sandbox_repo/`** — a fake
> fitness-app backend ("Stride") seeded with realistic problems. Break it
> freely; `git checkout .` resets it.

## Day 1 — learn the instrument

| # | Exercise | Time | Where |
|---|----------|------|-------|
| E1 | Bad prompt vs good prompt | 15 min | `sandbox_repo/` |
| E2 | Plan mode before code | 10 min | `sandbox_repo/` |
| E3 | CLAUDE.md surgery race | 20 min | `sandbox_repo/` |
| E4 | Find the holes (permissions audit) | 15 min | `sandbox_repo/` |
| E5 | Parallel sub-agent review | 30 min | `example2_parallel_review/` |
| E6 | Build your own `/standup` | 25 min | `sandbox_repo/` |
| E7 | Write a hook that saves your job | 20 min | `module5_hooks/` |
| E8 | Extend a live MCP server | 25 min | `module7_mcp/` |

## Day 2 — play the gig

| # | Exercise | Time | Where |
|---|----------|------|-------|
| E9 | Spec-driven build | 40 min | `day2_adlc/specs/` + `sandbox_repo/` |
| E10 | TDD kata: red → green → new spec | 30 min | `day2_adlc/tdd_kata/` |
| E11 | Catch the lying output (evals) | 30 min | `day2_adlc/evals/` |
| E12 | Triage your own failure, headless | 15 min | anywhere |
| E13 | Six-tile dashboard sketch | 10 min | paper |
| — | **Capstone** (teams of 4) | 3 hrs | see `CAPSTONE.md` |

---

## E1 — Bad prompt vs good prompt (15 min)

There's a failing test in the sandbox. You'll fix it twice.

```bash
cd sandbox_repo && claude
```

**Round 1 — prompt like it's a search box:**

```
fix the failing test
```

Watch what it does. Note what it guessed, what it assumed, what it touched.
Then `/clear` and `git checkout .`.

**Round 2 — prompt like it's a competent new teammate:**

```
tests/db/migration_0042.test.ts is failing. The Down block of
src/db/migrations/0042_add_soft_delete.sql is a TODO. Write the Down
migration so it exactly reverses the Up block, don't edit the test,
and show me the diff before finalizing. Don't touch any other file.
```

**Debrief with your neighbour:** what specifically changed the behaviour —
model quality, or the context and constraints *you* provided? That gap is
the whole workshop.

## E2 — Plan mode before code (10 min)

Same repo. Press **Shift+Tab** until you see plan mode, then:

```
src/middleware/auth.ts uses a deprecated TOKEN_CACHE. Plan a refactor
to remove it without changing behaviour.
```

Read the plan like a PR review: challenge one step out loud. Then approve —
or edit the plan and *then* approve. You just did your first human-in-the-loop
gate. **Take-home:** never let an agent write to a repo you care about without
a plan you've read.

## E3 — CLAUDE.md surgery race (20 min)

`sandbox_repo/CLAUDE.md` is ~114 lines of history, sprint gossip, and
credentials nobody should have committed. Every one of those lines gets
re-read on *every single turn* and most are noise — or worse, misdirection.

**The race:** trim it to ≤ 40 lines that would actually make Claude better at
this repo. 10 minutes, solo. Rules: keep anything that changes agent behaviour,
cut everything that doesn't, and *fix* anything actively dangerous.

Then **swap laptops with your neighbour** and try one prompt against *their*
trimmed file. Best file in the room gets projected and defended by its author.

**Take-home:** the checklist you just internalized — commands, conventions,
landmines, nothing else. Also try `/memory` and end a message with a `#`
line to see where remembered facts land.

## E4 — Find the holes (15 min)

`sandbox_repo/.claude/settings.json` looks reasonable. It is not.

Solo, 8 minutes, no Claude allowed yet: **write down every way this config
lets an agent hurt you.** Think exfiltration, force-push, package publish,
secrets. There are at least five distinct holes.

Then ask Claude to audit the same file and compare its list against yours.
Who found more? **Take-home:** run the same audit against your real project's
settings tonight.

## E5 — Parallel sub-agent review (30 min)

One file, ~19 seeded problems: `example2_parallel_review/code_under_review/users_api.js`.

First, 3 minutes, read it yourself and write down your predicted top-3 issues.

Then launch **three reviewers in parallel, in a single message**:

```bash
cd example2_parallel_review && claude
```

```
Launch three parallel sub-agents to review code_under_review/users_api.js:
1. a security reviewer (injection, authz, secrets, SSRF)
2. a code-quality reviewer (bugs, error handling, dead code)
3. a generalist reviewer (anything the others would miss)
Each returns a ranked findings list with line numbers. Then merge them into
one table: finding | line | which reviewers caught it | severity.
```

While it runs, watch the sub-agent activity. When the table lands:
- What did **all three** catch? What did **only one** catch?
- Compare the merged table against your own top-3 prediction. What did you miss?

**Take-home:** the merged-table prompt above, reusable on any PR.

## E6 — Build your own `/standup` (25 min)

The sandbox has a week of seeded git history. Build a slash command that
turns it into a standup update.

```bash
cd sandbox_repo && claude
```

```
Create .claude/commands/standup.md — a slash command that summarizes my
commits since the main-stable branch as a standup update: done / in
progress / blockers. Read-only git access, nothing else. Then I'll run
/standup to test it.
```

Restart claude, run `/standup`. Then iterate *on the command file itself*
until the output is something you'd actually paste into your team channel.

**Stretch:** make it accept an argument (`/standup 3` = last 3 days).
**Take-home:** the command file — drop it into any repo with git history.

## E7 — Write a hook that saves your job (20 min)

First watch the guardrail that's already here:

```bash
cd module5_hooks && claude
```

```
Add a comment to sample_files/prod_config.yaml
```

Blocked. Not "asked nicely" — *blocked by deterministic code*, before the
tool ran. Read `.claude/hooks/block-prod-writes.sh` and `.claude/settings.json`
to see the wiring: stdin JSON in, exit code 2 out.

**Now the race:** write a PreToolUse hook that blocks any Bash command
containing `curl` piped to a shell. First working hook wins. Prove it fires,
prove normal commands still pass.

**Take-home:** your hook. Generalize it tonight: block `.env` reads, block
`DROP TABLE`, block deploys on Fridays — your call.

## E8 — Extend a live MCP server (25 min)

```bash
cd module7_mcp && claude
```

Run `/mcp` — see the oncall server and its two tools. Then use it:

```
Who is on call for payments? Page them saying the workshop says hi.
```

Check `pages.log` — that "page" was a real tool call into real (fake) infra.

**Your turn:** open `oncall_server.py`, add a `list_teams()` tool, restart,
and make Claude discover and use it *without naming the tool in your prompt*.
Pay attention to what makes it discoverable: the function name and docstring
ARE the UX. Write them for a model, not a human.

**Take-home:** you now know the full loop — server, tool, registration,
discovery. Your internal APIs are one lunch break away from being agent-usable.

---

## E9 — Spec-driven build (40 min)

Read `day2_adlc/specs/example_spec_export_endpoint.md` (5 min). Notice the
**Non-goals** and **Edge cases** sections — that's where hallucinations go to die.

Then, in `sandbox_repo/`:

1. Paste the spec into plan mode. Read the plan against the acceptance criteria.
2. Approve and let it build — tests first if you can hold it to that.
3. When it claims done: make it *prove* each acceptance criterion, one by one.

**Fast finishers:** write your own one-page spec (template in
`day2_adlc/specs/SPEC_TEMPLATE.md`) for a feature you actually need at work.
That document is your take-home — and possibly your Monday morning.

## E10 — TDD kata: red → green → new spec (30 min)

Full instructions: `day2_adlc/tdd_kata/README.md`.

```bash
cd day2_adlc/tdd_kata && node --test    # red. good.
```

Round 1: tests are the spec, tests are read-only, make them green — and make
Claude run them itself after every change.
Round 2: new requirement (`burst`) — tests written FIRST, shown to you,
approved by you, *then* implemented.

**Take-home:** the two-line house rule — *"tests are the spec"* + *"run it
after every change"* — which upgrades any agent from plausible to verified.

## E11 — Catch the lying output (30 min)

`day2_adlc/evals/` has five AI-generated ticket summaries. Some are broken.
One is **lying** — structurally perfect, semantically false.

```bash
cd day2_adlc/evals
node check.js        # layer 1: code checks. Which two fail, and why?
bash judge.sh        # layer 2: LLM-as-judge. Which one passed checks but lies?
```

Before running the judge, place your bet: read the outputs and vote as a
table on which one is the liar. Then compare against the judge's verdicts —
and read its *reasons*.

**Debrief:** which layer catches what? What would layer 3 (humans) sample?
**Take-home:** `check.js` + `judge.sh` — swap in your own rubric and you have
a production eval harness by Friday.

## E12 — Triage your own failure, headless (15 min)

Bring a real failing log from your actual work (CI output, stack trace,
anything ugly). No log? Use `module9_sdk/sample_test_failure.txt`.

```bash
cat your_failure.log | claude -p 'You are a CI triage bot. Output JSON only:
{"probable_cause": str, "suggested_fix": str, "confidence": "high|medium|low"}' \
  --max-turns 4 --output-format json | jq -r '.result'
```

One pipe, structured verdict. Now the question that matters: **where in your
real pipeline would you wire this, and would you auto-act on high confidence?**
Argue it out with your table.

## E13 — Six-tile dashboard sketch (10 min)

Paper and pen. Sketch the 6-tile monitoring dashboard for the AI feature your
team builds in the capstone this afternoon: each tile = metric + threshold +
who gets paged. Guidance in `day2_adlc/monitoring/README.md`. Teams hold up
their sketch; fastest complete + defensible board wins.

---

## After the capstone: three commitments

Sticky note. Three concrete changes you'll make Monday — a CLAUDE.md for your
main repo, a hook, a slash command, an eval in CI, whatever bit hardest today.
Name and date it. Stick it on the wall on your way out; photograph it so
future-you can't pretend it never happened.
