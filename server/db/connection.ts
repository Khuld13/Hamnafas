import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DATA_DIR = path.resolve(__dirname, '..', 'data');
export const DB_PATH = path.join(DATA_DIR, 'hamnafas.db');

fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -8000');
db.pragma('busy_timeout = 5000');
db.pragma('foreign_keys = ON');

let closed = false;

/** Closes the SQLite handle. Safe to call more than once (graceful shutdown). */
export function closeDb(): void {
  if (closed) return;
  closed = true;
  try {
    db.pragma('wal_checkpoint(TRUNCATE)');
  } catch {
    // checkpoint is best-effort; never block shutdown on it
  }
  db.close();
}

export default db;
