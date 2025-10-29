require('dotenv').config();

const { Pool } = require('pg');
// node-fetch via dynamic import for environments without global fetch
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const DEVI_URL = 'https://www.devi-jewellers.com/api/rates/live';

// Fallback to provided connection string if DATABASE_URL is not set
const CONNECTION_STRING =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_p9MsbmIFeEq6@ep-ancient-sky-adb87hwt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

function getPool() {
  return new Pool({
    connectionString: CONNECTION_STRING,
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

async function fetchDeviRates() {
  const res = await fetch(DEVI_URL, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Failed to fetch Devi rates: ${res.status} ${res.statusText}`);
  const data = await res.json();

  // Expecting payload like:
  // {"vedhani":119500,"ornaments22K":109940,"ornaments18K":99190,"silver":1500,"updatedAt":"2025-10-29T13:45:47.009Z","source":"businessmantra"}
  return {
    gold_24k_sale: Number(data.vedhani ?? 0),
    gold_22k_sale: Number(data.ornaments22K ?? 0),
    gold_18k_sale: Number(data.ornaments18K ?? 0),
    silver_per_kg_sale: Number(data.silver ?? 0),
    created_date: data.updatedAt ? new Date(data.updatedAt) : new Date(),
    source: typeof data.source === 'string' ? data.source : 'businessmantra',
  };
}

async function insertGoldRates(pool, payload) {
  // Deactivate previous active rows
  await pool.query(`UPDATE gold_rates SET is_active = false WHERE is_active = true;`);

  // Insert new active row
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
    VALUES ($1, NULL, $2, NULL, $3, NULL, $4, NULL, TRUE, $5, $6)
    RETURNING *;
  `,
    [
      payload.gold_24k_sale,
      payload.gold_22k_sale,
      payload.gold_18k_sale,
      payload.silver_per_kg_sale,
      payload.created_date,
      payload.source,
    ]
  );
  return rows[0];
}

async function main() {
  const pool = getPool();
  try {
    console.log('Ensuring gold_rates table exists...');
    await ensureGoldRatesTable(pool);

    console.log('Fetching rates from Devi API...');
    const payload = await fetchDeviRates();
    console.log('Fetched payload:', payload);

    console.log('Inserting into gold_rates (Neon)...');
    const saved = await insertGoldRates(pool, payload);

    console.log('Saved row:', saved);
  } catch (err) {
    console.error('Failed:', err);
    process.exitCode = 1;
  } finally {
    try { await pool.end(); } catch (_) {}
  }
}

if (require.main === module) {
  main();
}
