/**
 * GET /api/rates
 * Returns the latest rates stored in the Vercel (Neon) database.
 */
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const ws = require('ws');
const { rates } = require('../../shared/schema.js');
const { desc } = require('drizzle-orm');

neonConfig.webSocketConstructor = ws;

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  if (!process.env.DATABASE_URL) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).end(JSON.stringify({ error: 'DATABASE_URL not set' }));
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });

  try {
    const rows = await db
      .select()
      .from(rates)
      .orderBy(desc(rates.updatedAt))
      .limit(1);

    if (!rows || rows.length === 0) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).end(JSON.stringify({ error: 'No rates found' }));
    }

    const latest = rows[0];
    const payload = {
      vedhani: latest.vedhani,
      ornaments22k: latest.ornaments22k,
      ornaments18k: latest.ornaments18k,
      silver: latest.silver,
      updatedAt: latest.updatedAt,
      source: 'vercel-db',
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate'); // cache at edge for 1 min
    return res.status(200).end(JSON.stringify(payload));
  } catch (error) {
    console.error('Error fetching latest rates from DB:', error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).end(JSON.stringify({ error: 'Failed to read rates from DB', details: String(error) }));
  } finally {
    await pool.end();
  }
};