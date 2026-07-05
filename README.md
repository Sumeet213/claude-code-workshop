# Claude Code — Agentic Coding Workshop (2 days)

Hands-on workshop kit: 13 exercises, runnable demos, and a 3-hour team
capstone. Almost nothing is slides — your laptop is the workshop.

> **Attendee? Do this the night before Day 1:** read `PARTICIPANT_SETUP.md`,
> run `bash scripts/setup.sh`, verify with `bash scripts/test_all.sh`, and
> bring (1) a real failing log from your work and (2) one feature you wish
> existed in a repo you own.

## The two days

| | Day 1 — learn the instrument | Day 2 — play the gig |
|---|---|---|
| Morning | Kickoff + teams · **Fundamentals**: the agent loop, plan mode, context engineering, memory, skills, permissions | **The ADLC**: spec-driven dev, TDD with an agent, AI evals, CI/CD, cloud (AWS), production monitoring |
| Afternoon | **Advanced**: sub-agents & parallel orchestration, slash commands & skills, hooks, MCP | **Capstone**: teams of 4, spec → build → prove → live demo · out by 4:30 PM |

The exercises (E1–E13) live in `EXERCISES.md`. The capstone brief is
`CAPSTONE.md`. Every exercise ends with something you can use at work Monday.

## What's inside

```
sandbox_repo/        your playground: a fake Express/TS backend with seeded
                     problems — bloated CLAUDE.md, holey settings.json,
                     failing test, a week of git history. Break it freely.
example2_parallel_review/   a 70-line file with many problems (E5)
module5_hooks/       a working PreToolUse hook that blocks prod writes (E7)
module7_mcp/         a live Python MCP oncall server (E8)
module9_sdk/         the 5-second headless demo (E12)
day2_adlc/           Day 2 kit: specs/ · tdd_kata/ · evals/ · cicd/ ·
                     cloud_aws/ · monitoring/
module1-3, module8   reference material used during Day 1 sections
.claude/commands/    example slash commands to study and steal
DECK.html            the slides (arrow keys advance)
scripts/             setup.sh (run once) · test_all.sh (verify)
```

## Quickstart

```bash
git clone https://github.com/Sumeet213/claude-code-workshop.git ~/workshop_demo
cd ~/workshop_demo
bash scripts/setup.sh       # idempotent — creates the MCP venv, seeds git history
bash scripts/test_all.sh    # every check should pass
```

## Why a sandbox repo?

Everyone runs every exercise against the same code, so the room can compare
results — and you can't leak your employer's source. It's not meant to run;
Claude reads and reasons over it. Reset anytime: `cd sandbox_repo && git checkout . && git clean -fd`.

## The three ideas the workshop argues

1. Claude Code is an **agent loop** — gather context → act → verify → repeat — not autocomplete.
2. Your leverage is **four levers**: context, tools, permissions, loop control.
3. Production value is a **software-engineering problem, not a prompting problem** — specs, tests, evals, CI, monitoring. Day 2 exists because of this.
