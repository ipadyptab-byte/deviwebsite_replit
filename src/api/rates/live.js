// live.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async (req, res) => {
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

    const rates = {
      vedhani: raw['24K Gold'] || '',
      ornaments22K: raw['22K Gold'] || '',
      ornaments18K: raw['18K Gold'] || '',
      silver: raw['Silver'] || '',
      updatedAt: new Date().toISOString(),
      source: 'businessmantra',
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json(rates);
  } catch (error) {
    console.error('Error fetching rates:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
