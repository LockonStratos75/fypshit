// src/services/AuthService.js

import axiosInstance from './axiosInstance';

const API_URL = '/auth'; 

const signup = (username, email, password, role) => {
  return axiosInstance.post(`${API_URL}/signup`, { username, email, password, role });
};

const login = (email, password) => {
  return axiosInstance.post(`${API_URL}/login`, { email, password });
};

const AuthService = {
  signup,
  login,
};

export default AuthService;
