/**
 * Vercel Serverless Function: Diagnostics for DB connectivity
 * GET /api/rates/diagnostics
 *
 * Checks:
 * - Target Neon (DATABASE_URL) connectivity
 * - Remote Postgres (REMOTE_DATABASE_URL) connectivity with ssl disabled
 */
const { Pool } = require('pg');

function parsePgUrl(raw) {
  const u = new URL(raw);
  const [user, password] = (u.username || u.password)
    ? [decodeURIComponent(u.username), decodeURIComponent(u.password)]
    : [undefined, undefined];
  const database = u.pathname.replace(/^\//, '') || undefined;
  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 5432,
    user,
    password,
    database,
  };
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const out = {
    env: {
      has_DATABASE_URL: !!process.env.DATABASE_URL,
      has_REMOTE_DATABASE_URL: !!process.env.REMOTE_DATABASE_URL,
      PGSSLMODE: process.env.PGSSLMODE || null,
    },
    target: null,
    remote: null,
  };

  // Test target Neon
  if (process.env.DATABASE_URL) {
    let pool;
    try {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      });
      const r = await pool.query('SELECT NOW() AS now');
      out.target = { ok: true, now: r.rows?.[0]?.now?.toString?.() || null };
    } catch (err) {
      out.target = { ok: false, error: String(err) };
    } finally {
      if (pool) try { await pool.end(); } catch {}
    }
  } else {
    out.target = { ok: false, error: 'DATABASE_URL not set' };
  }

  // Test remote Postgres with ssl disabled
  if (process.env.REMOTE_DATABASE_URL) {
    let pool;
    try {
      const cfg = parsePgUrl(process.env.REMOTE_DATABASE_URL);
      pool = new Pool({ ...cfg, ssl: false });
      const r = await pool.query('SELECT 1 AS one');
      out.remote = { ok: true, one: r.rows?.[0]?.one || null };
    } catch (err) {
      out.remote = { ok: false, error: String(err) };
    } finally {
      if (pool) try { await pool.end(); } catch {}
    }
  } else {
    out.remote = { ok: false, error: 'REMOTE_DATABASE_URL not set' };
  }

  return res.status(200).json(out);
};