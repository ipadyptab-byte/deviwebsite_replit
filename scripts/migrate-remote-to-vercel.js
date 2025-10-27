// One-off migration script: copy latest 'rates' row from a remote Postgres into Vercel Postgres.
// Usage:
//   REMOTE_DATABASE_URL="postgres://user:pass@host:5432/db" \
//   DATABASE_URL="postgres://vercel-user:pass@vercel-host/db" \
//   node scripts/migrate-remote-to-vercel.js
//
// This script can be run locally or in any Node 18+ environment.

const { Pool } = require('pg');

async function main() {
  const remoteUrl = process.env.REMOTE_DATABASE_URL;
  const targetUrl = process.env.DATABASE_URL;

  if (!remoteUrl) {
    throw new Error('REMOTE_DATABASE_URL is not set');
  }
  if (!targetUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const remote = new Pool({ connectionString: remoteUrl, ssl: false });
  const target = new Pool({ connectionString: targetUrl, ssl: { rejectUnauthorized: false } });

  try {
    console.log('Fetching latest row from remote.rates...');
    const { rows } = await remote.query(
      `SELECT vedhani, ornaments22k, ornaments18k, silver, updated_at
       FROM rates
       ORDER BY updated_at DESC
       LIMIT 1`
    );
    if (!rows || rows.length === 0) {
      throw new Error('No rows found in remote.rates');
    }

    const latest = rows[0];
    console.log('Latest remote row:', latest);

    console.log('Ensuring target tables exist...');
    await target.query(`
      CREATE TABLE IF NOT EXISTS rates (
        id SERIAL PRIMARY KEY,
        vedhani TEXT NOT NULL,
        ornaments22k TEXT NOT NULL,
        ornaments18k TEXT NOT NULL,
        silver TEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log('Upserting into target.rates...');
    // Simple strategy: keep a single row. If exists, update; else insert.
    const existing = await target.query('SELECT id FROM rates LIMIT 1');
    if (existing.rows.length > 0) {
      const id = existing.rows[0].id;
      const result = await target.query(
        `UPDATE rates
         SET vedhani = $1,
             ornaments22k = $2,
             ornaments18k = $3,
             silver = $4,
             updated_at = COALESCE($5, NOW())
         WHERE id = $6
         RETURNING *`,
        [
          latest.vedhani ?? '',
          latest.ornaments22k ?? '',
          latest.ornaments18k ?? '',
          latest.silver ?? '',
          latest.updated_at ?? null,
          id,
        ]
      );
      console.log('Updated row:', result.rows[0]);
    } else {
      const result = await target.query(
        `INSERT INTO rates (vedhani, ornaments22k, ornaments18k, silver, updated_at)
         VALUES ($1, $2, $3, $4, COALESCE($5, NOW()))
         RETURNING *`,
        [
          latest.vedhani ?? '',
          latest.ornaments22k ?? '',
          latest.ornaments18k ?? '',
          latest.silver ?? '',
          latest.updated_at ?? null,
        ]
      );
      console.log('Inserted row:', result.rows[0]);
    }

    console.log('Done.');
  } finally {
    await Promise.allSettled([remote.end(), target.end()]);
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});