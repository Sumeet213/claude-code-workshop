# Claude Code — Full-Day Interactive Workshop for Experienced Developers

> A run-the-day-from-this-page guide. Every module is **Concept → Bad prompt → Good prompt → Your turn → Compare**. All "good" prompts and reveals are hidden behind `<details>` so you can keep them off-screen until the room has tried for themselves.

## ⭐ Mode: parallel labs (everyone has Claude open)

This workshop assumes every participant has Claude Code installed and the `workshop_demo` repo cloned to their laptop. The workshop is **not** "trainer demos, room watches" — it's **"trainer conducts, room runs in parallel, then we compare."**

Two key participant-facing artifacts:

- **`PARTICIPANT_SETUP.html`** — sent the night before. They install Claude, clone the repo, run `bash scripts/setup.sh`, verify three runnable demos.
- **`EXERCISES.html`** — projected during each module. Nine timeboxed exercises, one per module. After each timer, we compare round-room.

Trainer-only artifacts:

- **`DEMO_COOKBOOK.html`** — your conductor's playbook. Per-module: set up → timer → walk the room → round-room compare.
- **`WORKSHOP.html`** — this document, with reveals.

---

# How to use this kit

## What's in the repo (`workshop_demo/`)

```
workshop_demo/
├── WORKSHOP.html                   ← OPEN THIS IN A BROWSER. Trainer's deck.
├── WORKSHOP.md                     ← source for the HTML
├── DEMO_COOKBOOK.md                ← ⭐ ONE PAGE: every demo, exact commands
├── README.md                       ← quickstart
│
├── module1_mental_model/
│   └── transcripts/                ← bad_prompt.txt + good_prompt.txt (read live)
├── module2_anatomy/
│   └── scenarios.md                ← 5 "spot the lever" cards (interactive vote)
├── module3_context/
│   ├── before_CLAUDE.md            ← bloated CLAUDE.md to trim live
│   ├── after_CLAUDE.md             ← the trimmed version
│   └── SURGERY.md                  ← what got cut, line-by-line, and why
├── module4_subagents/              ← (lab dir; sub-agent demo lives in example2_*)
├── module5_hooks/                  ← 🎬 RUNNABLE: hook fires live in front of the room
│   ├── RUN.md                      ← exact commands
│   ├── .claude/settings.json       ← wires the hook
│   ├── .claude/hooks/block-prod-writes.sh
│   └── sample_files/prod_config.yaml
├── module6_commands_skills/        ← 🎬 PRE-BUILT skill comparison
│   ├── COMPARISON.md
│   ├── live_demo_with_skill/       ← 32 files, full architecture
│   └── live_demo_without_skill/    ← 12 files, happy-path only
├── module7_mcp/                    ← 🎬 RUNNABLE: real MCP server, live demo
│   ├── RUN.md
│   ├── oncall_server.py            ← 60 lines, FastMCP
│   ├── oncall.json
│   └── .claude/settings.json
├── module8_permissions/
│   ├── bad_settings.json           ← what NOT to commit
│   └── good_settings.json          ← what to defend in code review
├── module9_sdk/                    ← 🎬 RUNNABLE: claude -p in 30 seconds
│   ├── RUN.md
│   ├── quick_demo.sh
│   └── sample_test_failure.txt
└── example2_parallel_review/       ← 🎬 PRE-BUILT 3-reviewer demo
    ├── OVERLAP.md
    ├── code_under_review/users_api.js
    └── reviews/                    ← 3 real review files
```

## Trainer's golden path

**Open these THREE files in your browser/editor before the workshop and you're ready:**

1. `DEMO_COOKBOOK.md` — print it, tape it next to your laptop. Every demo, exact commands.
2. `WORKSHOP.html` — your slide deck. Click any module, run that segment.
3. `README.md` — the quickstart you re-read the night before.

## Running order (8 hours, 9:00 – 18:00)

| Time | Module | Mode | Pre-built artifact |
|------|--------|------|---------------------|
| 09:00 – 09:15 | Welcome, env check | Talk | — |
| 09:15 – 10:00 | M1 — Mental model | Talk + demo | — |
| 10:00 – 10:45 | M2 — Anatomy of a turn | Talk + lab | — |
| 10:45 – 11:00 | Break | — | — |
| 11:00 – 12:00 | M3 — Context engineering | Lab | — |
| 12:00 – 13:00 | M4 — Sub-agents + parallelism | **Live demo** | `example2_parallel_review/` |
| 13:00 – 14:00 | Lunch | — | — |
| 14:00 – 15:00 | M5 — Hooks | Lab | — |
| 15:00 – 15:45 | M6 — Slash commands & Skills | **Live demo** | `module6_commands_skills/` |
| 15:45 – 16:00 | Break | — | — |
| 16:00 – 17:00 | M7 — MCP servers | Lab | — |
| 17:00 – 17:30 | M8 — Permissions & rollout | Talk + lab | — |
| 17:30 – 18:00 | M9 — SDK & headless | Talk + demo | — |

## How to project

- **Browser, full screen.** Open `WORKSHOP.html`. The TOC sticks to the left. Bad/good prompt blocks are collapsible — leave the "good" closed during the predict phase.
- **Three terminals visible.** One running `claude` on the workshop sandbox, one running `tree`/`cat`/`bat` for showing files, one for `git diff`/`gh` commands.
- **Whiteboard or shared doc** for the parking-lot questions and predict-before-reveal answers.

## Three rules for the room

1. **No second AI in another tab.** We want everyone feeling the agent loop directly.
2. **Predict before you reveal.** Every bad-vs-good prompt section gives you 60 seconds to write what you'd change before you click open the answer.
3. **Real keyboards.** Every lab is hands-on in the sandbox repo, not a screenshot.

## What to print

- Appendix B (one-page cheat-sheet) — one per attendee.
- The bad prompts only (with the good prompts blanked) — distribute as a workbook.

## What to send the day before

- Sandbox repo URL.
- `npm install -g @anthropic-ai/claude-code`, `claude doctor`.
- A throwaway Anthropic API key for Module 9.
- This `WORKSHOP.html` link.

---

# Workshop philosophy

Three claims drive the entire day:

1. **Claude Code is an agent loop, not autocomplete.** Almost every confused user is reasoning about it as if it were.
2. **The leverage is in the four levers around the loop:** *context, tools, permissions, loop control.* Every problem maps to one of them.
3. **Production usage is a software-engineering problem, not a prompting problem.** You'll build `CLAUDE.md`, hooks, skills, MCP servers, and CI integrations the same way you build linters and pre-commit hooks.

Hold those three lines up at 09:00, again at 13:00, again at 18:00. They are the spine.

---

