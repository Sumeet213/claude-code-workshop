# Pre-workshop setup — do this the night before Day 1

**Ten minutes. If you get stuck past step 4, message the organiser tonight —
not at 8:55 tomorrow.**

You're attending a 2-day hands-on workshop. Day 1 you learn to drive Claude
Code like an instrument; Day 2 you wire it into a real development lifecycle
and build a team project. Almost nothing is slides — your laptop is the
workshop, so this setup matters.

## 0. Windows users — one extra minute first

The kit runs in **bash**. Install the tools in PowerShell, then do **every
other step in Git Bash** (installed with Git — find it in the Start menu).
Not PowerShell, not CMD:

```powershell
winget install Git.Git OpenJS.NodeJS.LTS Python.Python.3.12 jqlang.jq
```

Close and reopen your terminal after installing, then open **Git Bash** and
continue at step 1 — the commands are identical to macOS from here on.
(Already a WSL user? WSL works too.)

macOS/Linux users: skip this step.

## 1. Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
claude --version
```

No Node? macOS: `brew install node`. Windows: covered by step 0.

## 2. Authenticate

```bash
claude
```

Follow the login flow (Claude subscription or API key — the organiser will
tell you which applies; throwaway API keys are available on the day if
needed). Then:

```bash
claude doctor
```

Everything should be green or yellow, nothing red.

## 3. Get the workshop kit

```bash
git clone https://github.com/Sumeet213/claude-code-workshop.git ~/workshop_demo
cd ~/workshop_demo
bash scripts/setup.sh
```

`setup.sh` is idempotent — safe to re-run. It needs `python3` (3.10+), `git`,
and `jq` (`brew install jq` if missing).

`setup.sh` also registers the workshop's MCP server ("oncall") for you — it
prints a ✓ when done. If it prints a `claude mcp add oncall ...` command
instead (e.g. you installed claude after running setup), copy-paste and run
that one command, then confirm with `claude mcp list` — you should see
`oncall … ✔ Connected`.

## 4. Verify

```bash
bash scripts/test_all.sh
```

Every check should pass. If one fails, the output says exactly what and how
to fix it. Re-run until green.

## 5. Two things to bring (Day 2 uses them)

1. **A real failing log** from your actual work — CI output, a stack trace,
   a flaky test dump. Ugly is perfect. You'll pipe it through an AI triage
   bot you build.
2. **One feature you wish existed** in a repo you own — one sentence is
   enough. You'll turn it into a spec.

## 6. What the two days look like

- **Day 1:** icebreaker + teams → fundamentals (agent loop, plan mode,
  context, permissions) → advanced (parallel agents, slash commands, skills,
  hooks, MCP). Thirteen exercises; you type constantly.
- **Day 2:** the agentic development lifecycle (specs, TDD, AI evals, CI/CD,
  cloud, monitoring) → 3-hour team capstone → live demos → out by 4:30 PM.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `claude: command not found` | Check npm global bin is on PATH: `npm bin -g` |
| Login loop / auth errors | `claude logout` then `claude` again |
| `setup.sh` fails on python | Install Python 3.10+: `brew install python@3.13` |
| `jq: command not found` | `brew install jq` (or apt/dnf equivalent) |
| Corporate proxy blocks API | Test from a personal network tonight; flag the organiser |
| test_all shows a red check | Read its message — every check prints its own fix |
