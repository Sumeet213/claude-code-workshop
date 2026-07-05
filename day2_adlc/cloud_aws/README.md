# Cloud-based development cycle (AWS)

Three ways Claude Code shows up in an AWS shop, in increasing order of ambition.
(Trainer demos from their own account; participants follow the patterns, not the
console — nobody needs AWS creds in the room.)

## 1. Claude Code on remote dev boxes (EC2 / Cloud9-style / devcontainers)

Nothing special: it's a CLI. `ssh` into the box, `npm install -g @anthropic-ai/claude-code`,
run it inside tmux next to your code. The interesting bits:

- **CLAUDE.md travels with the repo**, so a fresh EC2 box is briefed the moment you clone.
- Put machine-role guidance in `~/.claude/CLAUDE.md` on the box
  ("this is the staging bastion; never touch prod RDS") — cheap guardrail, huge payoff.
- tmux + `claude` on a remote box = an agent that keeps working after your laptop sleeps.

## 2. Enterprise auth: Amazon Bedrock as the model backend

Companies that can't send code to a vendor API directly often already have
Bedrock approved. Claude Code speaks it natively:

```bash
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1        # any region with Claude models enabled
claude                              # auth now flows through your AWS credentials/IAM
```

Access control becomes IAM policy — the same reviews, the same audit trail
your org already runs. This one environment variable is often the difference
between "security said no" and "rolled out to 200 engineers."

## 3. Agents inside AWS automation (CodeBuild / Lambda / ECS)

The headless primitive from `../cicd/` runs anywhere a container runs:

- **CodeBuild step** that triages failed builds and writes the diagnosis to the
  build report (same pattern as `deploy-pipeline.yml`, different YAML dialect).
- **Scheduled ECS task**: nightly `claude -p` sweep over CloudWatch error logs →
  structured summary → Slack.
- Rules stay the same as CI: narrowest IAM role you can get away with,
  `--max-turns` capped, timeouts set, agent proposes / pipeline disposes.

## The dev-cycle picture to draw on the whiteboard

```
laptop (interactive claude)  →  PR (claude-pr-review.yml)  →  staging (smoke + agent triage)
        ↑                                                            ↓
   memory/CLAUDE.md  ←────────  learnings flow back  ←────  prod (monitoring, Day 2 §3.5)
```

The loop from Day 1 — gather context, act, verify — just got stretched across
environments. Same loop, bigger radius.
