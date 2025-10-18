/**
 * Vercel Serverless Function: Live Rates (CommonJS export)
 * Endpoint: GET /api/rates/live
 */

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  try {
    // Use global fetch if available, else fall back to node-fetch
    const doFetch = async (url, options) => {
      if (typeof fetch === 'function') return fetch(url, options);
      const mod = await import('node-fetch');
      return mod.default(url, options);
    };

    const response = await doFetch(
      'https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php',
      { headers: { Accept: 'application/json' } }
    );

    // Handle network or server failure
    if (!response || !response.ok) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(502).end(JSON.stringify({ error: 'Failed to fetch external rates' }));
    }

    // Parse defensively (in case of invalid JSON or wrong content-type)
    let raw;
    const contentType = response.headers?.get?.('content-type') || '';
    if (contentType.includes('application/json')) {
      raw = await response.json();
    } else {
      const text = await response.text();
      try {
        raw = JSON.parse(text);
      } catch {
        res.setHeader('Content-Type', 'application/json');
        return res.status(502).end(
          JSON.stringify({
            error: 'External response was not JSON',
            contentType,
            preview: text.slice(0, 120)
          })
        );
      }
    }

    // Normalize API response for frontend
    const payload = {
      vedhani: raw['24K Gold'] ?? '',
      ornaments22K: raw['22K Gold'] ?? '',
      ornaments18K: raw['18K Gold'] ?? '',
      silver: raw['Silver'] ?? '',
      updatedAt: new Date().toISOString(),
      source: 'businessmantra'
    };

    // Cache headers for edge optimization
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).end(JSON.stringify(payload));
  } catch (error) {
    console.error('Error in /api/rates/live:', error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).end(
      JSON.stringify({
        error: 'Failed to fetch live rates',
        details: String(error)
      })
    );
  }
};
