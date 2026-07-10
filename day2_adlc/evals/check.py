#!/usr/bin/env python3
"""Layer 1: code-based checks. Deterministic, free, runs on every output.

Catches structural failures. Cannot catch a fluent, valid, WRONG summary.
"""

import json
import sys
from pathlib import Path

SENTIMENTS = {"positive", "neutral", "negative", "mixed"}
CATEGORIES = {"billing", "bug", "feature_request", "question", "other"}
SUMMARY_MIN = 20
SUMMARY_MAX = 200

HERE = Path(__file__).parent
OUTPUTS_DIR = HERE / "outputs"
TICKETS_DIR = HERE / "tickets"


def check_file(path: Path) -> list[str]:
    problems = []
    raw = path.read_text()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as err:
        return [f"invalid JSON: {err}"]

    for field in ("ticket", "sentiment", "category", "summary"):
        if not isinstance(data.get(field), str):
            problems.append(f"missing or non-string field: {field}")
    if problems:
        return problems

    if not (TICKETS_DIR / data["ticket"]).exists():
        problems.append(f"references unknown ticket: {data['ticket']}")
    if data["sentiment"] not in SENTIMENTS:
        problems.append(f'sentiment "{data["sentiment"]}" not in {sorted(SENTIMENTS)}')
    if data["category"] not in CATEGORIES:
        problems.append(f'category "{data["category"]}" not in {sorted(CATEGORIES)}')
    if not (SUMMARY_MIN <= len(data["summary"]) <= SUMMARY_MAX):
        problems.append(
            f"summary length {len(data['summary'])} outside {SUMMARY_MIN}-{SUMMARY_MAX}"
        )

    return problems


def main() -> int:
    files = sorted(OUTPUTS_DIR.glob("*.json"))
    failures = 0

    for path in files:
        problems = check_file(path)
        if not problems:
            print(f"  PASS  {path.name}")
        else:
            failures += 1
            print(f"  FAIL  {path.name}")
            for p in problems:
                print(f"        - {p}")

    print(f"\n{len(files) - failures}/{len(files)} outputs pass code checks")
    print("Remember: passing here only means structurally valid — not truthful.")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
