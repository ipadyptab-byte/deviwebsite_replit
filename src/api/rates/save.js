import { Pool } from 'pg';
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const DB_URL = process.env.DATABASE_URL;
const SOURCE_URL = 'https://www.devi-jewellers.com/api/rates/live';

function getPool() {
  return new Pool({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
  });
}

/**
 * Ensure gold_rates table exists with the expected schema.
 * Mirrors the schema shown in the user's remote DB.
 */
async function ensureTable(pool) {
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

/**
 * Fetch the live rates from devi-jewellers proxy endpoint.
 */
async function fetchLiveRates() {
  const res = await fetch(SOURCE_URL, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Failed to fetch rates: ${res.status} ${res.statusText}`);
  const data = await res.json();

  // Normalize to gold_rates schema; purchase fields not provided -> NULL
  return {
    gold_24k_sale: data.vedhani ?? null,
    gold_24k_purchase: null,
    gold_22k_sale: data.ornaments22K ?? null,
    gold_22k_purchase: null,
    gold_18k_sale: data.ornaments18K ?? null,
    gold_18k_purchase: null,
    silver_per_kg_sale: data.silver ?? null,
    silver_per_kg_purchase: null,
    is_active: true,
    created_date: data.updatedAt ? new Date(data.updatedAt) : new Date(),
    source: data.source || 'businessmantra',
  };
}

/**
 * Deactivate previous active rows and insert the new one.
 */
async function insertRates(pool, payload) {
  await pool.query(`UPDATE gold_rates SET is_active = FALSE WHERE is_active = TRUE;`);

  await pool.query(
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
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11);
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
      payload.is_active,
      payload.created_date,
      payload.source,
    ]
  );
}

export default async function handler(req, res) {
  const pool = getPool();
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    await ensureTable(pool);
    const payload = await fetchLiveRates();
    await insertRates(pool, payload);

    res.status(200).json({ success: true, message: 'Rates saved to gold_rates', payload });
  } catch (err) {
    console.error('Error saving rates:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await pool.end();
  }
}
