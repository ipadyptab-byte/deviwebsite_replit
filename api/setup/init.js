/**
 * Vercel Serverless Function: Initialize Database Tables
 * GET /api/setup/init
 * Creates required tables if they do not exist.
 */
import { Client } from 'pg';

const createTablesSQL = `
CREATE TABLE IF NOT EXISTS rates (
  id SERIAL PRIMARY KEY,
  vedhani TEXT NOT NULL,
  ornaments22k TEXT NOT NULL,
  ornaments18k TEXT NOT NULL,
  silver TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  category VARCHAR(100),
  file_name TEXT,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return res.status(500).json({ error: 'DATABASE_URL is not set' });
  }

  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();
    await client.query(createTablesSQL);
    return res.status(200).json({ status: 'ok', message: 'Tables ensured (created if missing).' });
  } catch (error) {
    console.error('DB init error:', error);
    return res.status(500).json({ error: 'Failed to initialize tables', details: String(error) });
  } finally {
    try { await client.end(); } catch (_) {}
  }
}