# Module 5 — Live hook demo (~5 min)

## What this demonstrates

A `PreToolUse` hook that blocks any `Write` or `Edit` whose `file_path` matches `prod_*.yaml`. Useful pattern for protecting production config from agent edits while leaving dev/staging files alone.

## Setup (one-time, before the workshop)

```bash
chmod +x /Users/sdesai/work/workshop_demo/module5_hooks/.claude/hooks/block-prod-writes.sh
```

That's it. No installs.

## On the day — exactly what to type

**Read this aloud first:** *"I'm going to ask Claude to update a production config file. Watch."*

```bash
cd /Users/sdesai/work/workshop_demo/module5_hooks
claude
```

Then in the Claude prompt:

```
> Update sample_files/prod_config.yaml — change the database host to "new-host.internal"
```

**What you should see:** Claude tries to call `Edit`, the hook fires, a big red boxed message appears explaining what was blocked and how to override. Claude reports back that it couldn't make the change.

**Show the hook:**

```
> /exit
bat .claude/hooks/block-prod-writes.sh
bat .claude/settings.json
cat .claude/hook-debug.log     # the audit trail you just wrote
```

**Punchline:** *"30 lines of bash. Deterministic guardrail around a non-deterministic agent. Your CI doesn't trust developers blindly — your agent shouldn't either."*

## If the hook fires too aggressively (debugging)

```bash
tail -f module5_hooks/.claude/hook-debug.log
```

Every invocation is logged with the full input JSON. If you ever wonder "did the hook even run?" — that's the answer.

## To override during the demo (showing the escape hatch)

```bash
PROD_OVERRIDE=1 claude
> Update sample_files/prod_config.yaml — change the database host to "new-host.internal"
# now it succeeds, but is logged
cat .claude/hook-debug.log | grep PROD_OVERRIDE
```
