/**
 * Vercel Serverless Function: Images listing and insert
 * - GET /api/images => list all images (ordered by uploadedAt desc)
 * - POST /api/images => insert one image
 */
const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { desc } = require('drizzle-orm');

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
  try {
    const database = getDb();

    if (req.method === 'GET') {
      const allImages = await database.select().from(images).orderBy(desc(images.uploadedAt));
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).end(JSON.stringify(allImages));
    }

    if (req.method === 'POST') {
      const { fileName, downloadUrl, url, category } = req.body || {};
      const imageUrl = url || downloadUrl;

      const result = await database.insert(images)
        .values({
          fileName: fileName || null,
          url: imageUrl,
          category: category || null,
        })
        .returning();

      res.setHeader('Content-Type', 'application/json');
      return res.status(200).end(JSON.stringify(result[0]));
    }

    res.setHeader('Allow', 'GET, POST');
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).end(JSON.stringify({ error: 'Method Not Allowed' }));
  } catch (error) {
    console.error('Error in /api/images:', error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).end(JSON.stringify({ error: 'Failed to process images request' }));
  }
};