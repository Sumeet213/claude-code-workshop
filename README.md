# Claude Code — Full-Day Workshop Kit

Hands-on workshop kit for senior engineers learning Claude Code. End-to-end runnable demos, vote-and-reveal exercises, deep-dive modules, and a 2-hour capstone project.

> **If you're a workshop attendee:** read `PARTICIPANT_SETUP.md`, run `bash scripts/setup.sh`, verify with `bash scripts/test_all.sh`, and bring your laptop on the day.

> **If you're studying this on your own:** open `WORKSHOP.html` in a browser and click "Reveal all" — it's the full reference doc with every example, prompt, and explanation visible.

## What's inside

```
.
├── PARTICIPANT_SETUP.md       ← READ FIRST. 10-min install + verify guide.
├── WORKSHOP.html              ← Full reference doc. Click "Reveal all" to see answers.
├── EXERCISES.html             ← The 9 hands-on exercises projected during the workshop.
├── CAPSTONE.html              ← 2-hour end-to-end build session: ship a CI triage bot.
│
├── module1_mental_model/      ← The agent loop: bad/good prompt transcripts.
├── module2_anatomy/           ← The four levers: 5 voting cards.
├── module3_context/           ← CLAUDE.md surgery: bloated → trimmed + reasoning.
├── module5_hooks/             ← Runnable hook demo: blocks prod_*.yaml writes.
├── module6_commands_skills/   ← Skill comparison: 32 files vs 12 files for the same screen.
├── module7_mcp/               ← Runnable MCP server: oncall rotation in 60 lines of Python.
├── module8_permissions/       ← Settings.json: 7 subtle holes in a "reasonable" config.
├── module9_sdk/               ← Headless one-shot: claude -p in 30s, real JSON.
│
├── example2_parallel_review/  ← Pre-built demo: 3 sub-agents review the same flawed file.
├── scripts/                   ← setup.sh, test_all.sh, render-show.sh.
└── styles.css, *.css          ← CSS for the rendered HTML files.
```

## Quickstart

```bash
git clone https://github.com/Sumeet213/claude-code-workshop.git ~/workshop_demo
cd ~/workshop_demo
bash scripts/setup.sh        # one-time: creates venv, installs mcp, chmods, patches paths
bash scripts/test_all.sh     # 17 automated checks; expect "all 17 checks passed"
open WORKSHOP.html
```

For the live headless test (uses real `claude -p`, ~$0.07):

```bash
RUN_HEADLESS=1 bash scripts/test_all.sh
```

## What you'll learn

The workshop is built around three claims:

1. **Claude Code is an agent loop, not autocomplete.** Almost every confused user is reasoning about it as if it were.
2. **The leverage is in four levers around the loop:** context, tools, permissions, loop control. Every problem maps to one.
3. **Production usage is a software-engineering problem, not a prompting problem.** You'll build CLAUDE.md, hooks, skills, MCP servers, and CI integrations the same way you build linters and pre-commit hooks.

Nine modules:

| # | Module | The big idea |
|---|---|---|
| 1 | Mental model | Agent loop. Plan mode. The 4 levers. |
| 2 | Anatomy of a turn | Diagnosing failed sessions. Cache, compaction, thinking budgets. |
| 3 | Context engineering | CLAUDE.md is read every turn — make every byte earn its place. |
| 4 | Sub-agents | Context isolation, not brain-power. Parallel specialists. |
| 5 | Hooks | Deterministic guardrails around a non-deterministic agent. |
| 6 | Slash commands & Skills | Forcing functions for what experienced devs skip. |
| 7 | MCP servers | Wrap your internal systems with structured tools. |
| 8 | Permissions | Blast radius, deny-list completeness, governance. |
| 9 | Headless / SDK | Compounding gains live in CI, not interactive sessions. |

## Three live demos verified

| Module | Command | What it proves |
|---|---|---|
| M5 | `cd module5_hooks && claude` | Hook fires with red BLOCKED box on `prod_*.yaml` writes |
| M7 | `cd module7_mcp && claude` then `/mcp` | Python MCP server connects; Claude calls `get_oncall` then `page_oncall` |
| M9 | `bash module9_sdk/quick_demo.sh` | Real JSON triage report in ~5s for ~$0.07 |

## Two pre-built showstoppers

| Module | Open this | What it shows |
|---|---|---|
| M4 | `example2_parallel_review/OVERLAP.html` | Three sub-agents reviewed the same flawed file in parallel. Specialists found 17/19 issues with depth. Generalist found 16/19 broader. The route-ordering bug only the generalist caught. |
| M6 | `module6_commands_skills/COMPARISON.html` | Two agents built the same React Native profile screen. With the team's frontend-design skill: 32 files, theme tokens, async-state hook. Without: 12 files, happy-path only. |

## After the workshop — the capstone

`CAPSTONE.html` is a 2-hour build challenge: ship a working CI triage bot using everything in modules 1-9. Headless `claude -p`, parallel sub-agents, hooks for safety, validation harness, GitHub Actions wrapper. Real artifact, real workflow, no toy.

## Re-rendering after edits

```bash
bash scripts/render-show.sh    # rebuilds all .html from .md
```

## License & attribution

Workshop kit by Sumeet Desai. Use it, fork it, run it with your team. If you do, I'd love to know how it went — open an issue.
