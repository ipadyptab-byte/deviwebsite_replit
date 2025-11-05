const API_BASE_URL = '';

export const ratesAPI = {
  async getRates() {
    // Race both DB and live endpoints to get fastest response
    const promises = [];

    // 1) Try DB-backed endpoint (cached, faster if available)
    promises.push(
      fetch(`${API_BASE_URL}/api/rates`, { headers: { Accept: 'application/json' } })
        .then(res => res.ok ? res.json().then(r => ({ source: 'db', data: r })) : null)
        .catch(() => null)
    );

    // 2) Try live proxy (real-time, fallback option)
    promises.push(
      fetch(`${API_BASE_URL}/api/rates/live`, { headers: { Accept: 'application/json' } })
        .then(res => res.ok ? res.json().then(r => ({ source: 'live', data: r })) : null)
        .catch(() => null)
    );

    try {
      const results = await Promise.allSettled(promises);

      // Use first successful result
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          return normalizeRates(result.value.data);
        }
      }
    } catch {
      // Continue to fallback
    }

    // 3) Fallback: fetch external via CORS wrapper for local development
    const externalUrl = encodeURIComponent('https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php');
    const corsWrapper = `https://api.allorigins.win/get?url=${externalUrl}`;

    const response = await fetch(corsWrapper, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch rates (fallback)');
    }

    const wrapped = await response.json();
    let raw;
    try {
      raw = JSON.parse(wrapped.contents);
    } catch {
      throw new Error('Fallback response was not valid JSON');
    }

    return normalizeRates(raw);
  },

  async updateRates(rates) {
    const response = await fetch(`${API_BASE_URL}/api/rates`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rates),
    });
    if (!response.ok) {
      throw new Error('Failed to update rates');
    }
    return response.json();
  },
};

function normalizeRates(raw) {
  // Prefer DB/server fields when available, else map external
  const vedhani = raw.vedhani ?? raw['24K Gold'] ?? '';
  const ornaments22k = raw.ornaments22k ?? raw.ornaments22K ?? raw['22K Gold'] ?? '';
  const ornaments18k = raw.ornaments18k ?? raw.ornaments18K ?? raw['18K Gold'] ?? '';
  const silver = raw.silver ?? raw['Silver'] ?? '';
  const updatedAt = raw.updatedAt ?? raw.updated_at ?? new Date().toISOString();
  const source = raw.source ?? 'unknown';

  return { vedhani, ornaments22k, ornaments18k, silver, updatedAt, source };
}

export const imagesAPI = {
  async getAllImages() {
    const response = await fetch(`${API_BASE_URL}/api/images`);
    if (!response.ok) {
      throw new Error('Failed to fetch images');
    }
    return response.json();
  },

  async getLatestImage() {
    const response = await fetch(`${API_BASE_URL}/api/images/latest`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch latest image');
    }
    return response.json();
  },

  async getImagesByCategory(category) {
    const response = await fetch(`${API_BASE_URL}/api/images/${category}`);
    if (!response.ok) {
      throw new Error('Failed to fetch images by category');
    }
    return response.json();
  },

  async saveImage(fileName, downloadUrl, category = null) {
    const response = await fetch(`${API_BASE_URL}/api/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileName, url: downloadUrl, category }),
    });
    if (!response.ok) {
      throw new Error('Failed to save image');
    }
    return response.json();
  },
};
