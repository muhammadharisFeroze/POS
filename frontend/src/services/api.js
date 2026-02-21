import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global loading state management
let loadingCallbacks = { show: null, hide: null };

export const setLoadingCallbacks = (show, hide) => {
  loadingCallbacks.show = show;
  loadingCallbacks.hide = hide;
};

// Request interceptor to add auth token and show loader
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Show loading
    if (loadingCallbacks.show) {
      loadingCallbacks.show();
    }
    
    return config;
  },
  (error) => {
    // Hide loading on error
    if (loadingCallbacks.hide) {
      loadingCallbacks.hide();
    }
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and hide loader
api.interceptors.response.use(
  (response) => {
    // Hide loading on success
    if (loadingCallbacks.hide) {
      loadingCallbacks.hide();
    }
    return response;
  },
  (error) => {
    // Hide loading on error
    if (loadingCallbacks.hide) {
      loadingCallbacks.hide();
    }
    
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
};

// Product APIs
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  search: (query) => api.get('/products/search', { params: { q: query } }),
};

// Sales APIs
export const salesAPI = {
  create: (data) => api.post('/sales', data),
  getAll: (params) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
  getDashboard: () => api.get('/sales/dashboard'),
  getDailyReport: (params) => api.get('/sales/reports/daily', { params }),
  getProductWiseReport: (params) => api.get('/sales/reports/product-wise', { params }),
  getUserWiseReport: (params) => api.get('/sales/reports/user-wise', { params }),
  getTaxReport: (params) => api.get('/sales/reports/tax', { params }),
};

// User APIs
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  changePassword: (id, newPassword) => api.patch(`/users/${id}/password`, { newPassword }),
};

// Discount APIs
export const discountAPI = {
  getAll: (params) => api.get('/discounts', { params }),
  getById: (id) => api.get(`/discounts/${id}`),
  create: (data) => api.post('/discounts', data),
  update: (id, data) => api.put(`/discounts/${id}`, data),
  delete: (id) => api.delete(`/discounts/${id}`),
  getActiveDiscounts: (date) => api.get('/discounts/active/list', { params: { date } }),
  getProductDiscount: (productId, date) => api.get(`/discounts/product/${productId}`, { params: { date } }),
};

export default api;
