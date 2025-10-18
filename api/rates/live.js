/**
 * Vercel Serverless Function: Live Rates
 * GET /api/rates/live
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
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
      return res.status(502).json({ error: 'Failed to fetch external rates' });
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
        return res.status(502).json({ error: 'External response was not JSON', contentType: ct, preview: text.slice(0, 120) });
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
    return res.status(200).json(payload);
  } catch (error) {
    console.error('Error in /api/rates/live:', error);
    return res.status(500).json({ error: 'Failed to fetch live rates', details: String(error) });
  }
}