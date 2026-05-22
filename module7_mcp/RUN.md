# Module 7 — MCP server demo

## What this demonstrates

A 60-line Python MCP server exposing two tools (`get_oncall`, `page_oncall`) — Claude Code picks them up and uses them like any built-in tool. Same pattern works for wrapping any internal system at your company.

## Setup

```bash
cd ~/workshop_demo/module7_mcp
python3 -m venv .venv && .venv/bin/pip install mcp
```

Sanity-check the import works:

```bash
.venv/bin/python -c "from mcp.server.fastmcp import FastMCP; print('ok')"
```

### Register the server with Claude Code

Use absolute paths — replace `$HOME` with the literal path if your shell doesn't expand it inside `claude mcp add`:

```bash
claude mcp add oncall \
  "$HOME/workshop_demo/module7_mcp/.venv/bin/python" \
  "$HOME/workshop_demo/module7_mcp/oncall_server.py"

claude mcp list   # expect: oncall: ... - ✓ Connected
```

## Run it

```bash
cd ~/workshop_demo/module7_mcp
claude
```

In Claude:

```
> /mcp
```

You should see the `oncall` server connected, with `get_oncall` and `page_oncall` listed.

```
> Who is on call for the payments team? Page them about the failing migration on prod-db-3.
```

Claude calls `mcp__oncall__get_oncall(team="payments")` first, sees who is on call, then calls `mcp__oncall__page_oncall(team="payments", message="...")`. Both with approval prompts the first time.

## Inspect

```
> /exit
cat pages.log                   # the page you just sent
bat oncall_server.py            # the 60-line implementation
```

## What to point at in `oncall_server.py`

- `@mcp.tool()` decorator — that's the entire registration story.
- The docstring becomes the tool description the model reads.
- Return value is JSON-serialised automatically.
- Error path returns `{"error": "..."}` instead of raising — the model can read it and recover.

## If it breaks

- `/mcp` shows nothing → run `claude mcp list`. If `oncall` is missing, re-run the `claude mcp add oncall ...` command above.
- `/mcp` shows `oncall` but `failed to connect` → check the venv python exists (`ls module7_mcp/.venv/bin/python`).
- Server crashes → check Python ≥ 3.10 and `module7_mcp/.venv/bin/python -c "import mcp.server.fastmcp"`.
- Hangs on first call → first-time handshake can take 2-3 seconds; just wait.
