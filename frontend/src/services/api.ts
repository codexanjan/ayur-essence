import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto attach Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ayur_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Cleanly handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if login itself failed with 401
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('ayur_token');
        localStorage.removeItem('ayur_user');
      }
    }
    return Promise.reject(error);
  }
);
