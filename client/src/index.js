import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

import axios from 'axios';

axios.defaults.baseURL = 'https://astro-celestique.onrender.com';
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('astro_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);