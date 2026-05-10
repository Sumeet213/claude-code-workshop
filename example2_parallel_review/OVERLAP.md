# Live demo overlap — three reviewers, same file

**Setup:** the same flawed file (`code_under_review/users_api.js`, 70 lines, deliberately seeded with security, perf, and design issues) was reviewed by three sub-agents spawned **in parallel from a single message**:

- **Security specialist** — told to focus exclusively on injection, authn/authz, secrets, SSRF, PII, DoS, supply chain.
- **Code-quality specialist** — told to focus exclusively on event-loop blocking, error handling, N+1, validation, observability, tests.
- **Generalist** — told to find anything that looks wrong, no division of labour. The control case.

Same model, same file, same time budget.

## The findings, side by side

| Issue | Security | Code-quality | Generalist |
|---|---|---|---|
| Hardcoded prod DB password (line 11) | ✅ Critical | ⚠️ noted in passing | ✅ Critical |
| SQL injection in `GET /:id` (line 23) | ✅ Critical, with payload | ❌ | ✅ found |
| SQL injection in `POST /search` (line 31) | ✅ Critical, with payload | ❌ | ✅ found |
| PII (SSN, DOB) returned in `/search` | ✅ High | ❌ | ✅ flagged |
| PII logged to stdout (line 33) | ✅ High | ⚠️ "unstructured logging" | ✅ flagged |
| SSRF in `/avatar` (line 48) | ✅ Critical, with attack chain | ❌ | ✅ found |
| Path traversal in avatar filename (line 50) | ✅ Critical | ❌ | ✅ found |
| No auth on any route | ✅ High | ❌ | ✅ flagged |
| Unauthenticated `/export` of all users | ✅ Critical | ❌ | ✅ flagged |
| `fs.writeFileSync` blocks event loop (line 41) | ❌ | ✅ Critical | ✅ found |
| No connection pooling, no reconnect | ❌ | ✅ Critical, with rewrite | ⚠️ noted |
| `SELECT *` and missing pagination | ❌ | ✅ Major | ✅ flagged |
| `/notify` iterates entire users table serially | ❌ | ✅ Critical (DoS via amplification) | ✅ flagged |
| `res.send('error')` returns HTTP 200 | ❌ | ✅ Major | ⚠️ partial |
| Unhandled `'error'` events on `http.get` and streams | ❌ | ✅ Critical | ✅ flagged |
| No `http.get` timeout — request can hang forever | ❌ | ✅ Major | ⚠️ partial |
| Route ordering bug — `/export` shadowed by `/:id` | ❌ | ⚠️ noted | ✅ **found** (only generalist) |
| No tests, no schemas, no structured logging | ❌ | ✅ Major | ⚠️ partial |
| Outdated `mysql` package (use `mysql2` or PG) | ✅ supply chain | ✅ Major | ✅ flagged |

## What this shows

- **The two specialists in parallel found 17 of 19 issues** at high quality — each in their lane, with depth (payloads, attack chains, rewrite outlines).
- **The generalist found 16 of 19** — but most at a shallower depth ("flagged" vs "with payload"), and missed the connection-pool / reconnect class of bugs entirely.
- **Specialists missed exactly one issue: the route-ordering bug.** That's because both stayed strictly in lane. The generalist caught it because they were reading sequentially.
- **Total context returned to parent:** 4 bullets × 3 agents = 12 short bullets. The full reviews live as files. The parent's window stays clean.

## The lesson for the workshop

| Pattern | When to use |
|---|---|
| Single generalist | Quick first look. You want one mind reading the whole file. Fine for ~70 lines; falls over at 700. |
| Parallel specialists | When the file or change crosses concerns (security + perf + DX). You get depth in each lane, the parent fans-in summaries. |
| Parallel specialists + generalist *backstop* | Production code review. The specialists go deep; the generalist catches the cross-concern bug nobody owned (here: the route ordering). |

The third row is the takeaway pattern. Three agents in one message, three short summaries, three full review files on disk.

## How to run this demo live in 90 seconds

1. `cat code_under_review/users_api.js` on screen — let the room scan it for ~30 seconds.
2. Show this OVERLAP.md table on the projector.
3. Ask: *"Which column would you trust as your only review? Which combination would you ship with?"*
4. Open `reviews/security_review.md` to show the depth of a specialist (payloads, attack chains).
5. Open `reviews/generalist_review.md` to show the breadth-but-shallower style.
6. Highlight the route-ordering bug — only the generalist caught it. **Specialists stay in lane.** That's a feature *and* a limitation.

## Predict-before-reveal prompt for participants

Before showing the table:

> I gave the same flawed file to three Claude sub-agents in parallel: a security specialist, a code-quality specialist, and a generalist. They returned ~5 minutes later. **In two minutes: write down (a) which agent you think found the most issues, (b) which agent you think found the most *valuable* issue, (c) one issue you predict all three missed.** Then we look.

Most rooms guess "security" for (a) and (b). Few predict that the generalist catches the routing bug nobody else does. Almost nobody predicts what was *missed* by all three (answer: nothing critical — but the test plan is left as an exercise).
