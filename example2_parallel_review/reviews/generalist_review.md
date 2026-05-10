# Generalist Code Review: `users_api.js`

## Summary

This file is riddled with critical security vulnerabilities (SQL injection, hardcoded production credentials, SSRF, path traversal), correctness bugs (no error handling, unhandled rejections), and architectural problems (broken route ordering, single shared DB connection, sensitive data in logs). It is not safe to ship in any form — even setting aside the workshop disclaimer, nearly every route has at least one exploitable or production-breaking defect. A thorough rewrite is warranted, not a patch.

## Findings

### 1. Hardcoded production database password in source
- **Location:** Line 11 (`const DB_PASSWORD = "prod_db_pass_2024!";`), used on line 16.
- **Why it matters:** Credentials in source control leak to anyone with repo access, CI logs, backups, and forks. The name `prod_db_pass_2024!` strongly suggests this is a real production secret. Rotation requires a code deploy. Connecting as `root` (line 15) compounds the blast radius.
- **Fix:** Load from environment variables or a secrets manager (AWS Secrets Manager, Vault). Rotate the credential immediately. Use a least-privilege DB user, not `root`. Add a pre-commit / CI secret scanner (e.g. gitleaks, trufflehog).

### 2. SQL injection in `GET /:id`
- **Location:** Line 23 — `"SELECT * FROM users WHERE id = " + id`.
- **Why it matters:** `req.params.id` is concatenated directly into SQL. An attacker can supply `1 OR 1=1` to dump the entire table, or `1; DROP TABLE users--` (depending on driver multi-statement settings) to destroy data. Trivially exploitable via a normal HTTP GET.
- **Fix:** Use parameterized queries: `conn.query("SELECT ... WHERE id = ?", [id], cb)`. Validate `id` is an integer before querying.

### 3. SQL injection in `POST /search` via template string
- **Location:** Line 31 — `` `... WHERE name LIKE '%${name}%'` ``.
- **Why it matters:** Same root cause as #2 but worse: `name` comes from the request body and is interpolated into a `LIKE` clause with no escaping. An attacker can break out with a single quote to read/modify any table.
- **Fix:** Parameterize: `conn.query("SELECT ... WHERE name LIKE ?", ['%' + name + '%'], cb)`. Also validate that `name` is a string and bounded in length.

### 4. PII (SSN, DOB, email) returned and logged in `/search`
- **Location:** Lines 31 (`SELECT id, name, email, ssn, dob`), 33 (`console.log(... email=${rows[0].email} name=${name})`), 34 (`res.json(rows)` returns full PII to caller).
- **Why it matters:** Endpoint exposes Social Security Numbers and dates of birth to any caller, and writes email + search term to stdout where logs are typically retained, shipped, and indexed. This is almost certainly a regulatory violation (GDPR, CCPA, GLBA, HIPAA depending on context) and a clear data-leak path.
- **Fix:** Drop `ssn` from the SELECT entirely unless there is a documented authorized use case; if needed, gate behind authn/authz and return only masked values (`***-**-1234`). Remove the PII fields from the log line — log only request id, ip, and user count.

### 5. Route ordering bug: `/export` is shadowed by `/:id`
- **Location:** Line 21 (`router.get('/:id', ...)`) declared before line 38 (`router.get('/export', ...)`).
- **Why it matters:** Express matches routes in declaration order. `GET /users/export` will match `/:id` with `id="export"`, so the export handler is unreachable and the call instead runs `SELECT * FROM users WHERE id = export` (SQL error). Latent functional bug.
- **Fix:** Declare static routes before parameterized ones, or rename to `/admin/export` etc.

### 6. Missing authentication / authorization on every route
- **Location:** All routes (lines 21, 29, 38, 46, 55).
- **Why it matters:** `GET /:id` lets anyone read any user. `/export` lets anyone download the whole user table. `/:id/notify` lets anyone email every user in the system. There is no `req.user` check, no role check, no rate limit.
- **Fix:** Add an auth middleware and per-route authorization (e.g. `requireAdmin` for `/export` and `/notify`). Add a rate limiter (e.g. `express-rate-limit`) particularly for `/notify` and `/search`.

