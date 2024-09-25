// src/services/AuthService.js

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL + '/auth'; 

const signup = (username, email, password, role) => {
  return axios.post(`${API_URL}/signup`, { username, email, password, role });
};

const login = (email, password) => {
  return axios.post(`${API_URL}/login`, { email, password });
};

const AuthService = {
  signup,
  login,
};

export default AuthService;
