const API_BASE_URL = '';

export const ratesAPI = {
  async getRates() {
    const response = await fetch(`${API_BASE_URL}/api/rates/live`, {
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch rates');
    }
    const raw = await response.json();
    // Normalize keys for CurrentRates component expectations
    return {
      vedhani: raw.vedhani ?? raw['24K Gold'] ?? '',
      ornaments22k: raw.ornaments22k ?? raw.ornaments22K ?? raw['22K Gold'] ?? '',
      ornaments18k: raw.ornaments18k ?? raw.ornaments18K ?? raw['18K Gold'] ?? '',
      silver: raw.silver ?? raw['Silver'] ?? '',
    };
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
