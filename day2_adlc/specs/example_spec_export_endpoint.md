# Spec: User data export endpoint

> Example of a filled-in spec, sized for a ~45-minute spec-driven build
> against `sandbox_repo/`. Use it as the model for your own.

## Problem

Support keeps hand-assembling user data for GDPR/DPDP access requests.
We need a single endpoint that returns everything we hold about a user.

## Non-goals

- No async job / email delivery — synchronous JSON response only.
- No CSV or PDF formats.
- No admin UI.
- Does not include soft-deleted users (they are handled by the deletion flow).

## Behaviour

- `GET /users/:id/export`
- Auth: caller must be the user themselves or have the `admin` role
  (reuse `src/middleware/auth.ts`).
- Response `200`:

  ```json
  {
    "user": { "id": "...", "email": "...", "name": "...", "created_at": "..." },
    "export_generated_at": "<ISO-8601>",
    "format_version": 1
  }
  ```

- Data touched: reads `users` only. No migrations.

## Edge cases

- Unknown user id → `404`, body `{ "error": "user_not_found" }`.
- Authenticated as a *different* non-admin user → `403`, not `404`
  (don't leak which ids exist — return 403 for any id you're not allowed to read).
- Soft-deleted user (`deleted_at` set) → `404` even for admins.
- Malformed id (not a UUID) → `400`.

## Acceptance criteria

1. GIVEN a valid user requesting their own id, THEN 200 with all fields above.
2. GIVEN an admin requesting any active user, THEN 200.
3. GIVEN a non-admin requesting someone else's id, THEN 403.
4. GIVEN a soft-deleted or unknown id, THEN 404 with `user_not_found`.
5. GIVEN a non-UUID id, THEN 400.
6. `export_generated_at` parses as ISO-8601; `format_version` is `1`.

## Test plan

- Unit: route handler for each acceptance criterion (mock the db layer
  the way `tests/routes/users.test.ts` does).
- What must NOT break: existing `/users` routes and their tests.