# 09:00 – 09:15 — Welcome & environment check

**Sanity script — run together on screen:**
```bash
claude --version
claude doctor
gh auth status
node --version && python3 --version
```

**Whiteboard prompt** *(round-the-room, one sentence each)*: "What's the most painful part of your current AI-assisted workflow?" Capture answers — re-visit at 18:00.

**Set the rules** (above). Confirm everyone has the sandbox cloned and `WORKSHOP.html` open.

---

# Module 1 — Mental model of an agentic CLI (09:15 – 10:00)

## Why this module exists

Every later module breaks if the room is still thinking "Claude Code = Cursor in a terminal." This is the framing surgery.

## Concept (25 min)

### 1. The agent loop

```
┌──────────────────────────────────────────────────────────┐
│  user msg ──▶ model ──▶ tool call ──▶ tool result ──┐    │
│                 ▲                                    │    │
│                 └────────────────────────────────────┘    │
│           (loop until model emits no tool call)          │
└──────────────────────────────────────────────────────────┘
```

Walk through one real turn line by line — model reads system prompt, decides to call `Read`, sees the result, decides to call `Edit`, sees a diff confirmation, then emits a final message. That is what every interaction is.

### 2. What Claude Code adds on top of the raw API

- A curated tool set: `Read`, `Edit`, `Write`, `Bash`, `Grep`, `Glob`, `WebFetch`, `WebSearch`, `Task`, `TodoWrite`.
- A permission system gating every tool call.
- Context plumbing: `CLAUDE.md`, `@`-mentions, auto-compaction, prompt caching.
- An extension surface: hooks, slash commands, skills, MCP servers, sub-agents.
- Session ergonomics: history, `/resume`, `/clear`, `/compact`, plan mode, fast mode.

### 3. Where it sits in the landscape

| Tool | Loop owner | Editing model | Strength |
|------|-----------|---------------|----------|
| Copilot inline | IDE | Single-file completion | Keystroke speed |
| Cursor / Windsurf | IDE | Multi-file, cmd-K | Visual diff review |
| Aider | CLI | Patch-based, git-native | Determinism, low ceremony |
| Claude Code | CLI | Agentic, tool-using | Long-horizon tasks, automation, extensibility |
| Anthropic SDK | Your code | Whatever you build | Production embedding |

**The key claim:** Claude Code is the right tool when the unit of work is *"complete this task"*, not *"complete this line."*

## Interactive: Bad prompt vs Good prompt

**Setup:** the sandbox has a failing migration test. Show the room the bad prompt, ask: *"What's wrong with this — and what would you write instead?"* Give 60 seconds.

### ❌ Bad prompt
```
fix the test
```

<details>
<summary>✅ Reveal: Good prompt</summary>

```
The migration test in db/__tests__/migration_0042.test.ts is failing on
CI. Read the test, read the migration, and figure out the root cause.
Don't change the migration to make the test pass — figure out which one
is wrong. If it's the test, propose the fix and wait for me to approve
before editing. Use plan mode.
```

**What changed and why:**
- *Context:* names the file, names the migration, names where the failure happens.
- *Tools / loop:* "use plan mode" — model can't silently edit.
- *Intent:* explicitly forbids the obvious wrong fix ("just change the migration").
- *Authority:* "wait for me to approve" — control returns to the human at the decision point.
</details>

## Demo (15 min)

Live: take the workshop sandbox, paste the **bad** prompt, narrate every tool call. Then `/clear`, paste the **good** prompt, narrate again. Contrast.

> 🎬 **No sandbox handy?** Open `module1_mental_model/transcripts/bad_prompt.txt` and `good_prompt.txt` and read them aloud — same lesson, no live Claude needed. Recipe 1 in `DEMO_COOKBOOK.md`.

## Discussion (5 min)

> "Where in your current workflow is the unit of work actually a *task*, not a *line*?"

---

# Module 2 — Anatomy of a turn (10:00 – 10:45)

## Goals

Every participant can take any failed Claude Code interaction and say which of the four levers failed: bad context, bad tool choice, bad permission, bad loop control.

## Concept (20 min)

### The four levers — the spine of the entire day

- **Context** — what's in the model's window when it acts.
- **Tools** — what the model is allowed to call.
- **Permissions** — what runs without asking, what stops to ask.
- **Loop control** — plan mode, sub-agents, hooks, `/clear`.

Almost every "Claude did the wrong thing" complaint maps to one of these four.

### Plan mode — the most under-used feature

- `Shift+Tab` cycles `default → acceptEdits → plan`.
- In plan mode the model can read and search but cannot edit; it must surface a plan and wait for `ExitPlanMode`.
- **Use it for:** anything multi-file, any refactor, any unfamiliar codebase.

### Token economics in 90 seconds

- Prompt caching ≈ 90% cost reduction on the cached prefix, **5-minute TTL**.
- Long-lived sessions on one task are cheap; ping-ponging between unrelated tasks is expensive.
- `/clear` between unrelated tasks. *Don't* `/clear` mid-task to "free space" — auto-compaction handles it and preserves the cache.

### Models in Claude Code

- Default: Opus (heavyweight reasoning).
- Sonnet: faster, cheaper, great for routine edits and sub-agents.
- Haiku: very fast, ideal for hooks and small classifier-style sub-agents.
- `/model` switches; sub-agents can pin a model in their definition.

## Interactive: Spot the lever (5 cards, hand-raise vote)

> 🎬 **Open `module2_anatomy/scenarios.md` on the projector.** Five short transcripts, one card at a time, each with a hidden reveal. Read aloud → 60s pause → hand-raise vote on which lever (context / tools / permissions / loop control) → click the green box. Score on the whiteboard. Recipe 2 in `DEMO_COOKBOOK.md`.

The cards below are a quick walk-through of the same content if you'd rather present from this page:

### Transcript A — what failed?

```
> add user-deletion to the API
[Claude proposed and wrote 14 file edits across 9 files in 2 minutes]
> wait that broke the build
> revert
```

<details>
<summary>✅ Reveal: which lever?</summary>

**Loop control.** No plan mode, no checkpoint between "I have an idea" and "I am editing 9 files." Fix: `Shift+Tab` to plan mode, or prompt: *"Propose the change in plan mode first."*
</details>

### Transcript B — what failed?

```
> what does the EventBus class do?
[Claude reads README.md, package.json, src/index.ts]
[Claude responds: "EventBus is a pub-sub helper that …" — invents a method
 signature that doesn't exist]
```

<details>
<summary>✅ Reveal: which lever?</summary>

**Context.** The model never read `src/event-bus.ts`. It hallucinated from related files. Fix: `@src/event-bus.ts` to inject it directly, or use `Grep` for the class name first.
</details>

