/**
 * Serverless Function: Sync live rates into gold_rates table (Neon)
 * - Fetches from BusinessMantra SOURCE_URL
 * - Deactivates previous active rows and inserts a new active row
 * - Supports GET/POST: /api/rates/sync-gold-rates
 */
const { Pool } = require('pg');

const SOURCE_URL =
  process.env.SOURCE_URL ||
  'https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php';

function getPool() {
  const conn = process.env.DATABASE_URL;
  if (!conn) {
    throw new Error('DATABASE_URL must be set');
  }
  return new Pool({
    connectionString: conn,
    ssl: { rejectUnauthorized: false },
  });
}

async function ensureGoldRatesTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS gold_rates (
      id SERIAL PRIMARY KEY,
      gold_24k_sale NUMERIC,
      gold_24k_purchase NUMERIC,
      gold_22k_sale NUMERIC,
      gold_22k_purchase NUMERIC,
      gold_18k_sale NUMERIC,
      gold_18k_purchase NUMERIC,
      silver_per_kg_sale NUMERIC,
      silver_per_kg_purchase NUMERIC,
      is_active BOOLEAN DEFAULT TRUE,
      created_date TIMESTAMP DEFAULT NOW(),
      source TEXT
    );
  `);
}

async function fetchSource() {
  const doFetch = async (url, options) => {
    if (typeof fetch === 'function') return fetch(url, options);
    const mod = await import('node-fetch');
    return mod.default(url, options);
  };

  const res = await doFetch(SOURCE_URL, { headers: { Accept: 'application/json' } });
  if (!res || !res.ok) {
    const status = res ? `${res.status} ${res.statusText}` : 'no response';
    throw new Error(`Failed to fetch SOURCE_URL: ${status}`);
  }

  let raw;
  const ct = res.headers?.get?.('content-type') || '';
  if (ct.includes('application/json')) {
    raw = await res.json();
  } else {
    const text = await res.text();
    try {
      raw = JSON.parse(text);
    } catch {
      throw new Error(`SOURCE_URL did not return JSON (content-type: ${ct})`);
    }
  }

  return raw;
}

function normalizeToGoldRates(raw) {
  // Map BusinessMantra keys to our gold_rates schema
  const now = new Date();
  return {
    gold_24k_sale: Number(raw['24K Gold'] ?? 0),
    gold_24k_purchase: null,
    gold_22k_sale: Number(raw['22K Gold'] ?? 0),
    gold_22k_purchase: null,
    gold_18k_sale: Number(raw['18K Gold'] ?? 0),
    gold_18k_purchase: null,
    silver_per_kg_sale: Number(raw['Silver'] ?? 0),
    silver_per_kg_purchase: null,
    created_date: now,
    source: 'businessmantra',
  };
}

async function insertGoldRates(pool, payload) {
  // Deactivate any previous active rows
  await pool.query(`UPDATE gold_rates SET is_active = false WHERE is_active = true;`);

  const { rows } = await pool.query(
    `
    INSERT INTO gold_rates (
      gold_24k_sale,
      gold_24k_purchase,
      gold_22k_sale,
      gold_22k_purchase,
      gold_18k_sale,
      gold_18k_purchase,
      silver_per_kg_sale,
      silver_per_kg_purchase,
      is_active,
      created_date,
      source
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, $9, $10)
    RETURNING *;
  `,
    [
      payload.gold_24k_sale,
      payload.gold_24k_purchase,
      payload.gold_22k_sale,
      payload.gold_22k_purchase,
      payload.gold_18k_sale,
      payload.gold_18k_purchase,
      payload.silver_per_kg_sale,
      payload.silver_per_kg_purchase,
      payload.created_date,
      payload.source,
    ]
  );

  return rows[0];
}

module.exports = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  const pool = getPool();
  try {
    await ensureGoldRatesTable(pool);

    const raw = await fetchSource();
    const payload = normalizeToGoldRates(raw);
    const saved = await insertGoldRates(pool, payload);

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).end(JSON.stringify({ success: true, row: saved }));
  } catch (err) {
    console.error('sync-gold-rates error:', err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).end(JSON.stringify({ success: false, error: err.message || String(err) }));
  } finally {
    try { await pool.end(); } catch {}
  }
};
