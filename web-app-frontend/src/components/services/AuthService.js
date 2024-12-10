// src/components/services/AuthService.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.10:5000'; // Adjust if needed

// Admin login endpoint: POST /api/admin/auth/login
const loginAdmin = (email, password) => {
  return axios.post(`${API_BASE_URL}/api/admin/auth/login`, { email, password });
};

// Psychologist login endpoint: POST /api/psychologist/auth/login
const loginPsychologist = (email, password) => {
  return axios.post(`${API_BASE_URL}/api/psychologist/auth/login`, { email, password });
};

const AuthService = {
  loginAdmin,
  loginPsychologist,
};

export default AuthService;
