"""
Tiny MCP server exposing two tools: get_oncall(team) and page_oncall(team, message).
Reads from oncall.json, appends pages to pages.log.

Workshop demo for Module 7. Use the FastMCP convenience wrapper from the
official `mcp` Python SDK:  pip install mcp

Run standalone (sanity check before wiring into Claude Code):
    python3 oncall_server.py
    # then send MCP protocol messages over stdio (or use claude-code's /mcp).
"""

import json
from datetime import datetime
from pathlib import Path

from mcp.server.fastmcp import FastMCP

HERE = Path(__file__).parent
DATA = HERE / "oncall.json"
PAGES_LOG = HERE / "pages.log"

mcp = FastMCP("oncall")


@mcp.tool()
def get_oncall(team: str) -> dict:
    """Return who is currently on call for the given team.

    Teams: payments, search, platform, mobile.
    Returns {name, email, slack_handle, until_iso} or {error}.
    """
    data = json.loads(DATA.read_text())
    rotation = data.get(team)
    if not rotation:
        return {"error": f"Unknown team '{team}'. Known teams: {sorted(data)}"}
    return rotation


@mcp.tool()
def page_oncall(team: str, message: str) -> dict:
    """Page the current on-call engineer for the given team.

    Appends a page record to pages.log and returns confirmation.
    Use sparingly — pages wake people up.
    """
    if not message or len(message) < 5:
        return {"error": "Message must be at least 5 characters."}

    rotation = json.loads(DATA.read_text()).get(team)
    if not rotation:
        return {"error": f"Unknown team '{team}'."}

    record = {
        "ts": datetime.utcnow().isoformat() + "Z",
        "team": team,
        "paged": rotation["name"],
        "message": message,
    }
    with PAGES_LOG.open("a") as f:
        f.write(json.dumps(record) + "\n")

    return {"status": "paged", "who": rotation["name"], "via": rotation["slack_handle"]}


if __name__ == "__main__":
    mcp.run()
