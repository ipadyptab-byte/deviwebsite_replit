import { Pool } from 'pg';
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Your Neon database connection (from Vercel Environment Variable)
const DB_URL = process.env.DATABASE_URL;

// Source API — your live rates endpoint
const SOURCE_URL = 'https://www.devi-jewellers.com/api/rates/live';

// PostgreSQL connection
function getPool() {
  return new Pool({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
  });
}

// Create the table if it doesn't exist
async function ensureTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rates_history (
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

// Fetch JSON data from your own API
async function fetchLiveRates() {
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Failed to fetch rates: ${res.statusText}`);
  const data = await res.json();
  return {
    vedhani: data.vedhani,
    ornaments22k: data.ornaments22K,
    ornaments18k: data.ornaments18K,
    silver: data.silver,
    updated_at: data.updatedAt,
    source: data.source || 'devi-jewellers',
  };
}

// Insert new record into the table
async function insertRates(pool, payload) {
  await pool.query(
    `
    INSERT INTO rates_history (vedhani, ornaments22k, ornaments18k, silver, updated_at, source)
    VALUES ($1, $2, $3, $4, $5, $6);
    `,
    [
      payload.vedhani,
      payload.ornaments22k,
      payload.ornaments18k,
      payload.silver,
      payload.updated_at,
      payload.source,
    ]
  );
}

// Main handler (Serverless Function)
export default async function handler(req, res) {
  const pool = getPool();
  try {
    await ensureTable(pool);
    const rates = await fetchLiveRates();
    await insertRates(pool, rates);
    res.status(200).json({ success: true, message: 'Rates saved to database', rates });
  } catch (err) {
    console.error('Error saving rates:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await pool.end();
  }
}
