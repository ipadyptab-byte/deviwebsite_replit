require('dotenv').config();

const { Pool } = require('pg');

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_p9MsbmIFeEq6@ep-ancient-sky-adb87hwt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function main() {
  const pool = new Pool({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const { rows } = await pool.query(`
      SELECT id, vedhani, ornaments22k, ornaments18k, silver, updated_at
      FROM rates
      ORDER BY updated_at DESC
      LIMIT 1;
    `);

    if (rows.length === 0) {
      console.log('No rows found in rates table.');
    } else {
      console.log('Latest rates row:');
      console.table(rows);
    }
  } catch (err) {
    console.error('Check failed:', err);
    process.exitCode = 1;
  } finally {
    try { await pool.end(); } catch (_) {}
  }
}

main();