# Capstone — 3 hours, teams of 4, one shipped thing

> Day 2 afternoon. Your team (formed Day 1 morning) builds a working
> AI-augmented tool end-to-end, using everything from the last two days:
> spec first, agents + skills + hooks + MCP in the build, tests + evals as
> proof, and a 5-minute demo at 16:00 sharp.

## Team roles (rotate if you like, but fill all four)

| Role | Owns |
|---|---|
| **Product** | the spec, the non-goals, the demo story |
| **Builder** | the main Claude session doing the implementation |
| **Toolsmith** | CLAUDE.md, settings.json, hooks, slash commands, MCP wiring |
| **Verifier** | tests, evals, the "prove it" pass before demo |

Four laptops, four parallel work streams — orchestrate yourselves the way
you orchestrated sub-agents yesterday.

## Pick a project (or bring your own)

Anything is allowed if it's demoable in 3 hours and uses ≥ 3 workshop
techniques. The menu, if you want one:

1. **PR concierge** — CLI or CI job: takes a diff/PR, runs parallel review
   agents (security / quality / tests), merges findings, posts one verdict.
   Test it on `example2_parallel_review/code_under_review/users_api.js`.
2. **Ticket-to-triage pipeline** — extend `day2_adlc/evals/`: ingest raw
   tickets, produce structured JSON, run code checks + LLM-judge, route
   low-confidence items to a human review queue.
3. **Oncall copilot** — extend `module7_mcp/oncall_server.py` with real tools
   (schedules, escalation, incident notes), then build the slash-command
   workflow an on-call engineer would actually run at 3 a.m.
4. **Repo doctor** — point it at any repo: generates a load-bearing CLAUDE.md,
   audits settings.json, installs a guard hook and two useful slash commands.
   A productized version of Day 1, runnable on your company repo Monday.
5. **Spec-to-feature factory** — take the `sandbox_repo` export-endpoint spec
   (or your own spec from E9) all the way: plan → tests → implementation →
   eval → a CI workflow file that would gate it.

## The three milestones (a trainer checks each)

**M1 — 13:30: Spec frozen.** One page, template in `day2_adlc/specs/`.
Includes non-goals, edge cases, acceptance criteria, and *which workshop
techniques you'll use where*. No code before the spec is stamped.

**M2 — 15:00: Vertical slice.** One path works end-to-end, ugly is fine.
If you're not vertical by 15:00, cut scope — that's Product's job, do it
ruthlessly.

**M3 — 15:45: Proof pass.** Verifier drives: run the tests, run the eval,
try to break it live. Fix or fence what breaks. Freeze for demo.

## Demos — 16:00, 5 minutes per team, hard cut

1. The problem, in one sentence.
2. **Live run** — no slides, no screenshots. It works or it doesn't; both are
   interesting.
3. The receipt: show your test/eval output proving it works.
4. One thing an agent did that surprised you.

## Scoring (peer-voted, one vote per team, can't vote for yourself)

- **Works live** — did the demo run?
- **Technique depth** — spec + how many of: plan mode, sub-agents, skills/commands, hooks, MCP, evals, CI?
- **Would steal it** — would another team actually use this at work?

Winning team gets bragging rights and their repo linked in the workshop
follow-up email.

## Rules

- Default target repos are in this kit; your own repo is allowed if the whole
  team can see it.
- Trainers unblock, they don't build. Ask early — the 15-minute silent
  struggle is the most expensive thing in the room.
- Commit as you go. A capstone that only exists in a terminal scrollback
  didn't happen.
