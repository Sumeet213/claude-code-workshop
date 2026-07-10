# CrewAI demo — build-your-own-agents, runnable

The deck's "whole idea in 15 lines," wired to real data: a two-agent crew
(Support Analyst → Triage Writer) turns a raw ticket from `../evals/tickets/`
into the same triage JSON the evals exercise validates.

## Run it

```bash
cd day2_adlc/crewai
python3 -m venv .venv && .venv/bin/pip install "crewai[anthropic]"   # one-time, ~2 min
export ANTHROPIC_API_KEY=sk-ant-...                     # your key
.venv/bin/python crew_demo.py
```

You'll see each agent's turn narrated (`verbose=True`), then the final JSON.
Uses a fast, low-cost Claude model via CrewAI's native Anthropic
provider (`anthropic/claude-haiku-4-5`) — a run costs well under a cent.

## What to point at when presenting

- **Agents are roles** — `role`, `goal`, `backstory` are the job description.
  Note the analyst's goal: *only verifiable facts* — that's the levers'
  "context" idea, packaged differently.
- **Tasks chain via `context=[...]`** — the writer sees the analyst's output,
  not the raw ticket. Deliberate: it forces the handoff to be explicit.
- **`crew.kickoff()` is the loop** — same look-around → act → check shape the
  whole workshop is built on, just orchestrated by a framework.
- Swap `Crew(...)` to `process="hierarchical"` (with a manager LLM) and the
  crew gets a delegating coordinator — worth mentioning, not demoing.

## Your turn — build a content crew (15 min)

```bash
cd day2_adlc/crewai
cp crew_demo.py content_crew.py
export ANTHROPIC_API_KEY=sk-ant-...     # paste your key (same command in Git Bash on Windows)
# edit content_crew.py (~10 lines), then:
.venv/bin/python content_crew.py
```

Repurpose the two agents: **Researcher** — goal "produce 5 concrete, specific
points about the topic — facts and examples, no fluff". **Content Writer** —
goal "turn the researcher's points into a ~150-word LinkedIn post with a
strong hook", wired via `context=[...]`. Pick a topic you actually know.

**Done =** a post that visibly uses the researcher's points. Note the writer
never saw your topic — only the researcher's output. That handoff is why the
post is grounded instead of generic.

**Stretch:** add a third agent, Editor — "cut to 100 words, sharpen the hook" —
chained on the writer.

## Where this sits in the toolbox

Claude Code for repo work · Claude Agent SDK for custom agents on Claude's
loop · CrewAI/LangGraph for multi-agent Python apps. Whatever you pick:
specs, evals, and human gates still decide whether it's production-grade.
