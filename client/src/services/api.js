import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Add token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('astro_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('astro_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerUser  = (data) => API.post('/auth/register', data);
export const loginUser     = (data) => API.post('/auth/login', data);
export const getMe         = ()     => API.get('/auth/me');
export const updateCurrency = (currency) => API.put('/auth/currency', { currency });

// Astrologers
export const getAstrologers    = (params) => API.get('/astrologers', { params });
export const getAstrologer     = (id)     => API.get(`/astrologers/${id}`);

// Horoscope
export const getHoroscope = (sign, type) => API.get(`/horoscope/${type}/${sign}`);

// Kundli
export const generateKundli = (data) => API.post('/kundli/generate', data);

// Calculators
export const calculate = (type, data) => API.post(`/calculators/${type}`, data);

// Puja
export const getPujas    = ()     => API.get('/puja');
export const bookPuja    = (data) => API.post('/puja/book', data);
export const getMyPujas  = ()     => API.get('/puja/my-bookings');

// Remedies
export const getRemedies  = (params) => API.get('/remedies', { params });
export const getRemedy    = (id)     => API.get(`/remedies/${id}`);

// Chat
export const getChatHistory = (bookingId) => API.get(`/chat/${bookingId}`);

// Payments
export const createOrder   = (data) => API.post('/payments/create-order', data);
export const verifyPayment = (data) => API.post('/payments/verify', data);

export default API;
