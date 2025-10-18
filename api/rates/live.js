/**
 * Vercel Serverless Function: Live Rates
 * GET /api/rates/live
 */
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  try {
    // Use global fetch if available; otherwise fall back to node-fetch
    const doFetch = async (url, options) => {
      if (typeof fetch === 'function') {
        return fetch(url, options);
      }
      const mod = await import('node-fetch');
      return mod.default(url, options);
    };

    const response = await doFetch('https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php', {
      headers: { Accept: 'application/json' },
    });

    if (!response || !response.ok) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(502).end(JSON.stringify({ error: 'Failed to fetch external rates' }));
    }

    // Some providers may send JSON with incorrect content-type; parse defensively
    let raw;
    const ct = response.headers?.get?.('content-type') || '';
    if (ct.includes('application/json')) {
      raw = await response.json();
    } else {
      const text = await response.text();
      try {
        raw = JSON.parse(text);
      } catch {
        res.setHeader('Content-Type', 'application/json');
        return res
          .status(502)
          .end(JSON.stringify({ error: 'External response was not JSON', contentType: ct, preview: text.slice(0, 120) }));
      }
    }

    const payload = {
      vedhani: raw['24K Gold'] ?? '',
      ornaments22K: raw['22K Gold'] ?? '',
      ornaments18K: raw['18K Gold'] ?? '',
      silver: raw['Silver'] ?? '',
      updatedAt: new Date().toISOString(),
      source: 'businessmantra',
    };

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate'); // cache at edge for 5 min
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).end(JSON.stringify(payload));
  } catch (error) {
    console.error('Error in /api/rates/live:', error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).end(JSON.stringify({ error: 'Failed to fetch live rates', details: String(error) }));
  }
};