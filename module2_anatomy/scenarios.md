# Module 2 — Spot the lever (interactive)

Five real-ish Claude Code transcripts that ended badly. **For each one, name the lever that failed: context, tools, permissions, or loop control.**

Project one card at a time. Pause 60 seconds. Take a vote (hand-raise per lever). Then click the green box.

---

## 🃏 Card 1

```
> add user-deletion to the API
[Claude proposed and wrote 14 file edits across 9 files in 2 minutes]
> wait that broke the build
> revert
```

<details>
<summary>✅ Reveal</summary>

**Lever: Loop control.** No plan mode. No checkpoint between "I have an idea" and "I edited 9 files."

**Fix:** `Shift+Tab` to plan mode, or prompt: *"Propose the change in plan mode first. Wait for me to approve before editing."*
</details>

---

## 🃏 Card 2

```
> Add a `lastN` events buffer to EventBus — new subscribers should
  receive the most recent 50 events on subscribe. Similar to RxJS
  ReplaySubject.

[Read: src/event-bus.ts]
[Edit: src/event-bus.ts — adds a circular buffer; modifies subscribe()
       to flush the buffer to the new subscriber.]

Done. New subscribers will receive the last 50 events on connect.

> ...you didn't change DomainEventBus.ts. that's the subclass everything
> in production actually uses. what you edited is the abstract base class —
> nothing in the running system goes through that path.
```

<details>
<summary>✅ Reveal</summary>

**Lever: Context.** Claude found *a* file named `event-bus.ts` and assumed it was the implementation. It never traced the inheritance chain to discover that `DomainEventBus.ts` extends it and is the one production wires up. The base class file edit was correct in isolation — and useless in practice.

**Fix:** prompt should specify *which* event bus, or instruct the model to "find every implementation and the production wiring before editing." A `rg "extends EventBus"` would have surfaced the subclass in 200ms. Plan mode would have surfaced the ambiguity ("I see two files — which one?") before any edit.

**Why this is the most-missed lever:** the failure isn't dramatic. The code compiles. Tests pass (because they exercise the base class directly). The agent reports success. Production keeps using the unchanged subclass. **Silent context failures are the worst kind.**
</details>

---

## 🃏 Card 3

```
> run the test suite and fix any failures
[Approval prompt: Allow Bash(npm test)?]                        y
[Approval prompt: Allow Bash(npm test -- --watch=false)?]       y
[Approval prompt: Allow Bash(npm test src/foo.test.ts)?]        y
[Approval prompt: Allow Bash(npm test src/bar.test.ts)?]        y
[Approval prompt: Allow Bash(npm test src/baz.test.ts)?]        y
> ugh, just go
```

<details>
<summary>✅ Reveal</summary>

**Lever: Permissions.** Every variant of `npm test` triggers a fresh prompt because the allowlist is too narrow.

**Fix:** add `Bash(npm test:*)` to `.claude/settings.json` `allow`. Run `/fewer-permission-prompts` after a week to mine your own transcripts and let it propose patterns.
</details>

---

## 🃏 Card 4

```
> we need to migrate the user table to add a soft_delete column
[Claude writes a migration file in 30 seconds, runs `npm run migrate` against
 the local DB, marks the task done]
> ...did that just run against prod?
[checking ~/.psqlrc] ...yes.
```

<details>
<summary>✅ Reveal</summary>

**Lever: Tools (specifically: which tools are allowed *and* what they do at the system level).** The model used `Bash(npm run migrate)` without any guard checking which DB it pointed at. The user's local `.env` was symlinked to a prod credentials file.

**Fix (multiple):**
- `PreToolUse` hook on `Bash` that greps for `migrate`, `DROP`, `TRUNCATE` against any env file containing prod hosts → block with override flag.
- Deny pattern: `Bash(npm run migrate*)` in committed settings — force the participant to use a wrapper script that checks the target.
- Also: structural fix outside Claude — `.env` should never resolve to prod credentials on a dev box.
</details>

---

## 🃏 Card 5

```
> review my PR
[Claude reads 47 files, writes a 4-page review covering everything]
> ok now also write tests for the new endpoints
[Claude is now 80% through its context window. It writes 3 tests.
 The next request gets compacted prematurely and Claude forgets the
 review you both just discussed.]
```

<details>
<summary>✅ Reveal</summary>

**Lever: Context (with a side of loop control).** Two unrelated tasks bled into one session, blowing the window. The review *and* the test-writing both wanted full read access — together they exhausted the budget.

**Fix:**
- `/clear` between unrelated tasks — never let an "ok now also..." chain start.
- For the review specifically: spawn it as a sub-agent so the parent only sees the summary. Then start the test-writing in a fresh session.
- Trust auto-compaction; *don't* `/clear` mid-task hoping to "free space" — that breaks the prompt cache.
</details>

---

## Score on the whiteboard

| Card | Lever |
|---|---|
| 1 | Loop control |
| 2 | Context |
| 3 | Permissions |
| 4 | Tools (with permission overlap) |
| 5 | Context (with loop-control overlap) |

5/5 means you've internalised the spine of the day. You can now diagnose any failed Claude session.
