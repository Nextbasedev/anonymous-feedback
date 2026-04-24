import { sql } from "@vercel/postgres";

export interface Token {
  id: number;
  token: string;
  email: string;
  used: boolean;
  created_at: string;
  used_at: string | null;
}

export interface TokenStats {
  total: number;
  used: number;
  pending: number;
}

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS tokens (
      id SERIAL PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      used_at TIMESTAMP
    )
  `;
}

export async function createToken(token: string, email: string) {
  // Skip if email already has an unused token
  const existing = await sql`
    SELECT id FROM tokens WHERE email = ${email} AND used = FALSE
  `;
  if (existing.rows.length > 0) return null;

  const result = await sql`
    INSERT INTO tokens (token, email) VALUES (${token}, ${email})
    RETURNING *
  `;
  return result.rows[0];
}

export async function validateToken(token: string) {
  const result = await sql`
    SELECT * FROM tokens WHERE token = ${token}
  `;
  return result.rows[0] || null;
}

export async function burnToken(token: string) {
  await sql`
    UPDATE tokens SET used = TRUE, used_at = NOW() WHERE token = ${token}
  `;
}

export async function getAllTokens(): Promise<Token[]> {
  const result = await sql`
    SELECT * FROM tokens ORDER BY created_at DESC
  `;
  return result.rows as Token[];
}

export async function deleteToken(id: number) {
  await sql`DELETE FROM tokens WHERE id = ${id} AND used = FALSE`;
}

export async function getTokenStats(): Promise<TokenStats> {
  const result = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE used = TRUE) as used,
      COUNT(*) FILTER (WHERE used = FALSE) as pending
    FROM tokens
  `;
  return result.rows[0] as TokenStats;
}
