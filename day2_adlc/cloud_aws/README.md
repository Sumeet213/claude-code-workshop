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

## 3. Infrastructure as code: Claude writes and reviews your Terraform

IaC is the sweet spot for agentic coding: the "tests" already exist —
`terraform validate`, `terraform plan`, `tflint`, `checkov` — so the agent
gets a full verify loop for free. The working pattern:

1. **Plan mode first, always.** "Add an S3 bucket for report exports with
   versioning, SSE, and a 90-day lifecycle rule, following the module
   conventions in this repo" → read the plan before any `.tf` changes.
2. **`terraform plan` is the agent's test suite.** House rule to put in
   CLAUDE.md: *after every change, run `terraform validate` and
   `terraform plan`, and paste the resource delta — never claim done
   without a plan output.* Review the delta like a diff, because it is one.
3. **Hooks make it safe** (same lever as Day 1 E7): a PreToolUse hook that
   blocks `terraform apply` and `terraform destroy` outright — the agent
   writes and plans, a human applies. State surgery (`terraform state rm`,
   `import`) belongs on the blocklist too.
4. **Reviews scale the same way as code**: point three parallel sub-agents
   at a Terraform PR — one for security (public buckets, `0.0.0.0/0`
   ingress, missing encryption), one for cost (instance sizes, unattached
   EIPs, log retention), one for drift/conventions.

## 4. Debugging cloud issues with an agent

The debugging loop from Day 1 works on infrastructure because the evidence
is all CLI-readable — and read-only `aws` commands are easy to allowlist:

```bash
# pipe the evidence in, headless:
aws logs tail /ecs/payments --since 30m | claude -p \
  'Find the error pattern, correlate timestamps, output JSON:
   {"pattern": str, "first_seen": str, "probable_cause": str, "next_check": str}'
```

Interactively it's stronger: allow `Bash(aws logs:*)`, `Bash(aws ecs describe-*)`,
`Bash(aws iam get-*|list-*)` and let Claude *walk the graph itself* — task
stopped → pull events → read the task definition → check the security group
→ diff against the working service. The classic wins:

- **IAM denial archaeology**: paste the AccessDenied error; the agent reads the
  policy JSON, the trust relationship, and the SCP and names the missing action.
- **"It works in staging"**: two `aws ... describe` dumps in, one config diff out.
- **Cost spikes**: Cost Explorer CSV in, ranked suspects out — then it writes
  the Terraform fix (see above) and the loop closes.

Guardrail note, same as everywhere: read-only AWS commands in the allowlist,
mutating ones (`aws ec2 terminate-*`, `aws iam put-*`) denied or hook-blocked.

## 5. Agents inside AWS automation (CodeBuild / Lambda / ECS)

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
