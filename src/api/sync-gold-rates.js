// sync-gold-rates.js
import pg from "pg";

const localDb = new pg.Pool({
  connectionString: "postgresql://postgres:mangesh1981@localhost:5432/devitvdisplay",
});

const remoteDb = new pg.Pool({
  connectionString:
    "postgresql://neondb_owner:npg_p9MsbmIFeEq6@ep-ancient-sky-adb87hwt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require",
});

async function syncGoldRates() {
  console.log("🔄 Starting sync at", new Date().toISOString());

  try {
    // Fetch latest rows from local DB
    const localData = await localDb.query("SELECT * FROM gold_rates ORDER BY created_date DESC LIMIT 10");

    for (const row of localData.rows) {
      // Upsert (insert or update) into Neon DB
      await remoteDb.query(
        `
        INSERT INTO gold_rates (
          id, gold_24k_sale, gold_24k_purchase, gold_22k_sale, gold_22k_purchase,
          gold_18k_sale, gold_18k_purchase, silver_per_kg_sale, silver_per_kg_purchase,
          is_active, created_date, source
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
        )
        ON CONFLICT (id)
        DO UPDATE SET
          gold_24k_sale = EXCLUDED.gold_24k_sale,
          gold_24k_purchase = EXCLUDED.gold_24k_purchase,
          gold_22k_sale = EXCLUDED.gold_22k_sale,
          gold_22k_purchase = EXCLUDED.gold_22k_purchase,
          gold_18k_sale = EXCLUDED.gold_18k_sale,
          gold_18k_purchase = EXCLUDED.gold_18k_purchase,
          silver_per_kg_sale = EXCLUDED.silver_per_kg_sale,
          silver_per_kg_purchase = EXCLUDED.silver_per_kg_purchase,
          is_active = EXCLUDED.is_active,
          created_date = EXCLUDED.created_date,
          source = 'local_sync';
        `,
        [
          row.id,
          row.gold_24k_sale,
          row.gold_24k_purchase,
          row.gold_22k_sale,
          row.gold_22k_purchase,
          row.gold_18k_sale,
          row.gold_18k_purchase,
          row.silver_per_kg_sale,
          row.silver_per_kg_purchase,
          row.is_active,
          row.created_date,
          "local_sync",
        ]
      );
    }

    console.log(`✅ Synced ${localData.rowCount} rows successfully.`);
  } catch (err) {
    console.error("❌ Sync failed:", err);
  } finally {
    await localDb.end();
    await remoteDb.end();
  }
}

syncGoldRates();
