// src/components/services/AuthService.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.10:5000'; // Adjust if needed

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Define public routes that do not require Authorization header
const PUBLIC_ROUTES = [
  '/admin/auth/login',
  '/psychologist/auth/login',
  '/psychologist/auth/register', // Added register route
];

/**
 * Request Interceptor
 * Adds Authorization header to requests except for public routes
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const isPublicRoute = PUBLIC_ROUTES.some(route => config.url.startsWith(route));
    if (token && !isPublicRoute) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// AuthService functions
const AuthService = {
  // Admin Login
  loginAdmin: (email, password) => {
    return api.post('/admin/auth/login', { email, password });
  },

  // Psychologist Login
  loginPsychologist: (email, password) => {
    return api.post('/psychologist/auth/login', { email, password });
  },

  // Psychologist Registration
  registerPsychologist: (psychologistData) => {
    return api.post('/psychologist/auth/register', psychologistData);
  },

  // Complete Psychologist Profile
  completePsychologistProfile: (formData) => {
    return api.post('/psychologist/profile/complete', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Fetch System Metrics
  getSystemMetrics: () => {
    return api.get('/analytics/system-metrics');
  },

  // Fetch User Behavior Analytics
  getUserBehaviorAnalytics: () => {
    return api.get('/analytics/user-behavior-analytics');
  },

  // Add other auth-related functions as needed
};

export default AuthService;
