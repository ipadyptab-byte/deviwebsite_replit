require('dotenv').config();

const { Pool } = require('pg');
// node-fetch via dynamic import for environments without global fetch
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_p9MsbmIFeEq6@ep-ancient-sky-adb87hwt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
const SOURCE_URL = 'https://www.devi-jewellers.com/api/rates/live';

function getPool() {
  return new Pool({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false },
  });
}

async function ensureRatesTable(pool) {
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

async function fetchRates() {
  const res = await fetch(SOURCE_URL, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(\`Failed to fetch source rates: \${res.status} \${res.statusText}\`);
  const raw = await res.json();
  // Expected raw example:
  // {"vedhani":119500,"ornaments22K":109940,"ornaments18K":99190,"silver":1500,"updatedAt":"2025-10-29T13:31:26.062Z","source":"businessmantra"}
  return {
    vedhani: (raw['vedhani'] ?? '').toString(),
    ornaments22k: (raw['ornaments22K'] ?? '').toString(),
    ornaments18k: (raw['ornaments18K'] ?? '').toString(),
    silver: (raw['silver'] ?? '').toString(),
  };
}

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

async function runOnce() {
  const pool = getPool();
  try {
    console.log('Ensuring rates table exists...');
    await ensureRatesTable(pool);

    console.log('Fetching live rates from devi-jewellers...');
    const payload = await fetchRates();
    console.log('Fetched payload:', payload);

    console.log('Upserting into Postgres...');
    await upsertRates(pool, payload);

    console.log('Done.');
  } catch (err) {
    console.error('Failed:', err);
    process.exitCode = 1;
  } finally {
    try { await pool.end(); } catch (_) {}
  }
}

async function main() {
  const interval = Number(process.env.SYNC_INTERVAL_MS || '0');
  if (interval > 0) {
    // Continuous mode
    console.log(\`Starting continuous sync every \${interval} ms\`);
    // Run immediately, then on interval
    await runOnce();
    setInterval(runOnce, interval);
  } else {
    // One-shot mode
    await runOnce();
  }
}

main();