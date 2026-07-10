# TDD Kata — make the tests green, then move the goalposts

Zero dependencies — Python standard library only:

```bash
cd day2_adlc/tdd_kata
python3 -m unittest
```

Right now most tests **fail** — `ratelimiter.py` is a stub. That's the point.

## Round 1 — red to green (10 min)

Ask Claude to implement `RateLimiter` until `python3 -m unittest` passes. The catch:
**tell it the tests are the spec and it may not edit them.** A good opening move:

```
Read test_ratelimiter.py — that file is the spec and is read-only.
Implement ratelimiter.py until `python3 -m unittest` passes. Run the tests
yourself after each change and show me the final output.
```

Watch whether Claude actually runs the tests. If it declares victory without
running them, call it out — "run it" is the cheapest verification you'll ever buy.

## Round 2 — iterate on a new requirement (10 min)

Requirements changed (they always do). Extend the spec **test-first**:

```
New requirement: RateLimiter takes an optional `burst` option — a client
may exceed `limit` by up to `burst` extra requests once per window.
Write the tests for this FIRST, show them to me, wait for my approval,
then implement.
```

The "wait for my approval" line is the human-in-the-loop gate. Read the tests
it proposes like you'd review a junior's PR — that review *is* the iteration loop.

## What this teaches

- Tests-as-spec beats prose-as-spec: the agent can *verify itself*.
- "Run the tests after each change" turns Claude from a text generator into
  an engineer with a feedback loop.
- Test-first + approval gate = iterative development you can actually trust.
