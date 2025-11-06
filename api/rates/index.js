const { Pool } = require('pg');

const DB_URL = process.env.DATABASE_URL;

function getPool() {
  if (!DB_URL) {
    throw new Error('DATABASE_URL is not set. Configure it in Vercel project settings.');
  }
  return new Pool({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
  });
}

module.exports = async (req, res) => {
  const pool = getPool();
  try {
    const { rows } = await pool.query('SELECT * FROM rates ORDER BY updated_at DESC LIMIT 1');
    res.setHeader('Content-Type', 'application/json');
    if (rows.length === 0) {
      return res.status(404).end(JSON.stringify({ error: 'No rates found' }));
    }
    return res.status(200).end(JSON.stringify(rows[0]));
  } catch (err) {
    console.error('Error reading rates:', err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).end(JSON.stringify({ error: err.message }));
  } finally {
    try { await pool.end(); } catch (_) {}
  }
};