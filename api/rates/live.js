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
    const response = await fetch('https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php', {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'Failed to fetch external rates' });
    }

    const raw = await response.json();

    return res.status(200).json({
      vedhani: raw['24K Gold'] ?? '',
      ornaments22K: raw['22K Gold'] ?? '',
      ornaments18K: raw['18K Gold'] ?? '',
      silver: raw['Silver'] ?? '',
      updatedAt: new Date().toISOString(),
      source: 'businessmantra',
    });
  } catch (error) {
    console.error('Error in /api/rates/live:', error);
    return res.status(500).json({ error: 'Failed to fetch live rates' });
  }
}