### Transcript C — what failed?

```
> run the test suite and fix any failures
[Approval prompt: Allow Bash(npm test)?]   y
[Approval prompt: Allow Bash(npm test -- --watch=false)?]   y
[Approval prompt: Allow Bash(npm test src/foo.test.ts)?]   y
[Approval prompt: Allow Bash(npm test src/bar.test.ts)?]   y
> ugh, just go
```

<details>
<summary>✅ Reveal: which lever?</summary>

**Permissions.** Every variant of `npm test` triggers a fresh prompt. Fix: add `Bash(npm test:*)` to `.claude/settings.json` `allow` list. Run `/fewer-permission-prompts` after a week of use to mine your own transcripts.
</details>

## Discussion (5 min)

> "Which lever do you instinctively reach for? Which do you ignore?"

---

# 10:45 – 11:00 — Break

---

# Module 3 — Context engineering (11:00 – 12:00)

## Goals

- Write a `CLAUDE.md` that pays for itself the first day.
- Use `@`-mentions, memory, `/compact` deliberately.
- Inspect what's actually loaded with `/memory`.

## Concept (25 min)

### The CLAUDE.md hierarchy

Loaded in this order, last write wins for conflicts:

1. `~/.claude/CLAUDE.md` — personal, applies everywhere.
2. `<repo>/CLAUDE.md` — project, committed.
3. `<repo>/.claude/CLAUDE.md` — project, *not* committed.
4. Any `CLAUDE.md` walking up from the cwd.

`/memory` shows what's actually loaded. **The single most important debugging command for "why is it doing that?"**

### What goes in CLAUDE.md

- Things the model cannot derive from reading code: deploy targets, autogenerated files, `pnpm` not `npm`, etc.
- Anti-patterns to forbid: "do not mock the database," "do not skip pre-commit hooks."
- Pointers to long docs: "architecture is in `/docs/architecture.md`, read on demand."

**What does NOT go in CLAUDE.md:**

- Anything obvious from the code.
- Long prose explaining the codebase — read latency on every turn.
- Secrets.
- Volatile state ("we're working on PR #432 today").

## Interactive: CLAUDE.md surgery (live trim, room votes)

> 🎬 **Open `module3_context/before_CLAUDE.md` on the projector.** Walk it line-by-line. Room shouts "cut" for any line they'd remove. Make the cuts live in your editor. Then open `module3_context/after_CLAUDE.md` and `module3_context/SURGERY.md` to compare with the curated answer + the why-we-cut-this reasoning. Recipe 3 in `DEMO_COOKBOOK.md`.

Here's the same pair if you want to walk it from this page:

### ❌ Bad CLAUDE.md (excerpt — the full version is `module3_context/before_CLAUDE.md`, 130 lines)
```markdown
# Stride Backend — Engineering Context

## A short history of why things are the way they are

We originally built on Sequelize but migrated to Prisma in Q3 2024 after
the third major migration footgun (Sequelize would silently drop NOT NULL
on column rename — ask Diego if you want the war story). The Prisma
migration took ~6 weeks; some legacy code in `src/legacy/` still uses
raw SQL queries which we're slowly porting.

We tried microservices in 2023 and rolled it back six months later
(Conway's Law won). The repo is intentionally a modular monolith now.

## Architecture overview

src/api/        — HTTP handlers, one file per resource
src/services/   — business logic, called from handlers
src/db/         — Prisma client, transaction wrappers, raw escape hatch
[... 12 more lines walking through every directory ...]

## Coding standards

- Write good code. Be careful with security — we had a token-leak
  incident in 2023.
- Handle errors.
- Write tests for new features. Aim for 80% coverage on new code.
- Use 2-space indentation, single quotes, semicolons.
- Avoid `any` in TypeScript.
- Follow the existing patterns in the codebase.

## Adding a new endpoint

1. Create the handler in src/api/<resource>.ts
2. Register the route in src/app.ts
3. Add the request/response types in src/types/<resource>.ts
[... 5 more steps ...]

## Current sprint

We are in Sprint 23. Priorities:
- STR-432 — Bulk import endpoint (Priya, in review)
- STR-441 — Migrate /users/me to new SessionStore (Diego, blocked)
[... ]

## Credentials

The production DATABASE_URL is in AWS Secrets Manager under stride/prod/db.
```

*Every section was added in good faith. **The trap is that this doesn't look obviously wrong.** Most teams have something like it committed today.*

<details>
<summary>✅ Reveal: Good CLAUDE.md</summary>

```markdown
# Engineering rules for this repo

## Stack lock-ins
- pnpm only. Do NOT run npm or yarn — they break the lockfile.
- Node 20 LTS pinned in .nvmrc; do not bump without RFC.
- Postgres ≥ 15 features (e.g. MERGE) are allowed.

## Forbidden patterns
- No mocking of the database in integration tests (see /docs/testing.md).
- No --no-verify on commits. Pre-commit hooks are load-bearing.
- No `as any` in TypeScript. Use `unknown` and narrow.

## Conventions you can't see from the code
- Files under src/generated/ are autogenerated by `pnpm gen` — never edit.
- All env access goes through src/env.ts (parsed via zod). Don't read process.env directly.
- HTTP handlers return Response objects, not call res.send (see /docs/handlers.md).

## When in doubt
- Architecture overview: /docs/architecture.md (read on demand).
- Deploy runbook: /docs/deploy.md.

## What I am NOT going to remind you about
- Style — eslint + prettier are authoritative.
- Test running — `pnpm test` runs everything; `pnpm test <path>` for one.
```

**What was wrong with the bad version (130 → 35 lines after surgery):**

1. **Project history (~20 lines)** — "we originally built on Sequelize" is for humans onboarding, not for the agent loop. Belongs in `/docs/rfcs/`. Costs tokens on every turn for content the model uses on ~0% of tasks.
2. **Architecture walkthrough (~15 lines)** — `ls src/` gives the same info on demand. Inlining pays per turn for what should be lazy-loaded.
3. **Tutorials disguised as conventions (~25 lines)** — "Adding a new endpoint" is a how-to for humans. The model can read existing endpoints and follow the pattern. **This is the most common bloat in real-world CLAUDE.md files.**
4. **Empty platitudes (~6 lines)** — "write good code", "handle errors". The model already wants to. Replace with *specific* anti-patterns ("no `as any`", "no mocking the DB in integration tests").
5. **Style enforced by tooling (~5 lines)** — prettier and eslint are authoritative. Format-on-write hook fixes drift. Don't pay token cost every turn for what runs once at save time.
6. **Volatile state (~8 lines)** — "Sprint 23, Maya is on STR-447" is true today, wrong next month. Standup notes belong in your issue tracker.
7. **Credential location (~5 lines)** — even pointing at *where* secrets live narrows attacker search if the file leaks. The model can ask if it needs to know.

