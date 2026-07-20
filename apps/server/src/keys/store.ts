import { pool } from "../db/pool.js";
import { decryptSecret, encryptSecret } from "./crypto.js";

export async function saveProviderKey(provider: string, apiKey: string): Promise<void> {
  const encrypted = encryptSecret(apiKey);
  await pool.query(
    `INSERT INTO provider_keys (provider, encrypted_key)
     VALUES ($1, $2)
     ON CONFLICT (provider)
     DO UPDATE SET encrypted_key = EXCLUDED.encrypted_key, updated_at = now()`,
    [provider, encrypted]
  );
}

export async function getProviderKey(provider: string): Promise<string | null> {
  const result = await pool.query<{ encrypted_key: Buffer }>(
    `SELECT encrypted_key FROM provider_keys WHERE provider = $1`,
    [provider]
  );
  if (result.rows.length === 0) return null;
  return decryptSecret(result.rows[0].encrypted_key);
}

export async function hasProviderKey(provider: string): Promise<boolean> {
  const result = await pool.query(`SELECT 1 FROM provider_keys WHERE provider = $1`, [provider]);
  return (result.rowCount ?? 0) > 0;
}