### 7. SSRF + path traversal in `POST /:id/avatar`
- **Location:** Lines 46–53. `http.get(url, ...)` on line 48 fetches an arbitrary user-supplied URL; line 49 writes to `'./avatars/' + req.params.id + '.png'`.
- **Why it matters:**
  - **SSRF:** Attacker can pass `http://169.254.169.254/latest/meta-data/iam/security-credentials/...` (cloud metadata), `http://localhost:6379/` (internal services), or internal IPs. Even though only the response is piped to disk, the request itself can trigger side effects on internal endpoints.
  - **Path traversal:** `req.params.id` of `../../etc/cron.d/evil` (URL-encoded) writes attacker-controlled bytes anywhere the process can write.
  - **No content-type / size checks:** attacker can fill the disk with a slow-loris or huge body.
  - `http.get` will not follow `https`, so any HTTPS URL silently fails.
- **Fix:** Whitelist allowed hosts (or use a signed-URL upload flow); resolve DNS and reject private/loopback/link-local ranges; cap response size and timeout; validate `req.params.id` is a numeric/UUID string and use `path.join` + verify the result stays under `./avatars`; require the user to be authenticated as the owner of `:id`.

### 8. No error handling in `/:id/avatar` (file write race + crash on bad URL)
- **Location:** Lines 48–52. `res.send('ok')` is called synchronously before the stream finishes; no `error` listeners on `http.get` or the write stream.
- **Why it matters:** A malformed URL throws/emits `error` with no listener — process crashes. Client gets `'ok'` even when the download failed. Avatar may be partial. Two concurrent requests to the same `:id` race on the same file.
- **Fix:** Listen on `'error'` for both streams, write to a temp file then rename, only respond after `'finish'`, and surface the actual outcome.

### 9. `fs.writeFileSync` on the request path in `/export`
- **Location:** Line 41.
- **Why it matters:** Blocks the Node event loop for the duration of writing the entire users table to disk; under any real volume this freezes the whole server. Also writes to `/tmp/users_dump.json` — a single shared path, so concurrent `/export` calls corrupt each other and one user can read another user's export.
- **Fix:** Stream rows directly to the response (`res.setHeader('Content-Disposition', ...)` and pipe). If a temp file is required, use `os.tmpdir()` + a unique filename and delete after sending.

### 10. `SELECT *` and unbounded result sets
- **Location:** Lines 23, 32 (implicit), 39, 58.
- **Why it matters:** `SELECT *` couples the API to the schema (new columns silently leak). `SELECT * FROM users` with no `LIMIT` (lines 39, 58) loads the entire table into memory; for any non-trivial user count this OOMs the process and ties up the connection.
- **Fix:** Enumerate columns explicitly. Add `LIMIT`/pagination. For exports, stream results.

### 11. Unhandled query error in `/search` and `/export`
- **Location:** Lines 32–35 and 38–43. `err` is ignored; on error, `rows` is undefined and the handler still calls `res.json(rows)` / `JSON.stringify(rows)`.
- **Why it matters:** On DB error, `/export` crashes (`fs.writeFileSync` on `'undefined'` is fine, but `res.download` on a stale file is wrong); `/search` silently returns `null` to the client and logs `email=undefined`. Hides outages and corrupts behaviour.
- **Fix:** Always check `if (err) return res.status(500).json({ error: ... });`. Centralise via an error-handling middleware.

### 12. `await` on `new Promise` that never rejects in `/notify`
- **Location:** Lines 57–59.
- **Why it matters:** The promise wrapper only calls `resolve(r)`; on DB error it resolves with `undefined`, then line 60's `users.length` throws `TypeError`, which becomes an unhandled rejection because there's no try/catch. Express also doesn't see it (no `next(err)`), so the client request hangs until timeout.
- **Fix:** Use `util.promisify(conn.query.bind(conn))`, wrap the handler in try/catch, and forward errors with `next(err)`.

