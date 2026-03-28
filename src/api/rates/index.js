const { Pool } = require('pg');

const DB_URL = process.env.DATABASE_URL;

function getPool() {
  if (!DB_URL) {
    throw new Error('DATABASE_URL is not set. Configure it in your deployment environment.');
  }
  return new Pool({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
  });
}

async function ensureTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rates (
      id SERIAL PRIMARY KEY,
      vedhani TEXT NOT NULL,
      ornaments22k TEXT NOT NULL,
      ornaments18k TEXT NOT NULL,
      silver TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

async function fetchLiveRates() {
  const doFetch = async (url, options) => {
    if (typeof fetch === 'function') {
      return fetch(url, options);
    }
    const mod = await import('node-fetch');
    return mod.default(url, options);
  };

  const res = await doFetch('https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php', {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch live rates: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('Live rates response was not valid JSON');
  }

  return {
    vedhani: (raw['24K Gold'] ?? '').toString(),
    ornaments22k: (raw['22K Gold'] ?? '').toString(),
    ornaments18k: (raw['18K Gold'] ?? '').toString(),
    silver: (raw['Silver'] ?? '').toString(),
  };
}

function shapeRow(row) {
  if (!row) return null;
  return {
    vedhani: row.vedhani ?? '',
    ornaments22K: row.ornaments22k ?? '',
    ornaments18K: row.ornaments18k ?? '',
    silver: row.silver ?? '',
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : '',
  };
}

function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) return JSON.parse(req.body);
  return {};
}

module.exports = async (req, res) => {
  const pool = getPool();
  try {
    if (req.method !== 'GET' && req.method !== 'PUT') {
      res.setHeader('Allow', 'GET, PUT');
      res.setHeader('Content-Type', 'application/json');
      return res.status(405).end(JSON.stringify({ error: 'Method Not Allowed' }));
    }

    await ensureTable(pool);

    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM rates ORDER BY updated_at DESC LIMIT 1;');
      if (!rows || rows.length === 0) {
        const payload = await fetchLiveRates();
        await pool.query(
          `
          INSERT INTO rates (vedhani, ornaments22k, ornaments18k, silver)
          VALUES ($1, $2, $3, $4);
          `,
          [payload.vedhani, payload.ornaments22k, payload.ornaments18k, payload.silver]
        );
        const inserted = await pool.query('SELECT * FROM rates ORDER BY updated_at DESC LIMIT 1;');
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).end(JSON.stringify(shapeRow(inserted.rows[0])));
      }
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).end(JSON.stringify(shapeRow(rows[0])));
    }

    const body = parseJsonBody(req);
    const vedhani = (body.vedhani ?? '').toString();
    const ornaments22K = (body.ornaments22K ?? body.ornaments22k ?? '').toString();
    const ornaments18K = (body.ornaments18K ?? body.ornaments18k ?? '').toString();
    const silver = (body.silver ?? '').toString();

    const { rows: existing } = await pool.query('SELECT id FROM rates LIMIT 1;');
    if (existing.length > 0) {
      await pool.query(
        `
        UPDATE rates
        SET vedhani = $1,
            ornaments22k = $2,
            ornaments18k = $3,
            silver = $4,
            updated_at = NOW()
        WHERE id = $5;
        `,
        [vedhani, ornaments22K, ornaments18K, silver, existing[0].id]
      );
    } else {
      await pool.query(
        `
        INSERT INTO rates (vedhani, ornaments22k, ornaments18k, silver)
        VALUES ($1, $2, $3, $4);
        `,
        [vedhani, ornaments22K, ornaments18K, silver]
      );
    }

    const { rows } = await pool.query('SELECT * FROM rates ORDER BY updated_at DESC LIMIT 1;');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).end(JSON.stringify(shapeRow(rows[0])));
  } catch (err) {
    console.error('Error in /api/rates:', err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).end(JSON.stringify({ error: err.message || String(err) }));
  } finally {
    try { await pool.end(); } catch (_) {}
  }
};
