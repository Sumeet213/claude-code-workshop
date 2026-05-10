# Module 9 — Headless one-shot demo (~3 min)

## What this demonstrates

`claude -p` runs Claude Code as a non-interactive subprocess. Pipe a prompt in, get JSON out. Wire that into a GitHub Action and you have a self-triaging test suite — no human needed for the first pass.

## Setup (one-time)

```bash
chmod +x /Users/sdesai/work/workshop_demo/module9_sdk/quick_demo.sh
```

That's it. Uses your already-authenticated `claude` CLI, no extra installs.

## On the day — exactly what to type

**Read this aloud first:** *"This is the same Claude. But called from a shell script. No human in the loop. Watch."*

```bash
cd /Users/sdesai/work/workshop_demo/module9_sdk
bash quick_demo.sh
```

**You should see:** ~15–30s of waiting, then the raw JSON envelope, then the extracted result — a structured triage report with `failing_test`, `hypothesis`, and `files_to_inspect`.

```bash
bat quick_demo.sh         # 20 lines. that's the whole thing.
bat sample_test_failure.txt
```

**Punchline:** *"Wire this into a nightly GitHub Action. Add a hook that posts the result to Slack. You now have a self-triaging test suite. The same pattern, with the Claude Agent SDK, lets you embed this into your own product — a 'fix this bug' button that actually does something."*

## If you have 30 more seconds, show the production wrapper

```bash
echo 'This is what the same call looks like in CI:'
cat <<'CI'
claude -p "<prompt>" \
  --permission-mode bypassPermissions \
  --max-turns 8 \
  --output-format json \
  > /tmp/result.json
jq -e '.failing_test // .error' /tmp/result.json
CI
```

Talking points:
- `--permission-mode bypassPermissions` — only inside an isolated CI runner.
- `--max-turns 8` — hard cap so a runaway loop costs at most 8 turns.
- `jq -e` — validates the output before any downstream consumer trusts it.
- `permission-mode plan` if the agent should be **strictly read-only** (recon-only triage).

## Variants the room will ask about

- **"Can it modify code?"** Yes — drop `--permission-mode plan` and add an allow-list. CI wrappers usually let it edit a fresh branch and open a PR rather than touching `main`.
- **"Cost?"** Each `claude -p` run is a single session. Token usage shows in the JSON envelope.
- **"What if it gets stuck?"** `--max-turns N` is the hard cap. Combine with a wallclock timeout in the shell (`timeout 300 bash quick_demo.sh`).
