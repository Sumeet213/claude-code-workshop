// Lightweight test double for the migration runner. Instead of a real
// Postgres instance, we parse the migration SQL and apply it to an
// in-memory schema — enough to verify Up/Down symmetry in CI.
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const MIGRATIONS_DIR = path.join(__dirname, '..', '..', 'src', 'db', 'migrations');

const schema: Record<string, Set<string>> = {
  users: new Set(['id', 'email', 'name', 'created_at', 'deleted_at']),
};

function sectionOf(sql: string, marker: 'Up' | 'Down'): string {
  const up = sql.indexOf('-- +migrate Up');
  const down = sql.indexOf('-- +migrate Down');
  if (marker === 'Up') return down === -1 ? sql.slice(up) : sql.slice(up, down);
  return down === -1 ? '' : sql.slice(down);
}

function apply(section: string): void {
  for (const m of section.matchAll(/ALTER TABLE (\w+)\s+ADD COLUMN (\w+)/gi)) {
    schema[m[1]]?.add(m[2]);
  }
  for (const m of section.matchAll(/ALTER TABLE (\w+)\s+DROP COLUMN (?:IF EXISTS )?(\w+)/gi)) {
    schema[m[1]]?.delete(m[2]);
  }
}

async function load(name: string): Promise<string> {
  return readFile(path.join(MIGRATIONS_DIR, `${name}.sql`), 'utf8');
}

export async function runMigration(name: string): Promise<void> {
  apply(sectionOf(await load(name), 'Up'));
}

export async function rollbackMigration(name: string): Promise<void> {
  apply(sectionOf(await load(name), 'Down'));
}

export async function getColumnNames(table: string): Promise<string[]> {
  return [...(schema[table] ?? [])];
}
