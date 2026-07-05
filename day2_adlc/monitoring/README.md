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

Tracing tools built for LLM apps — **Arize Phoenix** (open source, self-host) or
**Langfuse** (open source, self-host) — capture the full prompt → tool-calls →
response tree per request, which is what you'll actually stare at during an
incident. Grafana stays for the aggregate metrics + alerting.

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
