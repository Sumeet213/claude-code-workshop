# Security Review: `users_api.js`

## Summary

This file contains numerous severe, exploitable security defects: a hardcoded production database password, two SQL injection sinks (one returning PII), an unauthenticated PII bulk-export endpoint, an SSRF + path-traversal sink in the avatar uploader, and PII written to logs. There is no authentication, authorization, input validation, rate limiting, or output filtering anywhere in the file. In its current form this router would constitute a critical data-breach vector if deployed.

---

## Critical findings

### C1. Hardcoded production database credential
**Location:** lines 11–18
**Why it matters:** `DB_PASSWORD = "prod_db_pass_2024!"` is committed in source. Anyone with repo access (or anyone who exfiltrates the repo, a backup, a CI artifact, or a stack trace) gains root-level MySQL access to the `users` database on `prod-db.internal`. Hardcoded prod credentials cannot be rotated without a code deploy and are typically scraped within minutes of accidental publication (GitHub, npm, container images).
**Suggested fix:**
```js
const DB_PASSWORD = process.env.DB_PASSWORD;
if (!DB_PASSWORD) throw new Error('DB_PASSWORD env var is required');

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,           // not 'root'
  password: DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: true },
});
```
Additionally: rotate the leaked password immediately, audit DB access logs, stop using the `root` account, and load secrets from a secret manager (AWS Secrets Manager / Vault / SSM).

### C2. SQL injection in `GET /:id`
**Location:** line 23 — `"SELECT * FROM users WHERE id = " + id`
**Why it matters:** `req.params.id` is concatenated into SQL with no validation or escaping. Trivial attack: `GET /users/1%20OR%201=1` dumps all users; `GET /users/1;DROP TABLE users--` (with `multipleStatements`) destroys data; UNION-based exfiltration of any table is possible. This is a textbook critical SQLi.
**Suggested fix:**
```js
router.get('/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).send('bad id');
  conn.query('SELECT id, name, email FROM users WHERE id = ?', [id], (err, rows) => {
    if (err) return res.status(500).send('error');
    if (!rows.length) return res.status(404).end();
    res.json(rows[0]);
  });
});
```
Also restrict the column list (do not `SELECT *` and leak `ssn`/`dob`).

### C3. SQL injection in `POST /search` (PII exfiltration)
**Location:** lines 29–36 — `WHERE name LIKE '%${name}%'`
**Why it matters:** `name` is interpolated directly into a `LIKE` clause that selects `ssn` and `dob`. An attacker can break out of the quoted literal (`'); SELECT ... --`) to exfiltrate the entire users table including SSNs. Even without breakout, wildcards (`%`) let attackers enumerate the table. The selected columns expose unmasked PII to any unauthenticated caller.
**Suggested fix:**
```js
router.post('/search', requireAuth, requireRole('support'), (req, res) => {
  const name = String(req.body.name ?? '');
  if (!/^[\p{L}\p{M}\p{Zs}.'-]{1,64}$/u.test(name)) return res.status(400).end();
  const like = '%' + name.replace(/[\\%_]/g, '\\$&') + '%';
  conn.query(
    'SELECT id, name FROM users WHERE name LIKE ? LIMIT 50',
    [like],
    (err, rows) => err ? res.status(500).end() : res.json(rows)
  );
});
```
Never return `ssn`/`dob` from a search endpoint; if required, return them only via a separate, audited, role-gated endpoint with masking.

### C4. Unauthenticated PII bulk export
**Location:** lines 38–44 — `GET /export`
**Why it matters:** Any unauthenticated caller can dump the entire `users` table (including `ssn`, `dob`, `email`) to disk and download it. The dump is also written to a world-readable, predictable path (`/tmp/users_dump.json`) so any local user on the host (or another compromised process) can read it, and concurrent requests race on the same file. This is a complete data breach in one HTTP call.
**Suggested fix:**
```js
router.get('/export', requireAuth, requireRole('admin'), auditLog('user-export'), (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="users.json"');
  const stream = conn.query('SELECT id, name, email FROM users').stream();
  stream.pipe(JSONStream.stringify()).pipe(res);
});
```
Require strong authn + role check, stream directly to the response (no temp file), exclude sensitive columns by default, rate-limit, and write an audit-log entry.

