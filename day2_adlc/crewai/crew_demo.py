"""CrewAI demo — the deck's 15-line idea, runnable.

Two role-based agents turn a raw support ticket (from ../evals/tickets/)
into the same structured triage JSON the evals exercise checks.

Run:
    export ANTHROPIC_API_KEY=sk-ant-...
    pip install "crewai[anthropic]"
    python crew_demo.py
"""

from pathlib import Path

from crewai import LLM, Agent, Crew, Task

llm = LLM(model="anthropic/claude-haiku-4-5", max_tokens=1024)

ticket = (Path(__file__).parent.parent / "evals" / "tickets" / "ticket_1.txt").read_text()

analyst = Agent(
    role="Support Analyst",
    goal="Extract only the verifiable facts from a support ticket",
    backstory="A careful analyst who never invents details that are not in the source.",
    llm=llm,
    verbose=True,
)

writer = Agent(
    role="Triage Writer",
    goal="Produce a short, structured triage summary the on-call team can act on",
    backstory="Writes crisp, faithful summaries. Every claim must trace back to the analyst's facts.",
    llm=llm,
    verbose=True,
)

analyze = Task(
    description=(
        "Analyze this support ticket and list the verifiable facts — who, what, "
        f"amounts, dates, and what the customer wants:\n\n{ticket}"
    ),
    expected_output="A bullet list of verifiable facts from the ticket, nothing invented.",
    agent=analyst,
)

summarize = Task(
    description=(
        "Using only the analyst's facts, write the triage summary as a single JSON "
        "object with keys: sentiment (positive|neutral|negative|mixed), "
        "category (billing|bug|feature_request|question|other), "
        "summary (a faithful sentence, 200 characters max)."
    ),
    expected_output="One JSON object with sentiment, category, summary. No prose around it.",
    agent=writer,
    context=[analyze],
)

crew = Crew(agents=[analyst, writer], tasks=[analyze, summarize])

if __name__ == "__main__":
    result = crew.kickoff()
    print("\n=== FINAL TRIAGE JSON ===")
    print(result)
