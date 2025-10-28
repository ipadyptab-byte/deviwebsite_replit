/**
 * CLI script: Import the latest row from remote public.gold_rates into Neon Postgres.
 * Usage:
 *   - Ensure .env has DATABASE_URL and REMOTE_DATABASE_URL
 *   - Run: node server/import-from-remote.js
 *
 * This is intended to run on a machine/network that has connectivity to the remote DB
 * (103.159.153.24:5432). You can put it on a VM/host that can reach the source DB and
 * run it via cron to keep Neon in sync.
 */
require('dotenv').config();

const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { eq } = require('drizzle-orm');
const { rates } = require('../shared/schema.js');

function ensureEnv() {
  const missing = [];
  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');
  if (!process.env.REMOTE_DATABASE_URL) missing.push('REMOTE_DATABASE_URL');
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

function getTargetDb() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  return { db: drizzle(pool), pool };
}

function getRemotePool() {
  return new Pool({
    connectionString: process.env.REMOTE_DATABASE_URL,
    ssl: false,
  });
}

async function run() {
  ensureEnv();

  const { db, pool: targetPool } = getTargetDb();
  const remotePool = getRemotePool();

  try {
    console.log('Connecting to remote and fetching latest active gold_rates row...');
    const { rows } = await remotePool.query(`
      SELECT
        gold_24k_sale  AS vedhani,
        gold_22k_sale  AS ornaments22k,
        gold_18k_sale  AS ornaments18k,
        silver_per_kg_sale AS silver,
        created_date   AS updated_at
      FROM gold_rates
      WHERE is_active = true
      ORDER BY created_date DESC
      LIMIT 1;
    `);

    if (!rows || rows.length === 0) {
      console.log('No active gold_rates rows found.');
      return;
    }

    const r = rows[0];
    const payload = {
      vedhani: r.vedhani?.toString() ?? '',
      ornaments22k: r.ornaments22k?.toString() ?? '',
      ornaments18k: r.ornaments18k?.toString() ?? '',
      silver: r.silver?.toString() ?? '',
      updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
    };

    console.log('Upserting into Neon...', payload);
    const existing = await db.select().from(rates).limit(1);
    let result;
    if (existing.length > 0) {
      result = await db
        .update(rates)
        .set(payload)
        .where(eq(rates.id, existing[0].id))
        .returning();
    } else {
      result = await db.insert(rates).values(payload).returning();
    }

    console.log('Import complete. Row:', result[0]);
  } catch (err) {
    console.error('Import failed:', err);
    process.exitCode = 1;
  } finally {
    try { await remotePool.end(); } catch (_) {}
    try { await targetPool.end(); } catch (_) {}
  }
}

run();