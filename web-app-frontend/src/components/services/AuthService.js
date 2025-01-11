// src/components/services/AuthService.js

import axios from 'axios';

const API_BASE_URL = 'http://10.113.67.68:5000'; // Use this format, no localhost here

const api = axios.create({
  baseURL: API_BASE_URL,
});

const PUBLIC_ROUTES = [
  '/admin/auth/login',
  '/admin/auth/register',
  '/psychologist/auth/login',
  '/psychologist/auth/register',
];

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      config.url.endsWith(route) || config.url.includes(route)
    );

    // Only add token for non-public routes
    if (token && !isPublicRoute) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const AuthService = {
  // Modify registration method to explicitly remove Authorization header
  registerPsychologist: (psychologistData) => {
    return api.post('/psychologist/auth/register', psychologistData, {
      headers: {
        'Content-Type': 'application/json',
        // Explicitly remove Authorization header
        'Authorization': undefined
      }
    });
  },

  loginAdmin: (email, password) => {
    return api.post('/admin/auth/login', { email, password }); // No extra URL parts
  },
  loginPsychologist: (email, password) => {
    return api.post('/psychologist/auth/login', { email, password });
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

  changePassword: async (newPassword) => {
    const token = localStorage.getItem('token'); // Assume the user is authenticated and has a token
    return await axios.put(`${API_BASE_URL}/auth/change-password`, { password: newPassword }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};


export default AuthService;
