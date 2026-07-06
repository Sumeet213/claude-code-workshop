# Module 9 — Headless one-shot demo

## What this demonstrates

`claude -p` runs Claude Code as a non-interactive subprocess. Pipe a prompt in, get JSON out. Wire that into a GitHub Action and you have a self-triaging test suite — no human needed for the first pass.

## Setup

```bash
chmod +x ~/workshop_demo/day2_adlc/headless/quick_demo.sh
```

That's it. Uses your already-authenticated `claude` CLI, no extra installs.

## Run it

```bash
cd ~/workshop_demo/day2_adlc/headless
bash quick_demo.sh
```

~15–30s of waiting, then the raw JSON envelope, then the extracted result — a structured triage report with `failing_test`, `hypothesis`, and `files_to_inspect`.

## Inspect

```bash
bat quick_demo.sh         # ~20 lines, the whole thing
bat sample_test_failure.txt
```

## The production wrapper pattern

```bash
claude -p "<prompt>" \
  --permission-mode bypassPermissions \
  --max-turns 8 \
  --output-format json \
  > /tmp/result.json
jq -e '.failing_test // .error' /tmp/result.json
```

Notes:
- `--permission-mode bypassPermissions` — only inside an isolated CI runner.
- `--max-turns 8` — hard cap so a runaway loop costs at most 8 turns.
- `jq -e` — validates the output before any downstream consumer trusts it.
- `--permission-mode plan` if the agent should be **strictly read-only** (recon-only triage).

## Common questions

- **Can it modify code?** Yes — drop `--permission-mode plan` and add an allow-list. CI wrappers usually let it edit a fresh branch and open a PR rather than touching `main`.
- **Cost?** Each `claude -p` run is a single session. Token usage shows in the JSON envelope.
- **What if it gets stuck?** `--max-turns N` is the hard cap. Combine with a wallclock timeout (`timeout 300 bash quick_demo.sh`).
