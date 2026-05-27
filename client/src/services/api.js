import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('invoxaflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('invoxaflow_token');
      localStorage.removeItem('invoxaflow_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ---- Invoices ----
export const invoiceAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getStats: () => api.get('/invoices/stats'),
  getOne: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  downloadPDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  sendEmail: (id) => api.post(`/invoices/${id}/send`),
};

// ---- Payments ----
export const paymentAPI = {
  initPaystack: (data) => api.post('/payments/paystack/initialize', data),
  verifyPaystack: (data) => api.post('/payments/paystack/verify', data),
  initFlutterwave: (data) => api.post('/payments/flutterwave/initialize', data),
  verifyFlutterwave: (data) => api.post('/payments/flutterwave/verify', data),
};

// ---- Users ----
export const userAPI = {
  update: (data) => api.put('/users/update', data),
  changePassword: (data) => api.put('/users/change-password', data),
};

export default api;
