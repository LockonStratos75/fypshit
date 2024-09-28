// src/services/axiosInstance.js

import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Retrieve token from storage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Attach token to headers
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