### C5. SSRF + path traversal in avatar fetcher
**Location:** lines 46–53 — `POST /:id/avatar`
**Why it matters:** Two critical issues compound:
1. **SSRF:** `http.get(url)` follows arbitrary attacker-supplied URLs with no scheme/host validation. Attackers can hit `http://169.254.169.254/latest/meta-data/...` (AWS IMDS) to steal instance credentials, scan the internal network (`http://10.0.0.0/8`), or reach internal admin panels.
2. **Path traversal / arbitrary file write:** `'./avatars/' + req.params.id + '.png'` — `req.params.id` is unvalidated, so `POST /users/..%2F..%2Fetc%2Fpasswd_overwrite/avatar` writes attacker-controlled bytes to arbitrary filesystem paths (subject to process permissions). Also, plain `http://` is accepted and the response body is not size-limited, enabling disk-fill DoS.
**Suggested fix:**
```js
const { URL } = require('url');
const dns = require('dns').promises;
const net = require('net');
const path = require('path');

async function safeFetchAvatar(rawUrl) {
  const u = new URL(rawUrl);
  if (u.protocol !== 'https:') throw new Error('https only');
  const { address } = await dns.lookup(u.hostname);
  if (isPrivateIp(address)) throw new Error('blocked host');
  // fetch with timeout + size cap, re-resolving to prevent DNS rebinding
  // (e.g. undici with a custom dispatcher pinning to `address`).
}

router.post('/:id/avatar', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).end();
  if (req.user.id !== id && !req.user.isAdmin) return res.status(403).end();
  try {
    const buf = await safeFetchAvatar(req.body.url);   // size-capped
    const dest = path.join(AVATAR_DIR, `${id}.png`);
    if (!dest.startsWith(AVATAR_DIR + path.sep)) return res.status(400).end();
    await fs.promises.writeFile(dest, buf);
    res.send('ok');
  } catch (e) { res.status(400).send('bad url'); }
});
```
Implement a strict allowlist of egress hosts if possible; otherwise block RFC1918, loopback, link-local, multicast, and IPv6 equivalents; cap response size; enforce a timeout; reject redirects to private IPs; validate magic bytes are PNG; pin DNS to the resolved IP (DNS-rebinding defense).

---

## High findings

### H1. PII written to application logs
**Location:** line 33 — `console.log(\`[search] ip=${req.ip} email=${rows[0].email} name=${name}\`)`
**Why it matters:** Emails (and the searched name) are written to logs that typically flow to third-party log aggregators (Datadog, CloudWatch, ELK). This expands the PII trust boundary, often violates GDPR/CCPA/HIPAA and your DPA with log vendors, and creates a long-lived secondary copy of user PII that will not be erased on a deletion request. Combined with the SQLi above, an attacker can also inject log-forging content.
**Fix:** Log only non-PII identifiers (`userId`, request id). If email-related troubleshooting is needed, hash with a keyed HMAC.

### H2. No authentication or authorization on any route
**Location:** lines 21, 29, 38, 46, 55
**Why it matters:** Every endpoint is fully public. There is no session check, token check, role check, or ownership check, so anonymous callers can read any user, search the full table, export the full table, overwrite any user's avatar, and trigger notifications targeting any user id.
**Fix:** Add `requireAuth` middleware at the router level and per-route role/ownership checks (e.g. `req.user.id === Number(req.params.id) || req.user.isAdmin`).

### H3. Unbounded outbound email amplification / DoS in `POST /:id/notify`
**Location:** lines 55–64
**Why it matters:** Anyone can call `POST /users/anything/notify` and the server emails *every user in the table*. This is a spam/abuse cannon, will get the sending domain blocklisted, and is a trivial wallet/SMTP-quota DoS. The path parameter `userId` is unused except as plaintext in the body, so the endpoint's apparent scoping is misleading.
**Fix:** Authenticate, restrict to admin role, rate-limit, send only to the targeted user (`WHERE id = ?` with parameter binding), enqueue via a job system rather than blocking the HTTP request.

### H4. `mysql` driver is unmaintained / supply-chain risk
**Location:** line 7 — `require('mysql')`
**Why it matters:** The `mysql` package on npm has been effectively unmaintained for years; security fixes land in `mysql2`. Continuing to depend on `mysql` means no patches for future CVEs in the protocol/parser layer. Also, `mysql.createConnection` without TLS (`ssl`) means credentials and PII traverse the network in cleartext if `prod-db.internal` is on a shared segment.
**Fix:** Migrate to `mysql2` (with `mysql2/promise`) and enable TLS with `ssl: { rejectUnauthorized: true, ca: fs.readFileSync(...) }`.

