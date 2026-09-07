import { db, DB_PATH } from './connection.js';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS guests (
  id TEXT PRIMARY KEY,
  preferred_language TEXT DEFAULT 'roman_urdu',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  guest_id TEXT NOT NULL,
  title TEXT,
  mood TEXT,
  language TEXT DEFAULT 'roman_urdu',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guest_id) REFERENCES guests(id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_guest ON conversations(guest_id);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  is_crisis_flagged INTEGER DEFAULT 0,
  suggested_prompts TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);

CREATE TABLE IF NOT EXISTS screening_results (
  id TEXT PRIMARY KEY,
  guest_id TEXT NOT NULL,
  screening_type TEXT NOT NULL CHECK(screening_type IN ('phq9','gad7')),
  total_score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  severity_band TEXT NOT NULL,
  answers_json TEXT,
  is_crisis_flagged INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guest_id) REFERENCES guests(id)
);

CREATE INDEX IF NOT EXISTS idx_screening_guest ON screening_results(guest_id);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

/** Creates every table and index the backend needs. Idempotent. */
export function initializeDatabase(): void {
  db.exec(SCHEMA_SQL);
  console.log(`[db] schema ready at ${DB_PATH}`);
}

/** Runs incremental migrations. Safe to call repeatedly (idempotent). */
export function runMigrations(): void {
  // Add user_id column to guests table for linking guest sessions to authenticated users
  try {
    db.exec('ALTER TABLE guests ADD COLUMN user_id TEXT REFERENCES users(id)');
    console.log('[db] migration: added user_id column to guests');
  } catch (err: any) {
    // "duplicate column name" means the migration already ran — that is fine.
    if (!err.message?.includes('duplicate column')) {
      throw err;
    }
  }

  // Add risk_tier column to messages so tiered crisis responses ('moderate'
  // vs 'high') are distinguishable in history, not just a single boolean.
  try {
    db.exec("ALTER TABLE messages ADD COLUMN risk_tier TEXT DEFAULT 'none'");
    console.log('[db] migration: added risk_tier column to messages');
  } catch (err: any) {
    if (!err.message?.includes('duplicate column')) {
      throw err;
    }
  }
}

export default initializeDatabase;
