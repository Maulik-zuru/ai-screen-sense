import type { Critique } from "@ai-screen-sense/shared";
import { pool } from "../db/pool.js";

export async function createSession(personaIds: string[]): Promise<string> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO sessions (persona_ids) VALUES ($1) RETURNING id`,
    [personaIds]
  );
  return result.rows[0].id;
}

export async function endSession(sessionId: string): Promise<void> {
  await pool.query(`UPDATE sessions SET ended_at = now() WHERE id = $1`, [sessionId]);
}

export async function saveCritique(sessionId: string, critique: Critique): Promise<void> {
  await pool.query(
    `INSERT INTO critiques
      (id, session_id, persona_id, severity, spoken_text, transcript_text, code_fix, region, confidence, source)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (id) DO NOTHING`,
    [
      critique.id,
      sessionId,
      critique.personaId,
      critique.severity,
      critique.spokenText,
      critique.transcriptText,
      critique.codeFix ? JSON.stringify(critique.codeFix) : null,
      critique.region ? JSON.stringify(critique.region) : null,
      critique.confidence,
      critique.source,
    ]
  );
}

export async function getRecentTranscripts(
  sessionId: string,
  personaId: string,
  limit = 10
): Promise<{ personaId: string; transcriptText: string }[]> {
  const result = await pool.query<{ persona_id: string; transcript_text: string }>(
    `SELECT persona_id, transcript_text FROM critiques
     WHERE session_id = $1 AND persona_id = $2
     ORDER BY created_at DESC LIMIT $3`,
    [sessionId, personaId, limit]
  );
  return result.rows.map((r) => ({ personaId: r.persona_id, transcriptText: r.transcript_text }));
}
