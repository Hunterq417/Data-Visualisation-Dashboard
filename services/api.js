const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email, password, name) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async getRecords(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/records${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getRecordsMeta() {
    return this.request('/records/meta');
  }

  getGoogleAuthUrl() {
    return `${API_BASE_URL}/auth/google`;
  }

  async getAnalyticsSummary() {
    return this.request('/analytics/summary');
  }

  async getChartData(type, period = '30d') {
    return this.request(`/analytics/charts/${type}?period=${period}`);
  }

  async getRealtimeStats() {
    return this.request('/analytics/realtime');
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async validateResetToken(token) {
    return this.request(`/auth/validate-reset-token/${token}`);
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }
}

export default new ApiService();
