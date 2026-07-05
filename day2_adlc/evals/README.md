# AI Evals — three layers, cheapest first

The scenario: an AI feature that turns raw support tickets into structured JSON
(`sentiment`, `category`, `summary`). `tickets/` holds the inputs; `outputs/`
holds five model outputs — some fine, some subtly broken. Your job is to catch
the broken ones **without reading all five by hand**, because in production
there will be five thousand.

## Layer 1 — code-based checks (free, deterministic, run on every output)

```bash
cd day2_adlc/evals
node check.js
```

`check.js` validates what code *can* validate: is it JSON at all, are
`sentiment`/`category` legal enum values, is the summary within length limits.
Watch what it catches — and note what it *can't*: a summary that is fluent,
valid, and **wrong**.

## Layer 2 — LLM-as-judge (cheap-ish, semantic, run on every output or a sample)

```bash
bash judge.sh            # judges every output, ~30s, a few cents
bash judge.sh outputs/output_3.json   # judge just one
```

`judge.sh` shows the judge the *original ticket* and the *output*, plus a rubric,
and demands a JSON verdict: `{"faithful": bool, "score": 1-5, "reason": "..."}`.
The rubric is the eval. Vague rubric → vague judge. Read the one in the script.

At least one output here passes every code check and **fails the judge** —
it hallucinates a detail that isn't in the ticket. That's the case that
justifies the whole layer.

## Layer 3 — human-in-the-loop (expensive, run on a sample)

You don't review everything; you review **where the layers disagree** and a
random sample of everything else. In the exercise: the room votes on one
disputed verdict, then compares against the judge's reasoning.

## The rule of thumb to take home

1. Everything deterministic goes in code checks — never pay a model to count characters.
2. LLM-as-judge for faithfulness/tone/quality — with a written rubric, forced
   JSON verdicts, and the *source* text in the judge's context.
3. Humans audit the judge, not the firehose: disagreements + a fixed random sample.
4. Track scores over time. An eval you run once is a demo; an eval in CI is a seatbelt.
