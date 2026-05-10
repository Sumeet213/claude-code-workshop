# Workshop pre-flight — read this the night before

**Estimated time: 10 minutes.** If you can't get past step 4, ping the workshop organiser before 9 a.m. on the day.

---

## 1. Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
claude --version    # should print a version
claude doctor       # should pass all checks
```

If you don't have an Anthropic account / API access, the organiser will hand out throwaway keys at 09:00 — but **you must have the CLI installed**.

## 2. Get the workshop repo

You'll receive a link / USB drive / AirDrop on the day. Extract to:

```bash
~/workshop_demo
```

(Or anywhere — the absolute paths in `module7_mcp/.claude/settings.json` need updating to wherever you put it. The setup script handles that.)

## 3. Run the setup script

```bash
cd ~/workshop_demo
bash scripts/setup.sh
```

This will:
- Make hook scripts executable.
- Install the `mcp` Python package (for Module 7).
- Patch the MCP server path in `module7_mcp/.claude/settings.json` to your machine.
- Sanity-check that `claude`, `python3`, `pip`, `git`, `jq`, and `bat` (or `cat`) are present.
- Open `WORKSHOP.html` in your browser.

If `bat` is missing, install it for syntax-highlighted file viewing during exercises:

```bash
brew install bat       # macOS
```

(Plain `cat` works fine if you skip this.)

## 4. Verify each module's runnable demo

```bash
# Module 5 — hook fires
cd ~/workshop_demo/module5_hooks
claude
> Update sample_files/prod_config.yaml — change the database host to "test.internal"
# You should see a red BLOCKED box. Type /exit to leave.
cd -

# Module 7 — MCP server connects
cd ~/workshop_demo/module7_mcp
claude
> /mcp
# You should see "oncall" listed with two tools. Type /exit.
cd -

# Module 9 — headless one-shot
bash ~/workshop_demo/module9_sdk/quick_demo.sh
# You should see JSON output within 30 seconds.
```

If all three pass, you're ready.

## 5. What the day looks like

- 9 modules over 8 hours.
- **Most modules end with a 5–15 minute "Your turn"** where you run the same exercise in your own Claude, then compare with your neighbour.
- Two big moments are pre-built artifacts the trainer walks through (parallel reviewers in Module 4, skill comparison in Module 6).
- Bring a sandbox repo of your own — by lunch you'll want to try things on real code.

## 6. What to bring

- Laptop with the above installed.
- Headphones (optional, for individual lab moments).
- A small repo of your own — ideally one you know well but where you'd accept some experimental edits.
- Coffee.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `claude doctor` fails | Re-install: `npm uninstall -g @anthropic-ai/claude-code && npm install -g @anthropic-ai/claude-code` |
| `pip install mcp` fails | Use a venv: `python3 -m venv .venv && source .venv/bin/activate && pip install mcp` and update the python path in `module7_mcp/.claude/settings.json` |
| `/mcp` shows no servers | The path in `.claude/settings.json` is wrong — re-run `bash scripts/setup.sh` |
| Hook doesn't fire | `chmod +x module5_hooks/.claude/hooks/*.sh` |
| `claude` asks you to authenticate | Use the API key handed out at 09:00 |
