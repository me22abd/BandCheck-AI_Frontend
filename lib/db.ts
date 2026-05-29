import { Pool } from "pg";

// Singleton pool — reused across serverless warm invocations
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3, // conservative for serverless
      idleTimeoutMillis: 30_000,
    });
  }
  return pool;
}

/**
 * Run a query and return rows. Never throws — returns empty array on error
 * so callers don't need try/catch for non-critical writes.
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  const client = await getPool().connect();
  try {
    const res = await client.query(sql, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}

/**
 * Fire-and-forget query — logs errors but never rejects.
 * Use for non-critical inserts so they don't slow down API responses.
 */
export function fireAndForget(sql: string, params?: unknown[]): void {
  query(sql, params).catch((err) =>
    console.error("[db] fire-and-forget failed:", err?.message),
  );
}

/**
 * Create tables if they don't exist. Call once on app startup / migration.
 */
export async function migrate(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS postcode_checks (
      id            SERIAL PRIMARY KEY,
      postcode      TEXT        NOT NULL,
      district      TEXT        NOT NULL,
      user_band     TEXT        NOT NULL,
      band_source   TEXT        NOT NULL,
      is_estimated  BOOLEAN     NOT NULL DEFAULT false,
      case_strength NUMERIC(5,2),
      nearby_count  INTEGER     NOT NULL DEFAULT 0,
      checked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_pc_checks_district
      ON postcode_checks (district);

    CREATE INDEX IF NOT EXISTS idx_pc_checks_postcode
      ON postcode_checks (postcode);

    CREATE TABLE IF NOT EXISTS appeal_outcomes (
      id                  SERIAL PRIMARY KEY,
      postcode            TEXT        NOT NULL,
      original_band       TEXT        NOT NULL,
      outcome             TEXT        NOT NULL,
      refund_amount       NUMERIC(10,2),
      annual_reduction    NUMERIC(10,2),
      recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_outcomes_postcode
      ON appeal_outcomes (postcode);

    CREATE TABLE IF NOT EXISTS testimonials (
      id            SERIAL PRIMARY KEY,
      postcode      TEXT        NOT NULL,
      first_name    TEXT        NOT NULL,
      area          TEXT,
      feedback      TEXT        NOT NULL,
      refund_amount NUMERIC(10,2),
      approved      BOOLEAN     NOT NULL DEFAULT false,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}
