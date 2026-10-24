import { defineStore } from 'pinia';
import { apiRequest } from '../services/api';

const TOKEN_KEY = 'sigca.auth.token';

export const useAuthStore = defineStore('auth', {
  state: () => ({ token: localStorage.getItem(TOKEN_KEY) || '', user: null, checking: false }),
  actions: {
    async login(email, password) {
      const data = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem(TOKEN_KEY, data.token);
      return data.user;
    },
    async loadCurrentUser() {
      if (!this.token) return null;
      if (this.checking) return this.user;
      this.checking = true;
      try {
        const data = await apiRequest('/auth/me', { token: this.token });
        this.user = data.user;
        return this.user;
      } catch {
        this.logout();
        return null;
      } finally {
        this.checking = false;
      }
    },
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem(TOKEN_KEY);
    },
  },
});