**What survives in `after_CLAUDE.md` (the 35-line version):**
- Tool lock-ins: pnpm only, Node 20 pinned, Prisma is the only DB path.
- Specific forbidden patterns with reasons: no `--no-verify`, no mocking the DB in integration tests, no extending the deprecated TOKEN_CACHE.
- Genuine invariants the model can't infer: `src/generated/` is autogenerated; handlers are thin; all writes go through `tx.ts`.
- Pointers (not content): `/docs/architecture.md` linked, not inlined.
- **Explicit non-goals** — "what I am NOT going to remind you about: style, test running, folder layout." Saves the model time looking for guidance that isn't there.

**The math the room should feel:** 500 bytes × 20 turns/session × 5 sessions/week × 50 weeks/year × 50 engineers = **125 MB of model input per year per cuttable section.** Bloat is measurable.

See `module3_context/SURGERY.md` for the full line-by-line walkthrough.
</details>

## Lab 3 — Bootstrap the sandbox (30 min)

1. Run `/init` in the sandbox. Read what it produced.
2. Edit it down: add five rules a senior engineer joining this repo would want, remove anything obvious from code.
3. Add a `.claude/CLAUDE.md` with one *personal* rule (gitignored) — e.g., "always use `bat` instead of `cat` for me".
4. Run `/memory` and confirm both load.
5. In a fresh session, ask Claude to "add an endpoint to delete a TODO." Observe whether your rules are honoured. Iterate.

## Discussion (5 min)

> "What would you put in your team's CLAUDE.md on Monday morning?"

---

# Module 4 — Sub-agents, parallelism, worktrees (12:00 – 13:00)

## Goals

- Know when a sub-agent earns its cost.
- Run sub-agents in parallel from a single message.
- Use worktrees for safe experimental work.

## Concept (15 min)

### What a sub-agent actually is

A sub-agent is a **fresh Claude Code session** spawned by the parent's `Task` tool. Its own context window. The parent only sees the sub-agent's final message.

Two consequences:

- **Sub-agents are a context-isolation tool, not a brain-power tool.** Use them when the parent's window would be polluted by the work, not because "two heads are better."
- **They are not free.** Each spawn re-reads the system prompt and any auto-loaded context. Use them when the work is non-trivial.

### Built-in agent types

- `general-purpose` — default, full toolset.
- `Explore` — read-only, fast, "where is X defined?" type questions.
- `Plan` — designs an implementation plan, returns a step list.

### Custom sub-agents

`.claude/agents/<name>.md` with frontmatter:
```markdown
---
name: migration-auditor
description: Reviews SQL migrations for safety on large tables.
tools: Read, Grep, Bash
model: sonnet
---
You are a database migration reviewer. For any migration file, check:
1. NOT NULL columns added without DEFAULT...
```

### Parallelism

**Multiple `Task` tool calls in *one* assistant message run concurrently.** Use this for independent reviews, fan-out research, multi-location searches.

### Worktrees

`isolation: "worktree"` spawns a sub-agent on a fresh branch in a temporary git worktree. Safe sandbox for risky refactors. Auto-cleaned if no changes were made.

## Interactive: Bad sub-agent prompt vs Good sub-agent prompt

The room has just learned what sub-agents are. Show this prompt to a sub-agent. *"What's wrong?"*

### ❌ Bad sub-agent prompt
```
review the code
```

<details>
<summary>✅ Reveal: Good sub-agent prompt</summary>

```
You are a senior application security engineer. You have NO context about
this project beyond the file you are about to read.

FILE: /repo/src/api/users_api.js

Focus EXCLUSIVELY on security: injection, authn/authz, secrets, SSRF, PII,
DoS, supply chain. Other reviewers are covering quality and performance
in parallel — do not duplicate their work.

OUTPUT: write your review to /repo/.reviews/security.md as markdown with
sections Summary / Critical / High / Medium / Low. Reference line numbers.

RETURN to me: a 4-bullet summary, under 100 words, with severity tags.
Do not paste the full review — the file IS the artifact.
```

**What changed:**
- *Identity:* "you have NO context" — sets the right reading mode.
- *Scope:* explicit lane (security only), so it doesn't drift.
- *Output contract:* file path + structure named, so the parent doesn't have to ask.
- *Return contract:* "4 bullets under 100 words" — keeps the parent's window clean.
- *Coordination:* tells it about the other parallel agents so it doesn't duplicate.
</details>

## Live demo: Three reviewers, same file (the pre-built one)

This demo is **already done** — the artifacts are in `example2_parallel_review/`. Use them.

### Predict-before-reveal (2 min)

> Three Claude sub-agents reviewed the same flawed Express file in parallel: a security specialist, a code-quality specialist, and a generalist. Write down: (a) which agent you think found the most issues, (b) which agent found the most *valuable* issue, (c) one issue you predict all three missed.

### The reveal

Open `example2_parallel_review/OVERLAP.md` on the projector. Walk the table.

**Punchlines to land:**
1. Two specialists in parallel found 17 of 19 issues with depth (payloads, attack chains).
2. The generalist found 16 of 19 — but at shallower depth.
3. Specialists missed exactly one issue: the **route-ordering bug**. Because they stayed in lane. The generalist caught it because they were reading sequentially.
4. **Pattern to take home:** parallel specialists + generalist *backstop*. Three agents in one message, three short summaries returned to the parent, three full review files on disk.

### Hands-on (20 min)

Each participant opens the sandbox, picks a flawed file (pre-staged in the sandbox at `src/legacy/payment_router.js`), and spawns **two specialist sub-agents in a single message**. They compare what came back vs. what a single generalist found.

## Discussion (5 min)

> "What in your current workflow is a sub-agent shaped problem you didn't realise?"

---

# 13:00 – 14:00 — Lunch

---

# Module 5 — Hooks (14:00 – 15:00)

## Goals

- Add deterministic guardrails around a non-deterministic agent.
- Block, transform, and notify based on events.
- Debug a misbehaving hook.

## Concept (25 min)

### The eight hook events

- `PreToolUse` — before a tool runs; can block.
- `PostToolUse` — after a tool runs; can warn.
- `UserPromptSubmit` — before the user's message is sent; can rewrite or block.
- `Stop` — when the assistant finishes a turn.
- `SubagentStop` — when a spawned sub-agent finishes.
- `PreCompact` — before auto-compaction.
- `Notification` — when Claude Code wants to notify the OS.
- `SessionStart` — at session boot.

### Hook anatomy

