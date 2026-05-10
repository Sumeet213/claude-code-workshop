# Module 7 — Live MCP server demo (~5 min)

## What this demonstrates

A 60-line Python MCP server exposing two tools (`get_oncall`, `page_oncall`) — Claude Code picks them up automatically and uses them like any built-in tool. Same pattern works for wrapping any internal system at your company.

## Setup (one-time, do this BEFORE the workshop)

```bash
cd /Users/sdesai/work/workshop_demo/module7_mcp
pip install mcp                 # installs the official MCP SDK
python3 oncall_server.py        # sanity-check it starts; Ctrl-C to exit
```

If `pip install mcp` fails, try `pip install mcp[cli]` or use a venv:

```bash
python3 -m venv .venv && source .venv/bin/activate && pip install mcp
```

Then update `.claude/settings.json` to use the venv's python:

```json
"command": "/Users/sdesai/work/workshop_demo/module7_mcp/.venv/bin/python"
```

## On the day — exactly what to type

**Read this aloud first:** *"I have a tiny Python MCP server exposing our oncall rotation. Watch Claude pick it up."*

```bash
cd /Users/sdesai/work/workshop_demo/module7_mcp
claude
```

In Claude:

```
> /mcp
```

**You should see:** the `oncall` server connected, with `get_oncall` and `page_oncall` listed.

```
> Who is on call for the payments team? Page them about the failing migration on prod-db-3.
```

**You should see:** Claude calls `mcp__oncall__get_oncall(team="payments")` first, sees Priya is on call, then calls `mcp__oncall__page_oncall(team="payments", message="...")`. Both with approval prompts the first time.

```
> /exit
cat pages.log                   # the page you just sent
bat oncall_server.py            # show the 60-line implementation
bat .claude/settings.json       # show how it's wired
```

**Punchline:** *"Stop writing one-off scripts and asking the model to call them via Bash. Wrap your internal systems with structured tools — names that are verbs, descriptions that tell the model the boundaries, structured returns. The model uses them like any other tool."*

## What to point at in `oncall_server.py`

- `@mcp.tool()` decorator — that's the entire registration story.
- The docstring becomes the tool description the model reads.
- Return value is JSON-serialised automatically.
- Error path returns `{"error": "..."}` instead of raising — the model can read it and recover.

## If the demo dies

- `/mcp` shows nothing → check the path in `.claude/settings.json` is absolute and correct.
- Server crashes → check Python version (`python3 --version`, want ≥ 3.10) and `pip show mcp`.
- Hangs on first call → first-time MCP handshake can take 2-3 seconds; just wait.
