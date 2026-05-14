import { describe, expect, it } from 'vitest';
import { runMigration, rollbackMigration, getColumnNames } from '../helpers/migrations';

describe('migration 0042 — add soft_deleted_at', () => {
  it('adds the column on up', async () => {
    await runMigration('0042_add_soft_delete');
    const cols = await getColumnNames('users');
    expect(cols).toContain('soft_deleted_at');
  });

  it('removes the column on rollback', async () => {
    await runMigration('0042_add_soft_delete');
    await rollbackMigration('0042_add_soft_delete');
    const cols = await getColumnNames('users');
    // This assertion fails on main today — the migration's Down block contains
    // only "-- TODO", so the column persists after rollback.
    expect(cols).not.toContain('soft_deleted_at');
  });
});