`.claude/settings.json`:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "node .claude/hooks/block-rm-rf.js" }
        ]
      }
    ]
  }
}
```

The hook is a process. JSON in on stdin, JSON out on stdout. **Exit code 2 = block, 0 = allow, anything else = warn.**

### Real-world hook patterns

- **Secret scanner** — `PreToolUse` on `Bash`/`Write`/`Edit`, refuse on AWS keys.
- **Lint-on-write** — `PostToolUse` on `Edit`/`Write` for `.ts`, run `eslint --fix`.
- **Branch protector** — `PreToolUse` on `Bash`, block `git push` to `main`.
- **Audit log** — every tool call appended to `.claude/audit.log`.
- **Notifier** — `Stop` posts to Slack when long tasks finish.

### Two failure modes

- **Over-blocking** — your hook becomes a wall. Always emit a useful "why" + how to override.
- **Silent passing** — your hook errored and Claude proceeded. Always log to a file, not stdout.

## Interactive: Bad hook vs Good hook

Show the room this `PreToolUse` Bash hook. *"What goes wrong on Monday?"*

### ❌ Bad hook (plausible — find the bugs in 30 seconds)
```bash
#!/usr/bin/env bash
# .claude/hooks/block-prod.sh
# Block writes to production config files.

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path')

if [[ "$FILE" == *"prod"* ]]; then
  echo "Blocked: $FILE looks like a production file" >&2
  exit 2
fi

exit 0
```

*This looks fine. Reads stdin properly, uses jq, has a message, returns 2 to block. **What's wrong with it?***

<details>
<summary>✅ Reveal: Good hook</summary>

```bash
#!/usr/bin/env bash
# .claude/hooks/block-prod.sh
# Reads the JSON tool call from stdin, blocks dangerous prod operations,
# logs every check to .claude/hook-debug.log so silent failures are visible.

set -u
LOG=.claude/hook-debug.log
INPUT=$(cat)
echo "[$(date -u +%FT%TZ)] block-prod input=$INPUT" >> "$LOG"

CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Allow read-only prod inspections.
if echo "$CMD" | grep -Eq '^(gh|kubectl get|aws .* describe|psql .* -c "SELECT)'; then
  exit 0
fi

# Block destructive prod operations.
if echo "$CMD" | grep -Eq '(prod|production)' \
   && echo "$CMD" | grep -Eq '(DROP|DELETE|TRUNCATE|rm -rf|kubectl delete|aws .* delete)'; then
  cat <<EOF >&2
BLOCKED by .claude/hooks/block-prod.sh
Command: $CMD
Reason:  destructive operation against a prod resource.
Override: rerun with PROD_OVERRIDE=1 in your shell, or get peer review.
EOF
  exit 2
fi

