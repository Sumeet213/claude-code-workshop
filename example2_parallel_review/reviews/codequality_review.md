# Code Quality Review — `users_api.js`

_Scope: code quality, performance, error handling, maintainability, testing, observability, Node/Express best practices. Security concerns are handled by a parallel reviewer and are intentionally out of scope here, except where they directly intersect with reliability (e.g. unhandled errors that crash the process)._

## Summary

This 70-line Express router has serious reliability and maintainability problems that would manifest under even mild production load: a single shared MySQL connection with no pool or reconnect logic, blocking I/O on the event loop, swallowed errors, an unbounded full-table scan with no pagination, and an N+1-shaped fan-out loop driven by a per-user endpoint. There is zero structured logging, zero input validation, zero tests, and no timeouts on any I/O. The file needs a structural rewrite, not patching.

---

## Critical issues

### 1. Single shared MySQL connection, never reconnected, leaks on crash

**Location:** lines 13-19

**Why it matters:** `mysql.createConnection` returns one TCP socket. Under any concurrency the queries serialize on it, and the moment MySQL closes the socket (idle timeout, failover, network blip) every subsequent query throws `PROTOCOL_CONNECTION_LOST` until the process restarts. There is no `conn.on('error', ...)` handler, no reconnect, no pool, and `conn.connect()` is fire-and-forget — its callback is ignored, so a startup failure is silently lost. The `mysql` package itself is also unmaintained; `mysql2` with promise support is the modern choice.

**Suggested fix:**

```js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 5_000,
  enableKeepAlive: true,
});

pool.on('error', (err) => logger.error({ err }, 'mysql pool error'));
```

Then `await pool.query(...)` per request. Pool handles reconnection and concurrency.

---

### 2. Blocking `fs.writeFileSync` on the event loop in `/export`

**Location:** line 41

