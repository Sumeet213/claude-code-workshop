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

## Where this sits in the toolbox

Claude Code for repo work · Claude Agent SDK for custom agents on Claude's
loop · CrewAI/LangGraph for multi-agent Python apps. Whatever you pick:
specs, evals, and human gates still decide whether it's production-grade.
