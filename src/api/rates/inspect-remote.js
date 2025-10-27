/**
 * Vercel Serverless Function: Inspect remote Postgres 'rates' table
 * GET /api/rates/inspect-remote
 *
 * Returns: up to 3 rows and the list of column names so we can see what to map.
 *
 * Env:
 * - REMOTE_DATABASE_URL (required)
 */
const { Pool } = require('pg');

function getRemoteClient() {
  const remoteUrl = process.env.REMOTE_DATABASE_URL;
  if (!remoteUrl) {
    throw new Error('REMOTE_DATABASE_URL must be set to inspect remote DB');
  }
  return new Pool({
    connectionString: remoteUrl,
    ssl: false,
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  let pool;
  try {
    pool = getRemoteClient();

    // Get column names
    const cols = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'rates'
      ORDER BY ordinal_position
    `);

    // Sample data
    const sample = await pool.query(`SELECT * FROM rates ORDER BY 1 DESC LIMIT 3`);

    res.setHeader('Content-Type', 'application/json');
    return res
      .status(200)
      .end(JSON.stringify({ columns: cols.rows.map(r => r.column_name), rows: sample.rows }));
  } catch (error) {
    console.error('inspect-remote error:', error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).end(JSON.stringify({ error: 'Failed to inspect remote', details: String(error) }));
  } finally {
    if (pool) {
      try { await pool.end(); } catch (_) {}
    }
  }
};