**Why it matters:** `writeFileSync` blocks the entire Node event loop until the write completes. With `SELECT *` from a `users` table that could be megabytes or gigabytes, this stalls every other in-flight request — health checks, other DB queries, everything — for the full duration of disk I/O. Combined with the unbounded `SELECT *` (see issue #3), this is a trivially exploitable DoS vector even without malicious intent.

**Suggested fix:** Stream the query result directly to the HTTP response (or to disk via `createWriteStream`) without ever materializing the whole dataset:

```js
router.get('/export', async (req, res, next) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="users.json"');
    const stream = pool.pool.query('SELECT id, name, email FROM users').stream();
    res.write('[');
    let first = true;
    for await (const row of stream) {
      if (!first) res.write(',');
      res.write(JSON.stringify(row));
      first = false;
    }
    res.write(']');
    res.end();
  } catch (err) { next(err); }
});
```

---

### 3. Unbounded `SELECT *` with no pagination — `/export` and `/:id/notify`

**Location:** lines 39, 58

**Why it matters:** Both endpoints pull every row from `users` into Node memory. At even 100k users this is hundreds of MB allocated per request, GC pressure, possible OOM. `/:id/notify` then iterates serially over the entire user table for a single notify call — that is both an N+1-shaped fan-out and a fundamental design bug (why does notifying user `:id` send email to everyone?). The route either has the wrong query or the wrong contract.

**Suggested fix:** Mandatory pagination with cursor or `LIMIT/OFFSET`, server-enforced max:

```js
const limit = Math.min(Number(req.query.limit) || 50, 200);
const cursor = req.query.cursor ? Number(req.query.cursor) : 0;
const [rows] = await pool.query(
  'SELECT id, name, email FROM users WHERE id > ? ORDER BY id LIMIT ?',
  [cursor, limit],
);
```

For `/notify`, fix the query to target the requested user (or rename + document the broadcast intent and queue it via a worker, not inline in the request).

---

### 4. Errors swallowed and never logged in every handler

**Location:** lines 24, 32-35, 39-43, 48-52, 57-59

**Why it matters:** `if (err) return res.send('error')` returns a 200 with the body `error`, masking failures from clients and monitoring. `/search` ignores `err` entirely and dereferences `rows[0]` even when the query failed (TypeError → unhandled). `/avatar` has no error handler on `http.get` — a DNS failure or RST throws an unhandled `'error'` event that crashes the process. The `/notify` Promise resolves with `undefined` when the query errors, then iterates `undefined.length` → TypeError. None of these errors reach Express's error middleware, so there is no central place to alert on them.

**Suggested fix:** Use async handlers, propagate via `next(err)`, and add a centralized error middleware:

```js
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/:id', wrap(async (req, res) => {
  const [rows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'not_found' });
  res.json(rows[0]);
}));

// in app.js
app.use((err, req, res, _next) => {
  logger.error({ err, reqId: req.id, path: req.path }, 'request failed');
  res.status(err.status || 500).json({ error: 'internal_error' });
});
```

---

### 5. No timeouts on outbound HTTP, DB, or downstream I/O

**Location:** lines 23, 32, 39, 48, 58, 67

**Why it matters:** `http.get` with no `timeout` will hang indefinitely on a dead peer, holding the request, the writable file stream, and memory. MySQL queries have no `timeout` option set. `sendEmail` has no timeout. A single slow downstream is enough to exhaust connections. There is also no `req.setTimeout` / `res.setTimeout` / server-level timeout configured.

**Suggested fix:**

```js
const req = http.get(url, { timeout: 5_000 }, (response) => { /* ... */ });
req.on('timeout', () => req.destroy(new Error('upstream timeout')));
req.on('error', next);

// And per query:
await pool.query({ sql: '...', timeout: 3_000 }, params);
```

---

## Major issues

### 6. `/avatar` responds before the download completes

**Location:** lines 48-52

`res.send('ok')` fires synchronously after `pipe()` is wired up, before any bytes are written. The client gets 200 even if the upstream 500s, the disk fills, or the file is truncated. Wait for `file.on('finish', ...)` and handle `'error'` on both the request and the writable stream. Also: `fs.createWriteStream('./avatars/...')` uses a relative path that depends on `process.cwd()` at boot time — fragile. Use an absolute path from config and ensure the directory exists at startup.

### 7. Serial loop where parallel-with-concurrency-cap is appropriate (`/notify`)

**Location:** lines 60-62

`for (...) await sendEmail(...)` processes emails one at a time. For a real notification job this should be queued out-of-band (BullMQ, SQS, etc.), not done inside an HTTP request — the request will hang until every email is sent and any failure aborts the rest with no resumability. If it must stay inline, cap concurrency with `p-limit` or `Promise.allSettled` over chunks, and report partial failures.

### 8. No input validation anywhere

**Location:** lines 22, 30, 47, 56

`req.params.id` is used as-is (string interpolation into SQL — security reviewer's problem, but also a correctness one: `parseInt` it and reject NaN). `req.body.name`, `req.body.url` are assumed to exist and be strings; `undefined.body` will throw if `express.json()` isn't mounted. Add a schema validator (zod, joi, ajv) at the route boundary:

```js
const schema = z.object({ name: z.string().min(1).max(100) });
const { name } = schema.parse(req.body);
```

### 9. No structured logging or request correlation

**Location:** line 33 (the only log statement)

The single `console.log` is unstructured, includes raw user input in the message (log-injection risk and unparseable), and logs PII (email). There's no request id, no log levels, no timing. Adopt `pino` or `winston` with `req.id` (via `express-request-id` or `cls-hooked`), log start/end of each request with duration and status, and never log PII fields directly.

### 10. No tests

There are no unit or integration tests in this file or alongside it. For a router with five endpoints, DB I/O, file I/O, and outbound HTTP, the minimum bar is supertest-driven integration tests with the DB mocked or a test container, plus contract tests on the request/response shapes. CI should fail on coverage drop.

### 11. No graceful shutdown

`conn.connect()` opens a socket that is never explicitly closed. On `SIGTERM` (k8s rolling restart) the process exits with the connection dangling and any in-flight queries lost. Wire `process.on('SIGTERM', async () => { await pool.end(); server.close(); })` at the app level.

### 12. Hardcoded production credentials and hostnames in source

**Location:** lines 11-18

Out of scope for this review (security), but it's also a maintainability red flag: the same file can't be loaded in dev/test/CI without pointing at prod. Move to `process.env` and fail fast on missing required vars at boot.

---

## Minor / nits

- **Line 5-9:** Mixed `require` ordering — group node-builtins, then third-party, then local. Move `const router = express.Router()` below imports for readability.
- **Line 7:** `mysql` package is unmaintained — switch to `mysql2`.
- **Line 8:** Use `node:http` prefix for builtins (`require('node:http')`) for clarity and to avoid shadowing.
- **Line 25:** `res.json(rows[0])` returns `undefined` body when no row matches — should be a 404 with a JSON body, not an empty 200.
- **Line 31:** Template literal builds SQL — even ignoring injection, the `LIKE '%...%'` pattern prevents index use; consider FTS or a prefix-anchored search.
- **Line 41:** `/tmp/users_dump.json` is shared across concurrent requests — two simultaneous `/export` calls will race and corrupt each other's downloads. Use a per-request tempfile (`os.tmpdir()` + `crypto.randomUUID()`).
- **Line 49:** No directory existence check; `createWriteStream` on a missing directory emits `'error'` asynchronously which (per issue #4) is unhandled.
- **Line 63:** `res.send('done')` returns plain text from a JSON API — be consistent and return `res.json({ status: 'done' })`.
- **Line 67:** Stub `sendEmail` should at least be in its own module so it can be mocked in tests and swapped for a real implementation without touching the router.
- **Throughout:** No JSDoc, no TypeScript. For a router exposed on a public API, types on request/response payloads catch a class of bugs at edit time. Migrate to TS or at minimum add JSDoc `@typedef`s and run `tsc --checkJs`.
- **Throughout:** No metrics — no histogram for request duration, no counter for errors per route. Add `prom-client` and an Express middleware.

---

## Suggested refactor outline

1. **Split the file.** One module per concern:
   - `db.js` — pool creation, health check, graceful shutdown.
   - `routes/users.js` — thin handlers, validation at the boundary, no I/O glue.
   - `services/userService.js` — query functions returning typed objects (paginated `listUsers`, `getUserById`, `searchUsers`).
   - `services/avatarService.js` — fetch + persist with timeouts and proper stream lifecycle.
   - `services/notifier.js` — enqueues a job, doesn't send inline.
   - `lib/logger.js`, `lib/metrics.js`, `lib/errors.js`.

2. **Adopt `mysql2/promise` + a pool.** Single source of truth for DB access, configured from env, with `connectTimeout`, `connectionLimit`, and `enableKeepAlive`. Pool exposed via DI so tests can swap it.

3. **Async handlers everywhere, single error middleware.** Wrap each handler with `wrap()` / `express-async-errors`, and centralize logging + response formatting in one error handler.

4. **Validation at the boundary.** zod schemas per route; reject with 400 + machine-readable error codes before any I/O.

5. **Timeouts on every I/O.** DB query timeout, HTTP client timeout, server-level `keepAliveTimeout` and `headersTimeout`, request-level timeout middleware.

6. **Pagination + streaming.** No endpoint returns an unbounded list. Exports stream JSON/NDJSON straight to the response; no temp files unless absolutely required, and then per-request unique paths.

7. **Move work out of the request.** `/notify` enqueues to a worker queue and returns `202 Accepted` with a job id; the worker handles concurrency, retry, and observability.

8. **Observability.** Pino with request id middleware; Prometheus histogram + counter middleware; structured error logs with stack and reqId; never log PII.

9. **Tests.** Supertest integration tests against the router with the pool mocked or a Testcontainers MySQL; unit tests on services; contract tests on response shapes; CI gate on coverage.

10. **Config + lifecycle.** All config via env with a validation schema at boot (fail fast). Graceful shutdown closes the pool and drains the HTTP server on `SIGTERM`.
