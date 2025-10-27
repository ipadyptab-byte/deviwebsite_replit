const API_BASE_URL = '';

export const ratesAPI = {
  async getRates() {
    // Prefer reading from our Vercel DB first
    try {
      const resDb = await fetch(`${API_BASE_URL}/api/rates`, {
        headers: { Accept: 'application/json' },
      });
      if (resDb.ok) {
        const rawDb = await resDb.json();
        return normalizeRates(rawDb);
      }
    } catch {
      // ignore and try next
    }

    // Then try backend proxy from external API
    try {
      const resLive = await fetch(`${API_BASE_URL}/api/rates/live`, {
        headers: { Accept: 'application/json' },
      });
      if (resLive.ok) {
        const rawLive = await resLive.json();
        return normalizeRates(rawLive);
      }
    } catch {
      // ignore and try fallback
    }

    // Fallback: fetch external via a CORS-friendly wrapper for local development
    const externalUrl = encodeURIComponent('https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php');
    const corsWrapper = `https://api.allorigins.win/get?url=${externalUrl}`;

    const response = await fetch(corsWrapper, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch rates (fallback)');
    }

    const wrapped = await response.json(); // { contents: string, status: { ... } }
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
  return {
    vedhani: raw.vedhani ?? raw['24K Gold'] ?? '',
    ornaments22k: raw.ornaments22k ?? raw.ornaments22K ?? raw['22K Gold'] ?? '',
    ornaments18k: raw.ornaments18k ?? raw.ornaments18K ?? raw['18K Gold'] ?? '',
    silver: raw.silver ?? raw['Silver'] ?? '',
  };
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
