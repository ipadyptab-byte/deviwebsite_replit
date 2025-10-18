/**
 * Vercel Serverless Function: Rates CRUD
 * - GET /api/rates => latest DB record
 * - PUT /api/rates => upsert payload into DB
 */
const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { eq, desc } = require('drizzle-orm');

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

const { rates } = require('../../shared/schema.js');

module.exports = async (req, res) => {
  try {
    const database = getDb();

    if (req.method === 'GET') {
      const allRates = await database.select().from(rates).orderBy(desc(rates.updatedAt)).limit(1);
      if (allRates.length > 0) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).end(JSON.stringify(allRates[0]));
      }
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).end(JSON.stringify({ error: 'No rates found' }));
    }

    if (req.method === 'PUT') {
      const { vedhani, ornaments22K, ornaments18K, silver } = req.body || {};

      const existingRates = await database.select().from(rates).limit(1);

      let result;
      if (existingRates.length > 0) {
        result = await database.update(rates)
          .set({
            vedhani,
            ornaments22k: ornaments22K,
            ornaments18k: ornaments18K,
            silver,
            updatedAt: new Date(),
          })
          .where(eq(rates.id, existingRates[0].id))
          .returning();
      } else {
        result = await database.insert(rates)
          .values({
            vedhani,
            ornaments22k: ornaments22K,
            ornaments18k: ornaments18K,
            silver,
          })
          .returning();
      }

      res.setHeader('Content-Type', 'application/json');
      return res.status(200).end(JSON.stringify(result[0]));
    }

    res.setHeader('Allow', 'GET, PUT');
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).end(JSON.stringify({ error: 'Method Not Allowed' }));
  } catch (error) {
    console.error('Error in /api/rates:', error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).end(JSON.stringify({ error: 'Failed to process request' }));
  }
};
