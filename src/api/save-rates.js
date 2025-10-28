import { Pool } from 'pg';
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const DB_URL = process.env.DATABASE_URL;
const SOURCE_URL = 'https://www.devi-jewellers.com/api/rates/live';

// Create Postgres connection
function getPool() {
  return new Pool({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
  });
}

// Create table if not exists
async function ensureTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rates (
      id SERIAL PRIMARY KEY,
      vedhani NUMERIC,
      ornaments22k NUMERIC,
      ornaments18k NUMERIC,
      silver NUMERIC,
      updated_at TIMESTAMP DEFAULT NOW(),
      source TEXT
    );
  `);
}

// Fetch JSON from your existing API
async function fetchLiveRates() {
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
  const data = await res.json();
  return {
    vedhani: data.vedhani,
    ornaments22k: data.ornaments22K,
    ornaments18k: data.ornaments18K,
    silver: data.silver,
    updated_at: data.updatedAt,
    source: data.source,
  };
}

// Upsert (insert or update) into database
async function upsertRates(pool, payload) {
  const { rows } = await pool.query(`SELECT id FROM rates LIMIT 1`);
  if (rows.length > 0) {
    await pool.query(
      `UPDATE rates SET vedhani=$1, ornaments22k=$2, ornaments18k=$3, silver=$4, updated_at=$5, source=$6 WHERE id=$7`,
      [payload.vedhani, payload.ornaments22k, payload.ornaments18k, payload.silver, payload.updated_at, payload.source, rows[0].id]
    );
  } else {
    await pool.query(
      `INSERT INTO rates (vedhani, ornaments22k, ornaments18k, silver, updated_at, source)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [payload.vedhani, payload.ornaments22k, payload.ornaments18k, payload.silver, payload.updated_at, payload.source]
    );
  }
}

// Main API handler
export default async function handler(req, res) {
  const pool = getPool();
  try {
    await ensureTable(pool);
    const rates = await fetchLiveRates();
    await upsertRates(pool, rates);
    res.status(200).json({ success: true, message: 'Rates stored successfully', rates });
  } catch (err) {
    console.error('Error saving rates:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await pool.end();
  }
}
