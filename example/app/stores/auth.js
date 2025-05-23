import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    currentUser: (state) => state.user
  },
  
  actions: {
    async login(email, password) {
      this.loading = true;
      
      try {
        const { $config } = useRuntimeConfig();
        const response = await fetch(`${$config.public.apiUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }
        
        this.token = data.token;
        this.user = data.user;
        
        // Save token to localStorage
        localStorage.setItem('auth_token', data.token);
        
        return data;
      } finally {
        this.loading = false;
      }
    },
    
    async register(userData) {
      this.loading = true;
      
      try {
        const { $config } = useRuntimeConfig();
        const response = await fetch(`${$config.public.apiUrl}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }
        
        return data;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchUser() {
      if (!this.token) {
        // Try to get token from localStorage
        const token = localStorage.getItem('auth_token');
        if (!token) return null;
        this.token = token;
      }
      
      this.loading = true;
      
      try {
        const { $config } = useRuntimeConfig();
        const response = await fetch(`${$config.public.apiUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });
        
        if (!response.ok) {
          this.logout();
          return null;
        }
        
        const data = await response.json();
        this.user = data.user;
        
        return this.user;
      } finally {
        this.loading = false;
      }
    },
    
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('auth_token');
    }
  }
}); 