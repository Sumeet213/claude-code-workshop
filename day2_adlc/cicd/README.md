# CI/CD with an agent in the loop

Two workflow files here, both real YAML you can lift into a repo today:

| File | What it does | The lesson |
|---|---|---|
| `claude-pr-review.yml` | Claude reviews every PR and posts inline comments | agent-as-reviewer |
| `deploy-pipeline.yml` | test → staging → smoke → **Claude triages failures** → gated prod | agent-as-first-responder |

## The headless building block

Everything in CI reduces to one primitive you already met in the M9 demo:

```bash
cat failure.log | claude -p "Diagnose this failure. Reply as JSON: {\"cause\": ..., \"fix\": ..., \"confidence\": ...}" \
  --max-turns 4 --output-format json
```

Structured in, structured out, capped turns, exit code you can branch on.
CI is just this primitive wrapped in YAML.

## Hands-on (15 min): put YOUR failure through the pipe

Grab a real failing log from your own work (CI log, stack trace, flaky test —
anything). If you have nothing, use `../..//module9_sdk/sample_test_failure.txt`.

```bash
cat my_real_failure.log | claude -p "You are a CI triage bot. Output JSON only:
{\"probable_cause\": str, \"suggested_fix\": str, \"files_to_look_at\": [str], \"confidence\": \"high|medium|low\"}" \
  --max-turns 4 --output-format json | jq -r '.result'
```

Then the money question: **would you auto-act on `confidence: high`?**
Discuss with your neighbour where you'd put the human gate.

## Multi-env rules of thumb

- Agents propose, pipelines dispose: Claude comments/labels/diagnoses freely,
  but *promotion* to prod goes through the same environment gates as humans.
- Give CI agents the narrowest possible permissions (read + comment on PRs;
  never push, never `secrets: write`). Same lever as Day 1 M8, new venue.
- Cap `--max-turns` and set timeouts — a runaway agent in CI is a bill, not a bug.
