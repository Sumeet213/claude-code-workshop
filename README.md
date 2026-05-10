# Claude Code — Full-Day Workshop Kit (trainer's repo)

> **Trainer's full kit** — script, conductor cookbook, runbook, all reveals visible. The participant-facing subset lives in the public repo (link below).

## 60-second orientation

```bash
cd workshop_demo
open START_HERE.html
```

That's the landing page. **Read it once and you understand the whole kit.**

## Verify the kit on your machine

```bash
bash scripts/setup.sh        # one-time: creates venv, installs mcp, chmods, patches paths
bash scripts/test_all.sh     # 17 automated checks; expect "all 17 checks passed"
```

For the live headless test (calls real claude, ~$0.07):

```bash
RUN_HEADLESS=1 bash scripts/test_all.sh
```

## What you have

| Open this | Purpose |
|---|---|
| `START_HERE.html` | 60-second orientation (read first) |
| `SCRIPT.html` ⭐ | Read-through trainer script |
| `RUNBOOK.html` | Bare commands per module |
| `DEMO_COOKBOOK.html` | Conductor playbook (set up → timer → compare) |
| `WORKSHOP.html` | Full reference doc with all reveals |
| `EXERCISES.html` | What you project for participants |
| `CAPSTONE.html` | 2-hour end-to-end build session |
| `PARTICIPANT_SETUP.html` | Send to attendees the night before |
| `DOCUMENTATION_MAP.md` | Every file, what it is, when to use it |

## The day in one screen

```
09:00  Welcome — claude doctor; whiteboard "what pisses you off"
09:15  M1  — Mental model + bad/good prompt
10:00  M2  — Anatomy of a turn (4 levers); spot the lever exercise
10:45  Break
11:00  M3  — CLAUDE.md surgery (live trim)
12:00  M4  ⭐ — Sub-agents + parallel reviewers (showstopper)
13:00  Lunch
14:00  M5  — Hooks (live demo: hook fires)
15:00  M6  ⭐ — Slash commands + Skills (showstopper)
15:45  Break
16:00  M7  — MCP server (live: cd module7_mcp && claude → /mcp)
17:00  M8 + M9 lightning — permissions + headless concepts
17:00  CAPSTONE — 2-hour build: ship a CI triage bot
19:00  Wrap + drinks
```

(The afternoon assumes Option A — extended day with capstone. Alt schedules in `CAPSTONE.html`.)

## Three live moments where you actually run claude

| Module | Command |
|---|---|
| M5 | `cd module5_hooks && claude` → ask it to edit `prod_config.yaml` |
| M7 | `cd module7_mcp && claude` → `/mcp` → ask to page payments oncall |
| M9 | `bash module9_sdk/quick_demo.sh` |

The other 6 modules: you `bat`, `open`, `tree`, `diff`. **No claude.**

## Public participant repo

The participant-facing subset of this kit (no SCRIPT, no DEMO_COOKBOOK, no RUNBOOK — i.e., no trainer-only material) is published separately and safe to share with attendees. Link in the description of this repo.
