/**
 * Vercel Serverless Function: Sync live rates into DB
 * POST /api/rates/sync
 */
const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { eq } = require('drizzle-orm');

let db = null;
function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set');
  }
  if (!db) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    db = drizzle(pool);
  }
  return db;
}

const { rates } = require('../../../shared/schema.js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  try {
    const database = getDb();

    const doFetch = async (url, options) => {
      if (typeof fetch === 'function') {
        return fetch(url, options);
      }
      const mod = await import('node-fetch');
      return mod.default(url, options);
    };

    const response = await doFetch('https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php', {
      headers: { Accept: 'application/json' },
    });

    if (!response || !response.ok) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(502).end(JSON.stringify({ error: 'Failed to fetch external rates' }));
    }

    let raw;
    const ct = response.headers?.get?.('content-type') || '';
    if (ct.includes('application/json')) {
      raw = await response.json();
    } else {
      const text = await response.text();
      try {
        raw = JSON.parse(text);
      } catch {
        res.setHeader('Content-Type', 'application/json');
        return res
          .status(502)
          .end(JSON.stringify({ error: 'External response was not JSON', contentType: ct, preview: text.slice(0, 120) }));
      }
    }

    const payload = {
      vedhani: raw['24K Gold'] ?? '',
      ornaments22k: raw['22K Gold'] ?? '',
      ornaments18k: raw['18K Gold'] ?? '',
      silver: raw['Silver'] ?? '',
      updatedAt: new Date(),
    };

    const existingRates = await database.select().from(rates).limit(1);
    let result;
    if (existingRates.length > 0) {
      result = await database.update(rates)
        .set(payload)
        .where(eq(rates.id, existingRates[0].id))
        .returning();
    } else {
      result = await database.insert(rates).values(payload).returning();
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).end(JSON.stringify(result[0]));
  } catch (error) {
    console.error('Error in /api/rates/sync:', error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).end(JSON.stringify({ error: 'Failed to sync rates' }));
  }
};