---

## Medium findings

### M1. Error / response leakage and missing status codes
**Locations:** lines 24 (`res.send('error')`), 25 (`rows[0]` when empty), 33 (logs continue on `err`).
**Why it matters:** Sending `200 OK` with `'error'` masks failures from monitoring and may leak driver errors elsewhere. `rows[0]` on empty result yields `undefined`, sending `200` for a non-existent user — useful for user enumeration. Driver errors should not be returned verbatim to clients.
**Fix:** Return `4xx`/`5xx` consistently; do not echo error messages; treat missing rows as `404`.

### M2. Missing input validation everywhere
**Locations:** all route handlers
**Why it matters:** No type/length/charset checks on `id`, `name`, `url`, or `req.body`. This enables the SQLi/SSRF/path-traversal above and also enables prototype-pollution-style payloads if `req.body` is later spread into objects. Without `express.json({ limit: ... })` configured upstream, request bodies are also unbounded.
**Fix:** Use a schema validator (`zod`, `joi`, `ajv`) on every handler; constrain body size at the app level (`express.json({ limit: '16kb' })`).

### M3. Single shared connection without pooling or reconnect
**Location:** lines 13–19
**Why it matters:** `createConnection` (vs `createPool`) means one TCP connection serializes all queries and never reconnects on transient failure — easy DoS via slow query, plus a single hung request stalls the process. Not strictly an injection issue but a denial-of-service vector.
**Fix:** Use `mysql2.createPool({ connectionLimit, waitForConnections: true, ... })` and set per-query timeouts.

### M4. No timeouts / size limits on outbound HTTP fetch
**Location:** lines 48–50
**Why it matters:** Even after fixing SSRF, an attacker can point at a slow or infinite stream to exhaust file descriptors / disk. `response.pipe(file)` has no `Content-Length` cap and no socket timeout.
**Fix:** Set `request.setTimeout(5000)`, abort on `> N bytes`, and validate `Content-Type` / file magic.

### M5. World-readable temp dump file
**Location:** line 41 — `fs.writeFileSync('/tmp/users_dump.json', data)`
**Why it matters:** Default umask makes `/tmp` files readable by other local users / sidecar containers. Even after authn is added, the file persists after `res.download` and is never cleaned up, leaving stale PII on disk.
**Fix:** Stream directly to the HTTP response (see C4); if a file is unavoidable, use `fs.mkdtempSync` with mode `0700` and `fs.unlink` after sending.

---

## Low findings / hardening recommendations

- **L1 — No rate limiting / brute-force protection.** Add `express-rate-limit` (or upstream WAF rules) on `/search`, `/:id`, `/export`, `/notify`. Without it, attackers can enumerate users and abuse `/notify`.
- **L2 — `SELECT *` everywhere (lines 23, 39, 58).** Even with parameterization, returning every column (including `ssn`, `dob`) violates least-privilege data exposure. Enumerate columns explicitly per endpoint.
- **L3 — Missing security headers.** Ensure the parent app uses `helmet()`, sets `X-Content-Type-Options`, `Strict-Transport-Security`, and a CSP appropriate to JSON APIs.
- **L4 — No CSRF consideration on state-changing routes** (`POST /search`, `POST /:id/avatar`, `POST /:id/notify`). If session cookies are used for authn, add CSRF tokens or require a custom header + CORS allowlist.
- **L5 — `conn.connect()` with no error handler (line 19).** A connection failure will throw asynchronously and crash the process; combined with no pool, this is a soft DoS surface.
- **L6 — `sendEmail` stub (line 66) silently resolves.** When implemented, ensure it does not log message bodies (PII), enforces per-recipient rate limits, and validates the address.
- **L7 — Lack of audit logging for sensitive actions** (export, bulk notify). Add structured audit entries with actor, action, target, and timestamp to a tamper-evident sink.
- **L8 — Dependency hygiene.** Add `npm audit` / Dependabot / Snyk to the pipeline; pin and review `express`, `mysql` (→ `mysql2`) versions; enable `npm ci` with a committed lockfile.
- **L9 — Process privileges.** Whatever runs this code should not run as root and the `avatars/` directory should be on a volume separate from app code with restrictive perms.
