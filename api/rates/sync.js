/**
 * POST /api/rates/sync
 * Fetches data from an external Postgres database and stores it in the Vercel (Neon) database.
 *
 * Env:
 *  - DATABASE_URL: Neon/Vercel Postgres connection string (target)
 *  - EXTERNAL_DATABASE_URL: External Postgres connection string (source)
 *    Fallback default: postgresql://postgres:mangesh1981@103.159.153.24:5432/devitvdisplay
 *
 * It tries common table names: 'rates', 'gold_rates', 'current_rates'
 * expecting columns: vedhani, ornaments22k, ornaments18k, silver, updated_at
 */
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const ws = require('ws');
const { rates } = require('../../shared/schema.js');
const { Client } = require('pg');

neonConfig.webSocketConstructor = ws;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  const targetDbUrl = process.env.DATABASE_URL;
  const sourceDbUrl = process.env.EXTERNAL_DATABASE_URL || 'postgresql://postgres:mangesh1981@103.159.153.24:5432/devitvdisplay';

  if (!targetDbUrl) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).end(JSON.stringify({ error: 'DATABASE_URL not set' }));
  }

  const source = new Client({ connectionString: sourceDbUrl });
  const targetPool = new Pool({ connectionString: targetDbUrl });
  const targetDb = drizzle({ client: targetPool });

  try {
    await source.connect();

    const candidateTables = ['rates', 'gold_rates', 'current_rates'];
    let latestRow = null;
    let usedTable = null;
    let lastError = null;

    for (const table of candidateTables) {
      try {
        const query = `SELECT vedhani, ornaments22k, ornaments18k, silver, updated_at FROM ${table} ORDER BY updated_at DESC LIMIT 1`;
        const result = await source.query(query);
        if (result.rows && result.rows.length > 0) {
          latestRow = result.rows[0];
          usedTable = table;
          break;
        }
      } catch (err) {
        lastError = err;
        // Try next table
      }
    }

    if (!latestRow) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).end(JSON.stringify({
        error: 'No rates found in external DB',
        details: lastError ? String(lastError) : 'Tried tables: rates, gold_rates, current_rates',
      }));
    }

    // Insert into target DB
    const insertRes = await targetDb
      .insert(rates)
      .values({
        vedhani: String(latestRow.vedhani ?? ''),
        ornaments22k: String(latestRow.ornaments22k ?? ''),
        ornaments18k: String(latestRow.ornaments18k ?? ''),
        silver: String(latestRow.silver ?? ''),
        updatedAt: latestRow.updated_at ?? new Date(),
      })
      .returning();

    const saved = insertRes[0];

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).end(JSON.stringify({
      message: 'Synced rates from external DB',
      sourceTable: usedTable,
      saved: {
        vedhani: saved.vedhani,
        ornaments22k: saved.ornaments22k,
        ornaments18k: saved.ornaments18k,
        silver: saved.silver,
        updatedAt: saved.updatedAt,
      },
    }));
  } catch (error) {
    console.error('Error syncing rates:', error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).end(JSON.stringify({ error: 'Failed to sync rates', details: String(error) }));
  } finally {
    try { await source.end(); } catch {}
    try { await targetPool.end(); } catch {}
  }
};