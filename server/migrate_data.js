// Data migration script: copy data from a source PostgreSQL to a destination Neon PostgreSQL
// Usage: node server/migrate_data.js
//
// You can override the URLs via environment variables:
//   SOURCE_DATABASE_URL
//   DEST_DATABASE_URL
//
// Defaults are taken from the task description.

const { Pool } = require('pg');

const SOURCE_DATABASE_URL =
  process.env.SOURCE_DATABASE_URL ||
  'postgresql://postgres:mangesh1981@103.159.153.24:5432/devitvdisplay';

const DEST_DATABASE_URL =
  process.env.DEST_DATABASE_URL ||
  'postgresql://neondb_owner:npg_p9MsbmIFeEq6@ep-ancient-sky-adb87hwt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

// Helper to create pool with SSL if needed (Neon requires SSL)
function createPool(url) {
  const needsSSL =
    url.includes('sslmode=require') ||
    /neon\.tech/.test(url) ||
    process.env.FORCE_SSL === '1';

  return new Pool({
    connectionString: url,
    ssl: needsSSL ? { rejectUnauthorized: false } : undefined,
  });
}

async function copyRates(src, dest) {
  console.log('Copying rates...');
  const { rows } = await src.query(
    'SELECT vedhani, ornaments22k, ornaments18k, silver, updated_at FROM rates ORDER BY id ASC'
  );

  if (rows.length === 0) {
    console.log('No rates found in source.');
    return;
  }

  // Use a transaction on destination for integrity and speed
  await dest.query('BEGIN');
  try {
    for (const r of rows) {
      // Insert without id to let destination serial generate if present
      await dest.query(
        `INSERT INTO rates (vedhani, ornaments22k, ornaments18k, silver, updated_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          r.vedhani ?? '',
          r.ornaments22k ?? '',
          r.ornaments18k ?? '',
          r.silver ?? '',
          r.updated_at || new Date(),
        ]
      );
    }
    await dest.query('COMMIT');
    console.log(`Copied ${rows.length} rate row(s).`);
  } catch (err) {
    await dest.query('ROLLBACK');
    throw err;
  }
}

async function copyImages(src, dest) {
  console.log('Copying images...');
  // Some source DBs may have slightly different column names; select explicit aliases
  const { rows } = await src.query(
    `SELECT url, category, file_name, uploaded_at FROM images ORDER BY id ASC`
  );

  if (rows.length === 0) {
    console.log('No images found in source.');
    return;
  }

  await dest.query('BEGIN');
  try {
    for (const img of rows) {
      await dest.query(
        `INSERT INTO images (url, category, file_name, uploaded_at)
         VALUES ($1, $2, $3, $4)`,
        [
          img.url,
          img.category || null,
          img.file_name || null,
          img.uploaded_at || new Date(),
        ]
      );
    }
    await dest.query('COMMIT');
    console.log(`Copied ${rows.length} image row(s).`);
  } catch (err) {
    await dest.query('ROLLBACK');
    throw err;
  }
}

async function main() {
  const sourcePool = createPool(SOURCE_DATABASE_URL);
  const destPool = createPool(DEST_DATABASE_URL);

  try {
    console.log('Connecting to source and destination databases...');
    await sourcePool.query('SELECT 1');
    await destPool.query('SELECT 1');
    console.log('Connections OK.');

    // Ensure destination tables exist; if not, create them to match shared/schema.js
    // Minimal schemas based on shared/schema.js
    await destPool.query(`
      CREATE TABLE IF NOT EXISTS rates (
        id SERIAL PRIMARY KEY,
        vedhani TEXT NOT NULL,
        ornaments22k TEXT NOT NULL,
        ornaments18k TEXT NOT NULL,
        silver TEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    await destPool.query(`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        category VARCHAR(100),
        file_name TEXT,
        uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await copyRates(sourcePool, destPool);
    await copyImages(sourcePool, destPool);

    console.log('Data migration completed.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await sourcePool.end();
    await destPool.end();
  }
}

if (require.main === module) {
  main();
}