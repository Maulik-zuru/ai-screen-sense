import "dotenv/config";
import { pool } from "./pool.js";

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS provider_keys (
    id SERIAL PRIMARY KEY,
    provider TEXT NOT NULL UNIQUE,
    encrypted_key BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_ids TEXT[] NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ
  )`,
  `CREATE TABLE IF NOT EXISTS critiques (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    persona_id TEXT NOT NULL,
    severity TEXT NOT NULL,
    spoken_text TEXT NOT NULL,
    transcript_text TEXT NOT NULL,
    code_fix JSONB,
    region JSONB,
    confidence REAL NOT NULL,
    source TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
];

async function migrate() {
  await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
  for (const statement of MIGRATIONS) {
    await pool.query(statement);
  }
  console.log(`Applied ${MIGRATIONS.length} migrations.`);
  await pool.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
