import axios from 'axios';

// VITE_API_URL should be the BASE server URL (no trailing /api).
// In dev, leave it empty — Vite proxies /api → localhost:3001.
// In prod, set VITE_API_URL=https://your-backend.onrender.com
const BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') // strip accidental /api suffix
  : '';

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
