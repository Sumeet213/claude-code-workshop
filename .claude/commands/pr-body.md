---
description: Generate a PR body from the current branch's diff
allowed-tools: Bash(git log:*), Bash(git diff:*), Bash(git branch:*)
argument-hint: [base-branch]
---

Base branch: $ARGUMENTS

If $ARGUMENTS is empty, use `main`.

Gather:

- `git log --reverse --pretty=format:'%s%n%b%n---' <base>..HEAD`
- `git diff --stat <base>..HEAD`
- For files that look load-bearing (migrations, public APIs, config, auth, security), `git diff <base>..HEAD -- <file>` to see the actual change.

Output ONLY the PR body markdown below. No commentary above or after it. Drop any section that has nothing to say.

## What

<one paragraph in the active voice. No "this PR…".>

## Why

<motivation. Reference an issue/ticket if commits mention one. Skip the section if you can't add anything beyond restating "What".>

## Notes for review

- <only non-obvious things: migrations, breaking changes, config touched, new deps, flagged behaviour>

## Test plan

- [ ] <specific test step>
- [ ] <regression case checked>
