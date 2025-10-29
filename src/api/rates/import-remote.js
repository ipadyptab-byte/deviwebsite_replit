import fetch from "node-fetch";
import { Pool } from "pg";

const dbUrl = "postgresql://neondb_owner:npg_p9MsbmIFeEq6@ep-ancient-sky-adb87hwt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  try {
    // Step 1: Fetch data from API
    const response = await fetch("https://www.devi-jewellers.com/api/rates/live");
    const data = await response.json();

    // Step 2: Prepare SQL insert
    const {
      vedhani,
      ornaments22K,
      ornaments18K,
      silver,
      updatedAt,
      source
    } = data;

    // Step 3: Insert into gold_rates
    const query = `
      INSERT INTO gold_rates (
        gold_24k_sale,
        gold_22k_sale,
        gold_18k_sale,
        silver_per_kg_sale,
        source,
        created_date,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, true)
    `;

    await pool.query(query, [
      vedhani,
      ornaments22K,
      ornaments18K,
      silver * 1000, // converting per gram to per kg
      source + "_api",
      updatedAt,
    ]);

    res.status(200).json({ success: true, message: "Inserted successfully", data });
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await pool.end();
  }
}
