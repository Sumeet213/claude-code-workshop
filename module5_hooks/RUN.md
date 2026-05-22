# Module 5 — Hook demo

## What this demonstrates

A `PreToolUse` hook that blocks any `Write` or `Edit` whose `file_path` matches `prod_*.yaml`. Useful pattern for protecting production config from agent edits while leaving dev/staging files alone.

## Setup (one-time)

```bash
chmod +x ~/workshop_demo/module5_hooks/.claude/hooks/block-prod-writes.sh
```

That's it. No installs.

## Run it

```bash
cd ~/workshop_demo/module5_hooks
claude
```

In the Claude prompt:

```
> Update sample_files/prod_config.yaml — change the database host to "new-host.internal"
```

Claude tries to call `Edit`, the hook fires, a big red boxed message appears explaining what was blocked and how to override. Claude reports back that it couldn't make the change.

## Inspect

```
> /exit
bat .claude/hooks/block-prod-writes.sh
bat .claude/settings.json
cat .claude/hook-debug.log     # audit trail of every check
```

## Debug

```bash
tail -f .claude/hook-debug.log
```

Every invocation is logged with the full input JSON. If you ever wonder "did the hook even run?" — that's the answer.

## Override (escape hatch)

```bash
PROD_OVERRIDE=1 claude
> Update sample_files/prod_config.yaml — change the database host to "new-host.internal"
# now it succeeds, but is logged
cat .claude/hook-debug.log | grep PROD_OVERRIDE
```
