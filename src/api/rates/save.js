const { Pool } = require('pg');
// Vercel provides fetch in Node 20, but for compatibility we use node-fetch
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const DB_URL = process.env.DATABASE_URL;
const SOURCE_URL = 'https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php';

function getPool() {
  if (!DB_URL) {
    throw new Error('DATABASE_URL is not set. Configure it in Vercel project settings.');
  }
  return new Pool({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
  });
}

/**
 * Ensure rates table exists with the correct schema
 */
async function ensureTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rates (
      id SERIAL PRIMARY KEY,
      vedhani TEXT NOT NULL,
      ornaments22k TEXT NOT NULL,
      ornaments18k TEXT NOT NULL,
      silver TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

/**
 * Fetch the live rates from BusinessMantra API
 */
async function fetchLiveRates() {
  const res = await fetch(SOURCE_URL, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(\`Failed to fetch rates: \${res.status} \${res.statusText}\`);
  const raw = await res.json();

  // Normalize to rates table schema
  return {
    vedhani: (raw['24K Gold'] ?? '').toString(),
    ornaments22k: (raw['22K Gold'] ?? '').toString(),
    ornaments18k: (raw['18K Gold'] ?? '').toString(),
    silver: (raw['Silver'] ?? '').toString(),
  };
}

/**
 * Upsert rates into the database (update if exists, insert if not)
 */
async function upsertRates(pool, payload) {
  const { rows: existing } = await pool.query(`SELECT id FROM rates LIMIT 1;`);
  
  if (existing.length > 0) {
    await pool.query(
      `
      UPDATE rates
      SET vedhani = $1,
          ornaments22k = $2,
          ornaments18k = $3,
          silver = $4,
          updated_at = NOW()
      WHERE id = $5;
      `,
      [payload.vedhani, payload.ornaments22k, payload.ornaments18k, payload.silver, existing[0].id]
    );
  } else {
    await pool.query(
      `
      INSERT INTO rates (vedhani, ornaments22k, ornaments18k, silver)
      VALUES ($1, $2, $3, $4);
      `,
      [payload.vedhani, payload.ornaments22k, payload.ornaments18k, payload.silver]
    );
  }
}

module.exports = async (req, res) => {
  const pool = getPool();
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      res.setHeader('Content-Type', 'application/json');
      return res.status(405).end(JSON.stringify({ error: 'Method Not Allowed' }));
    }

    await ensureTable(pool);
    const payload = await fetchLiveRates();
    await upsertRates(pool, payload);

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).end(JSON.stringify({ success: true, message: 'Rates saved to database', payload }));
  } catch (err) {
    console.error('Error saving rates:', err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).end(JSON.stringify({ success: false, error: err.message }));
  } finally {
    try { await pool.end(); } catch (_) {}
  }
};