### 13. Sequential `await sendEmail` in a loop
- **Location:** Lines 60–62.
- **Why it matters:** Sends emails one-at-a-time inside an HTTP request handler. With N users at 100 ms each, the request takes 100·N ms and holds an HTTP connection open the entire time; clients and load balancers will time out. Also: a single request triggers emailing every user — almost certainly a bug or abuse vector (see #6).
- **Fix:** Move the work to a background job/queue (BullMQ, SQS, etc.); respond immediately with `202 Accepted`. If you must do it inline, batch with `Promise.all` or a concurrency-limited pool, and reconsider the business logic (is emailing all users on any `/users/:id/notify` really intended?).

### 14. `userId` captured but never used in notification body
- **Location:** Line 56 sets `userId`; line 61 emails *all* users with body `"Notification for user " + userId`.
- **Why it matters:** Either the route should notify only user `:id` (then the `SELECT *` is wrong) or the body shouldn't reference `userId` (then the route name is wrong). Strong smell that the implementation diverged from intent.
- **Fix:** Decide the contract. If notifying one user: `SELECT email FROM users WHERE id = ?`. If broadcasting: rename the route and drop the `:id`.

### 15. Single shared, never-reconnected MySQL connection
- **Location:** Lines 13–19.
- **Why it matters:** `mysql.createConnection` (not a pool) gives one TCP connection for the entire process. All requests serialize through it. If the connection drops (network blip, MySQL restart, idle timeout), every subsequent query hangs or errors forever — there is no reconnect logic and no `error` listener on `conn`. `conn.connect()`'s callback is also ignored, so startup failures are silent.
- **Fix:** Use `mysql.createPool` (or migrate to `mysql2/promise`) with sensible `connectionLimit`, handle pool errors, and verify connectivity at startup.

### 16. Use of unmaintained `mysql` driver and bare `http`
- **Location:** Lines 7, 8.
- **Why it matters:** `mysql` (v1 / `mysqljs`) is largely unmaintained; `mysql2` is the modern drop-in with prepared statements and promise support. `http` (vs. a real HTTP client) gives no HTTPS, no redirect handling, no timeout, no body-size cap — see #7.
- **Fix:** Migrate to `mysql2/promise`. Use `undici` or `axios` (or native `fetch` on Node 18+) with timeouts and size caps for outbound HTTP.

### 17. `res.send('error')` returns a 200 with a string body
- **Location:** Line 24.
- **Why it matters:** Clients see HTTP 200 even though the server failed; impossible to alert on, breaks any client that expects JSON.
- **Fix:** `res.status(500).json({ error: 'internal error' })` and log the underlying `err` server-side (not back to the client).

### 18. No request body validation / size limits
- **Location:** Lines 30, 47.
- **Why it matters:** `req.body.name` and `req.body.url` are used without checking type, presence, or length. A non-string or oversize value causes 500s or the bugs above. Combined with #16, an attacker can push large payloads.
- **Fix:** Validate with `zod` / `joi` / `express-validator`. Configure `express.json({ limit: '10kb' })`.

### 19. `console.log` for application logging
- **Location:** Line 33.
- **Why it matters:** Unstructured logs are hard to search; PII (see #4) ends up in stdout; no log levels.
- **Fix:** Use a structured logger (`pino`, `winston`) with levels, redaction of sensitive fields, and request-scoped correlation ids.

### 20. Avatars directory not guaranteed to exist
- **Location:** Line 49.
- **Why it matters:** `fs.createWriteStream('./avatars/...')` errors if `./avatars` doesn't exist; combined with #8 the error is unhandled and crashes the process. Also `./` is process-cwd-dependent — fragile under different launchers / systemd / docker.
- **Fix:** Resolve an absolute path from config, ensure the directory exists at startup (`fs.mkdirSync(..., { recursive: true })`).
