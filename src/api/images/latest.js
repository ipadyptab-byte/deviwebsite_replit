/**
 * Vercel Serverless Function: Latest Image
 * GET /api/images/latest
 */
const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { desc } = require('drizzle-orm');

// Return drizzle db
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

const { images } = require('../../../shared/schema.js');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  try {
    const database = getDb();
    const latestImages = await database.select().from(images).orderBy(desc(images.uploadedAt)).limit(1);
    if (latestImages.length > 0) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).end(JSON.stringify(latestImages[0]));
    }
    res.setHeader('Content-Type', 'application/json');
    return res.status(404).end(JSON.stringify({ error: 'No images found' }));
  } catch (error) {
    console.error('Error in /api/images/latest:', error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).end(JSON.stringify({ error: 'Failed to fetch latest image' }));
  }
};