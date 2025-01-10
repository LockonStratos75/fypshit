// src/components/services/ApiService.js

import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.9:5000'; // Adjust if needed

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
