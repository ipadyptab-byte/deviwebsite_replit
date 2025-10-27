/**
 * Vercel Serverless Function: Import rates from a remote Postgres into Vercel Postgres
 * POST /api/rates/import-remote
 *
 * Env:
 * - DATABASE_URL: target Vercel Postgres (required)
 * - REMOTE_DATABASE_URL: source Postgres (required) — if not set, request will fail
 *
 * Behavior:
 * - Reads the latest row from source.rates ordered by updated_at desc
 * - Upserts it into target.rates (updates first row if exists, otherwise inserts)
 */
const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { eq } = require('drizzle-orm');

const { rates } = require('../../shared/schema.js');

let targetDb = null;
function getTargetDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set');
  }
  if (!targetDb) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    targetDb = drizzle(pool);
  }
  return targetDb;
}

function getRemoteClient() {
  const remoteUrl = process.env.REMOTE_DATABASE_URL;
  if (!remoteUrl) {
    throw new Error('REMOTE_DATABASE_URL must be set to import from remote DB');
  }
  return new Pool({
    connectionString: remoteUrl,
    ssl: false, // remote appears to be a direct IP; disable SSL
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  let remotePool;
  try {
    const database = getTargetDb();
    remotePool = getRemoteClient();

    // Try to fetch latest row from remote 'rates' table
    // Be defensive with column names (snake_case expected)
    const { rows } = await remotePool.query(
      `SELECT vedhani, ornaments22k, ornaments18k, silver, updated_at
       FROM rates
       ORDER BY updated_at DESC
       LIMIT 1`
    );

    if (!rows || rows.length === 0) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).end(JSON.stringify({ error: 'No rates found in remote database' }));
    }

    const latest = rows[0] || {};
    const payload = {
      vedhani: latest.vedhani ?? latest.vedhani || '',
      ornaments22k: latest.ornaments22k ?? latest.ornaments22k || '',
      ornaments18k: latest.ornaments18k ?? latest.ornaments18k || '',
      silver: latest.silver ?? latest.silver || '',
      updatedAt: latest.updated_at ? new Date(latest.updated_at) : new Date(),
    };

    // Upsert into target
    const existing = await database.select().from(rates).limit(1);
    let result;
    if (existing.length > 0) {
      result = await database.update(rates)
        .set(payload)
        .where(eq(rates.id, existing[0].id))
        .returning();
    } else {
      result = await database.insert(rates).values(payload).returning();
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).end(JSON.stringify({ status: 'ok', imported: result[0] }));
  } catch (error) {
    console.error('Error importing rates from remote DB:', error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).end(JSON.stringify({ error: 'Failed to import from remote DB', details: String(error) }));
  } finally {
    if (remotePool) {
      try { await remotePool.end(); } catch (_) {}
    }
  }
};