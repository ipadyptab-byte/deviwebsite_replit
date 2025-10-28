/**
 * Import the latest row from remote public.gold_rates into Vercel (Neon) Postgres
 */
const { Pool } = require("pg");
const { drizzle } = require("drizzle-orm/node-postgres");
const { eq } = require("drizzle-orm");

// NOTE: serverless functions are under src/api/... so we need to go up three levels to project root
const { rates } = require("../../../shared/schema.js");

let target = null;
function getTarget() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL must be set");
  if (!target) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    target = { db: drizzle(pool), pool };
  }
  return target;
}

async function ensureRatesTable(pool) {
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

function getRemoteClient() {
  const remoteUrl = process.env.REMOTE_DATABASE_URL;
  if (!remoteUrl) throw new Error("REMOTE_DATABASE_URL must be set");
  return new Pool({
    connectionString: remoteUrl,
    ssl: false,
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let remotePool;
  try {
    const { db, pool } = getTarget();
    await ensureRatesTable(pool);

    remotePool = getRemoteClient();

    const { rows } = await remotePool.query(`
      SELECT
        gold_24k_sale  AS vedhani,
        gold_22k_sale  AS ornaments22k,
        gold_18k_sale  AS ornaments18k,
        silver_per_kg_sale AS silver,
        created_date   AS updated_at
      FROM gold_rates
      WHERE is_active = true
      ORDER BY created_date DESC
      LIMIT 1;
    `);

    if (!rows || rows.length === 0)
      return res.status(404).json({ error: "No active gold_rates rows found" });

    const r = rows[0];
    const payload = {
      vedhani: r.vedhani?.toString() ?? "",
      ornaments22k: r.ornaments22k?.toString() ?? "",
      ornaments18k: r.ornaments18k?.toString() ?? "",
      silver: r.silver?.toString() ?? "",
      updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
    };

    const existing = await db.select().from(rates).limit(1);
    let result;
    if (existing.length > 0) {
      result = await db
        .update(rates)
        .set(payload)
        .where(eq(rates.id, existing[0].id))
        .returning();
    } else {
      result = await db.insert(rates).values(payload).returning();
    }

    return res.status(200).json({ status: "ok", imported: result[0] });
  } catch (err) {
    console.error("import-remote error:", err);
    return res.status(500).json({
      error: "Failed to import from remote DB",
      details: String(err),
    });
  } finally {
    if (remotePool) await remotePool.end().catch(() => {});
  }
};
