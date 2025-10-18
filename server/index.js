const express = require('express');
const cors = require('cors');
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
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