exit 0
```

**What was actually wrong with the bad version:**

1. **`*"prod"*` is too greedy.** It matches `production-readme.md`, `prod-tools/lint.js`, anywhere in the path. Real-world false positives within a week.
2. **No allow-list for read-only ops.** Will block `Read(prod_config.yaml)` exactly the same as `Edit(prod_config.yaml)` — just inspecting the file becomes friction.
3. **No override.** When you legitimately need to edit a prod file, your only option is to edit the hook itself. People will disable the hook entirely.
4. **No logging.** When this hook silently exits 0 due to malformed JSON or missing `jq`, you'll never know — the agent proceeds as if no hook ran.
5. **No glob discipline.** `prod_config.yaml` is the target; `prod_config.yaml.bak`, `prod_logs.json`, `production.tf` all match the same loose pattern.

**The good version above fixes each:** tight regex (`prod_*.yaml` or `.yml`, anchored to a path segment), explicit `PROD_OVERRIDE=1` escape hatch with audit log, debug log on every invocation, useful error message that tells you *both* why and how to bypass.
</details>

## 🎬 Live demo before the lab (~5 min)

> **Open `module5_hooks/RUN.md` and follow it.** A working hook + sample prod config. `cd module5_hooks && claude` then ask Claude to update `prod_config.yaml` — the hook fires visibly with a boxed "BLOCKED" message. Show the 30-line bash, show how it's wired in `.claude/settings.json`, show the audit log. Recipe 5 in `DEMO_COOKBOOK.md`.

## Lab 5 — Three guardrails (30 min)

Each participant writes three hooks in `.claude/hooks/` for the sandbox:

1. **Block direct edits to `db/migrations/*.sql`** — must go through migration-auditor sub-agent first.
2. **Auto-format on write** for `.ts` files via `prettier --write`.
3. **Slack-on-Stop** — when a session ends, POST a one-line summary to a webhook (we provide `webhook.site/<id>`).

Verify each by trying to trigger it.

## Discussion (5 min)

> "What is the first hook you'd add to your team's repo on Monday?"

---

# Module 6 — Slash commands & Skills (15:00 – 15:45)

## Goals

- Build a custom slash command.
- Understand what a skill adds and when to reach for it.
- See, with a real artifact, how much a skill changes output quality.

## Concept (10 min)

### Slash commands

- `.claude/commands/<name>.md` (project) or `~/.claude/commands/<name>.md` (user).
- Body is a prompt template. `$ARGUMENTS` is replaced with whatever the user typed after `/<name>`.
- Frontmatter pins model, restricts tools, sets description.

### Skills (the newer model)

- A *capability* — instructions plus assets.
- User-invocable (`/<skill>`) or auto-trigger (model decides based on description).
- Bundles tools, configs, and conventions.

### Quick rule

- **Slash command:** a prompt you re-use. No bundled assets. Lightweight.
- **Skill:** a capability. Has assets, instructions, conventions. Reusable across projects, can auto-trigger.

## Interactive: Bad slash command vs Good slash command

### ❌ Bad `.claude/commands/standup.md`
```markdown
Tell me what's been happening.
```

<details>
<summary>✅ Reveal: Good /standup command</summary>

```markdown
---
description: Generate a standup update for the current branch.
allowed-tools: Bash(git:*), Bash(gh:*), Read
---
You are preparing my standup update for the morning. Be terse and concrete.

Inspect the current branch:
1. Run `git log main..HEAD --oneline --no-merges` to list commits since divergence.
2. Run `git diff main...HEAD --stat` to see scope.
3. Run `gh pr view --json title,state,reviewDecision` if a PR exists for this branch.
4. Read any TODO comments added in the diff (grep `+.*TODO` in `git diff main...HEAD`).

Output exactly four sections, each one line:
- **Yesterday:** what got done (≤ 20 words, paraphrased from commit subjects)
- **Today:** what I'm working on now (infer from uncommitted changes + open TODOs)
- **Blockers:** anything that looks blocked (review pending? failing CI? open question in TODO?)
- **PR:** the PR URL if one exists, otherwise "no PR yet"

Do not write more than four lines total. No preamble.
```

**What changed:**
- *Tools restricted* via `allowed-tools` — no surprise edits.
- *Steps spelled out* — deterministic order, deterministic data sources.
- *Output contract* — exactly four lines, each capped, no preamble. The model can't ramble.
- *Inferable signals* — "blockers" is defined as "what looks blocked," with concrete sources.
</details>

## Live demo: with-skill vs without-skill (the pre-built one)

This demo is **already done** — the artifacts are in `module6_commands_skills/`. Use them.

### Predict-before-reveal (90 seconds)

> Both of these agents got the same prompt: build a fitness profile screen. One had access to a `frontend-design` skill with our team's rules. The other didn't. **In one minute, write down three things you predict will be different.**

### The reveal

Open `module6_commands_skills/COMPARISON.md`. Walk the table on the projector.

**Punchlines:**
- 32 files vs 12. *Not because more is better* — because one agent built **the four async states**, **a real primitive vocabulary**, and **accessibility/haptics/reduced-motion handling** that the other skipped.
- Open `live_demo_without_skill/src/screens/ProfileScreen.tsx` — point out: no loading, no error, no haptics. Renders mockProfile immediately.
- Open `live_demo_with_skill/screens/ProfileScreen/ProfileScreen.tsx` — point out: `useProfile()` hook, three branches (`isLoading` → Skeleton, `error` → ErrorState, `data` → populated), `simulate` prop to preview every state.
- Open both `BUILD_NOTES.md` files. The with-skill one cites *which rule drove which decision*.

**The line to land:** A skill is **a forcing function for the things experienced devs know matter but skip when nobody is enforcing them.**

## Lab 6 — Ship a /standup command (15 min)

1. Write `.claude/commands/standup.md` (use the good prompt above as a starting point, but adapt to your repo).
2. Run it. Tweak until it's actually useful for a 9 a.m. standup.
3. Stretch: convert it to a skill that also offers to post the summary to Slack.

## Discussion

> "Which three slash commands would your team use daily?"

---

# 15:45 – 16:00 — Break

---

# Module 7 — MCP servers (16:00 – 17:00)

## Goals

- Understand MCP as a protocol, not a magic box.
- Connect to an existing MCP server.
- Build a tiny MCP server in TypeScript.

## Concept (20 min)

### What MCP is, in one paragraph

The Model Context Protocol is a JSON-RPC spec letting a host (Claude Code, Claude Desktop, IDE plugins) talk to an external **server** that exposes **tools, resources, and prompts**. The server runs as a subprocess (stdio) or over HTTP. Once connected, its tools appear to Claude as if native.

### Why this matters for senior engineers

You stop writing one-off scripts and asking the model to call them via Bash. Instead, you **expose your internal systems** (Jira, prod read-replica, feature flags, deploy tool) as MCP tools, with proper schemas, permissions, and structured returns.

### Configuration

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "${env:GITHUB_TOKEN}" }
    }
  }
}
```

`/mcp` lists connected servers and their tools.

### Permission model

MCP tools follow the same allow/deny system. They appear as `mcp__<server>__<tool>`. Treat like Bash: gate explicitly.

## Interactive: Bad MCP tool vs Good MCP tool

Show the room this MCP tool definition. *"You're the LLM about to call this. What goes wrong?"*

### ❌ Bad MCP tool (looks fine — find the gaps)
```typescript
server.tool(
  "search_users",
  {
    description: "Search users by name.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"]
    }
  },
  async ({ query }) => {
    const r = await fetch(`${API}/users/search?q=${query}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    return {
      content: [{ type: "text", text: JSON.stringify(await r.json()) }]
    };
  }
);
```

*Verb name. Schema. Bearer auth. JSON output. **What goes wrong in production?***

<details>
<summary>✅ Reveal: Good MCP tool</summary>

```typescript
server.tool(
  "search_users",
  {
    description:
      "Search active users by name fragment OR email fragment. " +
      "Returns up to `limit` matches (default 20, max 100). " +
      "Does NOT return suspended or deleted users — use `lookup_user_by_id` for those.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          minLength: 2,
          description: "Name or email fragment, case-insensitive."
        },
        limit: { type: "integer", minimum: 1, maximum: 100, default: 20 }
      },
      required: ["query"]
    }
  },
  async ({ query, limit = 20 }) => {
    try {
      const r = await fetch(
        `${INTERNAL_API}/users/search?q=${encodeURIComponent(query)}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${INTERNAL_TOKEN}` }, signal: AbortSignal.timeout(5000) }
      );
      if (!r.ok) {
        return {
          isError: true,
          content: [{
            type: "text",
            text: `search_users failed: HTTP ${r.status}. ` +
                  `Tip: if you need a specific known user, call lookup_user_by_id instead.`
          }]
        };
      }
      const users: Array<{id: string; name: string; email: string; team: string}> = await r.json();
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ count: users.length, users }, null, 2)
        }]
      };
    } catch (e) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: `search_users errored: ${(e as Error).message}. ` +
                `If this is a timeout, retry with a more specific query.`
        }]
      };
    }
  }
);
```

**What was actually wrong with the bad version:**

1. **No `minLength`.** Model will call with `q=a`, triggering a mass scan. Set `minLength: 2` (or more).
2. **No URL encoding.** A `query` containing `&team=admin` injects a query parameter — your search becomes a privilege escalation. Use `encodeURIComponent`.
3. **No timeout.** A slow upstream hangs the agent indefinitely. Add `AbortSignal.timeout(5000)`.
4. **Description is human-shaped, not LLM-shaped.** "Search users by name" doesn't tell the model: *what's the limit?* *does it include suspended users?* *when should I use a different tool?* Without those, the model picks the tool for wrong-shaped tasks. Treat the description as a docstring written for the model, not a one-liner for a docs page.
5. **Errors propagate as exceptions.** When the API returns 503, the `await r.json()` throws, the agent sees a generic error, and there's no recovery hint. Use the `isError` response shape with a recovery path: *"timeout — try `lookup_user_by_id` if you have an exact ID."*
6. **No rate-limit awareness.** No `maximum: 100` on a `limit` parameter, no warning to the model that this is an expensive call. The model will fan out concurrently if it thinks that's faster.

**The good version above fixes each:** description tells the model the contract AND the boundaries, input schema constrains, URL encoded, AbortSignal timeout, structured `isError` returns with recovery hints.
</details>

## 🎬 Live demo before the lab (~5 min)

> **Open `module7_mcp/RUN.md` and follow it.** A working 60-line Python MCP server (`oncall_server.py`) plus pre-wired `.claude/settings.json`. `cd module7_mcp && claude`, then `/mcp` shows the server connected, then ask "Who is on call for payments? Page them." Watch Claude call both tools in order. Recipe 7 in `DEMO_COOKBOOK.md`. **One-time setup:** `pip install mcp`.

## Lab 7 — Extend the MCP server (35 min)

The pre-built server has `get_oncall` and `page_oncall`. Extend it:

1. Add a third tool `list_teams()` that returns the list of known teams.
2. Add a `PreToolUse` hook requiring confirmation for `mcp__oncall__page_oncall` (so paging is never silent).
3. Stretch: add `get_oncall_history(team, days)` reading from `pages.log`.

## Discussion

> "Which internal system at your company would you wrap in MCP first? Why?"

---

# Module 8 — Permissions, sandboxing, team rollout (17:00 – 17:30)

## Goals

- Configure permissions sanely for a team.
- Plan a Monday-morning rollout.

## Concept (15 min)

### The four permission modes

- `default` — ask for risky operations.
- `acceptEdits` — auto-allow file edits, still ask for Bash.
- `plan` — read/search only.
- `bypassPermissions` — allow everything (dev/sandbox only).

### Allow / deny lists

```json
{
  "permissions": {
    "allow": [
      "Bash(npm test)",
      "Bash(npm run lint)",
      "Bash(gh pr view:*)"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(git push --force:*)"
    ]
  }
}
```

- Allow patterns silence the prompt.
- Deny patterns hard-block, even in `bypassPermissions`.

### Settings hierarchy

1. CLI flags
2. `.claude/settings.local.json` (gitignored, personal)
3. `.claude/settings.json` (committed, team)
4. `~/.claude/settings.json` (user global)
5. Built-in defaults

`/fewer-permission-prompts` scans your transcripts and suggests an allowlist — run it after a week.

## Interactive: Bad settings.json vs Good settings.json

### ❌ Bad (looks reasonable — find the holes)
```json
{
  "permissions": {
    "allow": [
      "Read", "Grep", "Glob",
      "Bash(npm:*)",
      "Bash(pnpm:*)",
      "Bash(git:*)",
      "Bash(gh:*)",
      "WebFetch"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Edit(.env)"
    ]
  }
}
```

*Specific allows. A deny rule. A senior dev would commit this. **What's wrong?***

<details>
<summary>✅ Reveal: Good</summary>

```json
{
  "permissions": {
    "allow": [
      "Read(**)",
      "Grep",
      "Glob",
      "Bash(pnpm test:*)",
      "Bash(pnpm lint:*)",
      "Bash(pnpm typecheck)",
      "Bash(pnpm build)",
      "Bash(git status)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(gh pr view:*)",
      "Bash(gh pr diff:*)",
      "Bash(gh run view:*)",
      "WebFetch(domain:docs.our-company.com)",
      "WebFetch(domain:github.com)"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(rm -fr:*)",
      "Bash(git push --force:*)",
      "Bash(git push -f:*)",
      "Bash(git push * main)",
      "Bash(git push * master)",
      "Bash(npm:*)",
      "Bash(yarn:*)",
      "Bash(curl:* | sh*)",
      "Bash(curl:* | bash*)",
      "Edit(.env:*)",
      "Edit(secrets/**)",
      "Read(secrets/**)"
    ]
  }
}
```

**Seven subtle holes in the bad version above. Walk them with the room:**

1. `Bash(npm:*)` and `Bash(pnpm:*)` allow `npm publish` / `pnpm publish` — agent can ship packages with whatever `NPM_TOKEN` it inherits.
2. `Bash(git:*)` allows `git push --force origin main`, `git reset --hard`, `git filter-branch`, `git rm -rf .`. Whole categories of disasters.
3. `Bash(gh:*)` allows `gh secret set`, `gh repo delete`, `gh repo edit --visibility public`. The CLI is a swiss army knife.
4. `WebFetch` unrestricted — agent can fetch `http://169.254.169.254/` (cloud metadata), `localhost:8500` (Consul), arbitrary exfiltration targets. Classic SSRF surface.
5. `Bash(rm -rf:*)` deny is half-protection — does **not** match `find . -delete`, `git clean -fdx`, `ruby -e 'FileUtils.rm_rf "/"'`. Deny lists are necessary, never sufficient.
6. `Edit(.env)` is literal — `.env.local`, `.env.production`, `secrets/api-key.json` all unblocked. Use `Edit(.env*)`, `Edit(secrets/**)`.
7. No deny for curl-to-shell (`curl ... | bash`), the classic supply-chain pattern.

**Above all: `Bash(<binary>:*)` is almost always wrong.** Allow specific subcommands. The good version below allows specific verbs only — `pnpm test:*`, `git status`, `gh pr view:*` — and pairs the deny list with the principle that you can't enumerate destruction; you layer with hooks for patterns.
</details>

## 🎬 Files to project (~3 min before the lab)

> **Open `module8_permissions/bad_settings.json` and `good_settings.json` side by side.** Or run `diff module8_permissions/bad_settings.json module8_permissions/good_settings.json` to make the contrast pop. Recipe 8 in `DEMO_COOKBOOK.md`.

## Lab 8 — Lock down the sandbox (15 min)

Take the sandbox, produce a committable `settings.json` and `CLAUDE.md` you'd defend in code review with a paranoid security lead.

---

# Module 9 — Claude Agent SDK & headless usage (17:30 – 18:00)

## Goals

- Know when to graduate from the CLI to the SDK.
- See a 30-line agent that does real work.

## Concept (15 min)

### Tools in the family

- **Claude Code** — polished, opinionated agent built on the Anthropic API + tool harness.
- **Claude Agent SDK** — same harness, exposed as a library. Build *your own* agent.
- **Anthropic SDK** — raw API. Use when you want zero opinionation.

### When to reach for which

- Daily dev work → Claude Code.
- Recurring scheduled task → Claude Code in headless mode (`claude -p`) via cron, or `/schedule`.
- Embedding in your product (a "fix this bug" button in CI) → Agent SDK.
- Pure inference (classification, extraction) → raw Anthropic SDK with prompt caching.

### A 30-line agent (Python)

```python
from claude_agent_sdk import Agent, tool
import subprocess

@tool
def list_failing_tests() -> list[str]:
    """Return the names of currently failing pytest tests."""
    out = subprocess.run(
        ["pytest", "--collect-only", "-q"],
        capture_output=True, text=True
    )
    return [l for l in out.stdout.splitlines() if "FAILED" in l]

agent = Agent(
    model="claude-sonnet-4-6",
    system="You triage failing tests. Be terse.",
    tools=[list_failing_tests],
)

print(agent.run("Summarise what's broken in <50 words."))
```

### Headless Claude Code in CI

```bash
claude -p "Run the test suite. If anything fails, open a GitHub issue with the diff and a one-paragraph hypothesis." \
  --permission-mode bypassPermissions \
  --max-turns 8 \
  --output-format json > result.json
```

Wire into a nightly Action. Add a hook that posts the result to Slack. **You now have a self-triaging test suite.**

## Interactive: Bad headless invocation vs Good headless invocation

### ❌ Bad (looks like a real CI invocation — find what's missing)
```bash
claude -p "Run the test suite. If anything fails, fix it and open a PR."
```

*Real instruction. Real intent. **What goes wrong when this runs at 3 a.m. in CI?***

<details>
<summary>✅ Reveal: Good</summary>

```bash
claude -p "$(cat <<'PROMPT'
You are running headlessly in CI. Your goal: produce a JSON report of
the test failure on this commit, nothing else.

1. Run `pnpm test --reporter=json` and capture stdout.
2. Identify the first failing test. Read its source file.
3. Read the file under test. Form a one-paragraph hypothesis.
4. Print exactly this JSON to stdout, no other text:
   {
     "failing_test": "<name>",
     "hypothesis": "<one paragraph>",
     "files_to_inspect": ["<path>", "<path>"]
   }

If you cannot do this within budget, print {"error": "<reason>"} and exit.
Do not open files outside the repo. Do not modify anything.
PROMPT
)" \
  --permission-mode plan \
  --max-turns 6 \
  --output-format json \
  > /tmp/claude-result.json

# Validate before piping anywhere downstream.
jq -e '.failing_test // .error' /tmp/claude-result.json
```

**What was actually wrong with the bad version:**

1. **No `--max-turns`.** The agent can loop indefinitely. A bad fix attempt that triggers another test failure that the agent then "fixes" again — at $0.10 per turn, this is hours of cost while you sleep.
2. **No `--permission-mode`.** In headless mode, permission prompts hang forever (no human to answer). Either the agent gets blanket access (dangerous) or every action stalls (worse than useless).
3. **No `--output-format`.** Output is unstructured prose. Your downstream parser is grep against natural language. Brittle on day one.
4. **"Fix it" is unbounded scope.** "Fix" could mean: editing the test, editing the implementation, deleting the test, refactoring three modules. The agent picks; you find out from the diff.
5. **"Open a PR" assumes auth, branch protection, review requirements.** Does the runner have a GitHub token with write access? Is there a CODEOWNERS that auto-requests review? Does pushing to a non-main branch trigger CI again, recursively?
6. **No timeout, no cost cap, no observability.** When this run goes wrong, you find out from the bill, not the alerting.

**The good version above replaces every one of those with infrastructure:** read-only `--permission-mode plan` so the worst case is a wasted run; `--max-turns 6` as a hard cap; `--output-format json` with an explicit schema in the prompt; `jq -e` validation before any downstream consumer trusts the output; explicit fallback for the cannot-determine case.
</details>

## 🎬 Live demo (~3 min, runnable)

> **Run `bash module9_sdk/quick_demo.sh`.** Pipes a fake test-failure log into `claude -p`, real JSON triage report comes back in <30 seconds. Show the 20-line script after. That's the entire "self-triaging CI" pattern. See `module9_sdk/RUN.md`. Recipe 9 in `DEMO_COOKBOOK.md`.

## Optional extended demo (15 min)

Take a participant's volunteered repo, drop in a `claude -p` triggered by a GitHub Action on every failed CI, watch an issue get filed.

---

# 18:00 — Wrap-up & retro (15 min)

**Round-table, one sentence each:**

- What's the first thing you'll change about your workflow tomorrow?
- What's the first thing you'll change about your team's workflow this quarter?
- What did the workshop *not* cover that you wish it had?

**Capstone takeaway** (printed handout):

1. Claude Code is an agent loop. Control the loop.
2. Context, tools, permissions, loop control — every problem is one of the four.
3. Invest in `CLAUDE.md`, hooks, and slash commands like you invest in lint configs.
4. Sub-agents isolate context, not work.
5. MCP turns your internal systems into first-class tools.
6. Headless mode + the SDK is where compounding gains live.

---

# Appendix A — Lab artifacts each participant leaves with

- A populated `CLAUDE.md` for the sandbox.
- `.claude/settings.json` with permissions and hook config.
- `.claude/hooks/` — three working hooks.
- `.claude/commands/standup.md` (and optional skill version).
- `.claude/agents/perf-auditor.md`.
- A working MCP server (TypeScript) registered with Claude Code.
- The printed cheat-sheet (Appendix B).

---

# Appendix B — One-page cheat-sheet (print)

**Modes:** `Shift+Tab` cycles `default → acceptEdits → plan`.
**Memory:** `/memory`, `/clear`, `/compact <focus>`.
**Inspect:** `/mcp`, `/agents`, `/hooks`, `/permissions`, `/doctor`.
**Switch:** `/model`, `/fast`.
**Resume:** `/resume`, `claude --continue`.
**Headless:** `claude -p "<prompt>" --max-turns N --output-format json`.

**File map:**

- `~/.claude/CLAUDE.md` — your personal preferences
- `<repo>/CLAUDE.md` — team conventions, committed
- `.claude/settings.json` — permissions, hooks, MCP servers (committed)
- `.claude/settings.local.json` — personal overrides (gitignored)
- `.claude/agents/*.md` — custom sub-agents
- `.claude/commands/*.md` — custom slash commands
- `.claude/hooks/*` — hook scripts
- `~/.claude/projects/<dir>/memory/` — auto-memory store

**Hook exit codes:** `0` allow, `2` block, anything else warn.

**Sub-agent rule of thumb:** use to *isolate context*, not add brainpower. Spawn in parallel when independent. Use worktrees for risky experiments.

**MCP rule of thumb:** wrap your internal systems with structured tools instead of asking the model to scrape Bash output.

**Four levers, every time:** context, tools, permissions, loop control.

---

# Appendix C — Facilitator notes

- Total content is intentionally ~10% over budget. Cut Module 9 to a demo if running long.
- Module 5 (hooks) is the highest-leverage module — never cut it.
- Keep one machine projecting throughout; the demo terminal should always be visible.
- Have a "questions parking lot" whiteboard; do not let edge-case questions derail the timeline.
- Plant a deliberately broken hook early — someone will hit it during Module 5 and it teaches the debugging story for free.
- The two pre-built live demos (Modules 4 and 6) are the highest-impact moments. They don't require the room to wait — agents already ran. Use the predict-before-reveal scripts in `OVERLAP.md` and `COMPARISON.md`.
