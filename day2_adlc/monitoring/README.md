# Production monitoring for AI usage

You shipped an agent. Now: what do you put on the dashboard? Two distinct
things to monitor — don't conflate them.

## A. Monitoring Claude Code usage itself (the team's tool)

Claude Code emits OpenTelemetry natively. Point it at any OTLP collector and
you get team-level dashboards in Grafana/Datadog/CloudWatch:

```bash
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_ENDPOINT=http://your-collector:4317
```

What you get: token usage + cost per user/model, session counts, lines of code
changed, tool acceptance/rejection rates. What managers actually ask for:
**cost per engineer per week** and **% of suggestions accepted**.

## B. Monitoring the AI features you ship (your product)

Four signal groups, in priority order:

| Signal | Examples | Why first |
|---|---|---|
| Cost & tokens | tokens/request, cost/tenant/day, cache hit rate | the bill surprises you before the quality does |
| Reliability | latency p95, timeout rate, tool-error rate, retry storms | agents fail weirder than services — a 40-turn loop *is* an outage |
| Quality | eval scores on sampled prod traffic (reuse `../evals/judge.sh` logic), thumbs-up rate, human-override rate | this is your Layer-2 eval, promoted to prod |
| Safety | prompt-injection detections, blocked-tool-call count, PII flags | rare, but the ones that page you |

Tracing tools built for LLM apps — **Langfuse** or **Arize Phoenix** (both
open source, both self-hostable) — capture the full prompt → tool-calls →
response tree per request, which is what you'll actually stare at during an
incident. What that buys you in practice, using Langfuse as the example:

- **Cost and latency per trace, per user, per feature** out of the box —
  tag traces with `tenant_id`/`feature` and the "which customer is burning
  the budget" question becomes a filter, not a query.
- **Eval scores live on the traces** (see `../evals/README.md`): sample prod
  traffic, run your judge, write the score back. Your quality alert is then
  just "avg faithfulness score, 1h window, below threshold."
- **Session/trace drill-down during incidents**: from the alert to the exact
  prompt + tool calls + retries that produced the bad output, in two clicks.
- Self-hosting matters here — traces contain prompts, and prompts contain
  customer data. Keep them inside your VPC, behind your SSO.

Division of labour: **Langfuse/Phoenix for per-request truth** (traces,
scores, drill-down), **Grafana for aggregates and paging** (metrics,
thresholds, alert routing).

## Alerts worth writing on day one

1. Daily model spend > N× trailing 7-day average (catches loops and abuse).
2. Judge-eval score on sampled traffic drops below threshold (catches silent
   quality regressions — model updates, prompt drift, upstream data changes).
3. Tool-error rate spike (catches broken integrations the model then
   hallucinates around — the scariest failure mode, because output stays fluent).

## Hands-on (10 min): design your dashboard

Sketch (paper is fine) the 6 tiles of the dashboard for the AI feature your
capstone team will build this afternoon. For each tile: metric, threshold,
who gets paged. Teams present one tile each — fastest round wins.
