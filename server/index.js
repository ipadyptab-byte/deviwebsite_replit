const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { eq, desc } = require('drizzle-orm');
// node-fetch via dynamic import for environments without global fetch
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

app.use(cors());
app.use(express.json());

// Live rates from external provider; normalize to our schema keys
app.get('/api/rates/live', async (req, res) => {
  try {
    const response = await fetch('https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php', {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      return res.status(502).json({ error: 'Failed to fetch external rates' });
    }
    const raw = await response.json();
    res.json({
      vedhani: raw['24K Gold'] ?? '',
      ornaments22K: raw['22K Gold'] ?? '',
      ornaments18K: raw['18K Gold'] ?? '',
      silver: raw['Silver'] ?? '',
      updatedAt: new Date().toISOString(),
      source: 'businessmantra',
    });
  } catch (error) {
    console.error('Error fetching live rates:', error);
    res.status(500).json({ error: 'Failed to fetch live rates' });
  }
});

// Database-backed routes are optional; only register if DATABASE_URL is set
let db = null;
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set. DB-backed routes (/api/rates, /api/images, etc.) will be disabled. Live rates remain available at /api/rates/live.');
} else {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  db = drizzle(pool);

  const { rates, images } = require('../shared/schema.js');

  app.get('/api/rates', async (req, res) => {
    try {
      const allRates = await db.select().from(rates).orderBy(desc(rates.updatedAt)).limit(1);
      if (allRates.length > 0) {
        res.json(allRates[0]);
      } else {
        res.status(404).json({ error: 'No rates found' });
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
      res.status(500).json({ error: 'Failed to fetch rates' });
    }
  });

  app.put('/api/rates', async (req, res) => {
    try {
      const { vedhani, ornaments22K, ornaments18K, silver } = req.body;

      const existingRates = await db.select().from(rates).limit(1);

      let result;
      if (existingRates.length > 0) {
        result = await db.update(rates)
          .set({
            vedhani,
            ornaments22k: ornaments22K,
            ornaments18k: ornaments18K,
            silver,
            updatedAt: new Date(),
          })
          .where(eq(rates.id, existingRates[0].id))
          .returning();
      } else {
        result = await db.insert(rates)
          .values({
            vedhani,
            ornaments22k: ornaments22K,
            ornaments18k: ornaments18K,
            silver,
          })
          .returning();
      }

      res.json(result[0]);
    } catch (error) {
      console.error('Error updating rates:', error);
      res.status(500).json({ error: 'Failed to update rates' });
    }
  });

  // Fetch from external source and persist to DB, return saved row
  app.post('/api/rates/sync', async (req, res) => {
    try {
      const response = await fetch('https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php', {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        return res.status(502).json({ error: 'Failed to fetch external rates' });
      }
      const raw = await response.json();
      const payload = {
        vedhani: raw['24K Gold'] ?? '',
        ornaments22k: raw['22K Gold'] ?? '',
        ornaments18k: raw['18K Gold'] ?? '',
        silver: raw['Silver'] ?? '',
      };

      const existingRates = await db.select().from(rates).limit(1);

      let result;
      if (existingRates.length > 0) {
        result = await db.update(rates)
          .set({ ...payload, updatedAt: new Date() })
          .where(eq(rates.id, existingRates[0].id))
          .returning();
      } else {
        result = await db.insert(rates).values(payload).returning();
      }

      return res.json(result[0]);
    } catch (error) {
      console.error('Error syncing rates from external source:', error);
      return res.status(500).json({ error: 'Failed to sync rates' });
    }
  });

  app.get('/api/images', async (req, res) => {
    try {
      const allImages = await db.select().from(images).orderBy(desc(images.uploadedAt));
      res.json(allImages);
    } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).json({ error: 'Failed to fetch images' });
    }
  });

  app.get('/api/images/latest', async (req, res) => {
    try {
      const latestImages = await db.select().from(images).orderBy(desc(images.uploadedAt)).limit(1);
      if (latestImages.length > 0) {
        res.json(latestImages[0]);
      } else {
        res.status(404).json({ error: 'No images found' });
      }
    } catch (error) {
      console.error('Error fetching latest image:', error);
      res.status(500).json({ error: 'Failed to fetch latest image' });
    }
  });

  
    // Route to trigger Neon REST sync (Businessmantra -> Neon Data API)
  const { syncNeonRest } = require('./fetch-to-neon-rest');
  app.post('/api/rates/sync-rest', async (req, res) => {
    try {
      const inserted = await syncNeonRest();
      res.json({ success: true, row: inserted });
    } catch (err) {
      console.error('sync-rest failed:', err);
      res.status(500).json({ success: false, error: err.message || String(err) });
    }
  });

  // Diagnostics: check Neon REST base and attempt to list rates via REST
  app.get('/api/rates/rest-check', async (req, res) => {
    try {
      const base = process.env.NEON_REST_BASE || 'https://ep-ancient-sky-adb87hwt.apirest.c-2.us-east-1.aws.neon.tech/neondb/rest/v1';
      const token = process.env.NEON_ACCESS_TOKEN || process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || '';
      const headers = { Accept: 'application/json' };
      if (token) headers['X-Stack-Access-Token'] = token;

      const url = `${base}/rates?select=*`;
      const r = await fetch(url, { headers });
      const text = await r.text();
      res.status(r.status).json({ ok: r.ok, status: r.status, statusText: r.statusText, body: tryParseJson(text), url });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message || String(err) });
    }
  });

  function tryParseJson(s) {
    try { return JSON.parse(s); } catch { return s; }
  }

  // Optional Cron-like background sync to Neon REST API (interval in minutes)
  const restIntervalMinutes = Number(process.env.SYNC_REST_INTERVAL_MINUTES || 0);
  if (restIntervalMinutes > 0) {
    const runRestSync = async () => {
      try {
        const inserted = await syncNeonRest();
        console.log('Neon REST sync complete at', new Date().toISOString(), 'row:', inserted && inserted.id ? inserted.id : inserted);
      } catch (err) {
        console.error('Background REST sync failed:', err);
      }
    };
    // Run once at startup, then at interval
    runRestSync().catch(() => {});
    setInterval(runRestSync, Math.max(restIntervalMinutes, 1) * 60_000);
    console.log(`Background REST sync enabled (every ${Math.max(restIntervalMinutes, 1)} minute(s)).`);
  }

  app.get('/api/images/:category', async (req, res) => {
    try {
      const { category } = req.params;
      const categoryImages = await db.select().from(images)
        .where(eq(images.category, category))
        .orderBy(desc(images.uploadedAt));
      res.json(categoryImages);
    } catch (error) {
      console.error('Error fetching images by category:', error);
      res.status(500).json({ error: 'Failed to fetch images by category' });
    }
  });

  app.post('/api/images', async (req, res) => {
    try {
      const { fileName, downloadUrl, url, category } = req.body;
      const imageUrl = url || downloadUrl;

      const result = await db.insert(images)
        .values({
          fileName: fileName || null,
          url: imageUrl,
          category: category || null,
        })
        .returning();
      res.json(result[0]);
    } catch (error) {
      console.error('Error saving image:', error);
      res.status(500).json({ error: 'Failed to save image' });
    }
  });

  // Background sync from remote Postgres (gold_rates -> local rates)
  if (process.env.REMOTE_DATABASE_URL) {
    const remotePool = new Pool({
      connectionString: process.env.REMOTE_DATABASE_URL,
      ssl: false,
    });

    const runRemoteSync = async () => {
      try {
        // Pull latest active gold_rates row from remote
        const { rows } = await remotePool.query(`
          SELECT
            gold_24k_sale           AS vedhani,
            gold_22k_sale           AS ornaments22k,
            gold_18k_sale           AS ornaments18k,
            silver_per_kg_sale      AS silver,
            created_date            AS updated_at
          FROM gold_rates
          WHERE is_active = true
          ORDER BY created_date DESC
          LIMIT 1;
        `);

        if (!rows || rows.length === 0) {
          return;
        }

        const r = rows[0];
        const remotePayload = {
          vedhani: r.vedhani?.toString() ?? '',
          ornaments22k: r.ornaments22k?.toString() ?? '',
          ornaments18k: r.ornaments18k?.toString() ?? '',
          silver: r.silver?.toString() ?? '',
          updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
        };

        const existing = await db.select().from(rates).limit(1);
        const shouldUpdate =
          existing.length === 0 ||
          existing[0].vedhani !== remotePayload.vedhani ||
          existing[0].ornaments22k !== remotePayload.ornaments22k ||
          existing[0].ornaments18k !== remotePayload.ornaments18k ||
          existing[0].silver !== remotePayload.silver;

        if (shouldUpdate) {
          if (existing.length > 0) {
            await db
              .update(rates)
              .set(remotePayload)
              .where(eq(rates.id, existing[0].id))
              .returning();
          } else {
            await db.insert(rates).values(remotePayload).returning();
          }
          console.log('Rates synced from remote at', new Date().toISOString());
        }
      } catch (err) {
        console.error('Background remote sync failed:', err);
      }
    };

    // Run at startup and then every minute
    runRemoteSync().catch(() => {});
    setInterval(runRemoteSync, 60_000);
  } else {
    console.warn('REMOTE_DATABASE_URL not set; background remote sync disabled.');
  }
}

// Serve the React build as static files (single-service deployment)
const buildPath = path.join(__dirname, '..', 'build');
const fs = require('fs');

if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  
  // SPA fallback: send index.html for non-API routes
  app.use((req, res, next) => {
    // If the request is for an API route, let it 404
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Not found' });
    }
    // Serve index.html for all other routes (SPA routing)
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  console.warn('Build directory not found. Run "npm run build" to create the production build.');
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
