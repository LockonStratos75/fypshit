// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../services/api';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        setAuthToken(response.data.token);
        navigate('/dashboard'); // Redirect to dashboard upon successful login
      } else {
        throw new Error('Login failed: No token received'); // Throw error if token is missing
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // If the server responds with a 401 error, credentials are incorrect
        throw new Error('Incorrect login credentials');
      } else {
        throw new Error('Login failed, please try again later'); // Generic error for other issues
      }
    }
  };

  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      setAuthToken(response.data.token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setAuthToken(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
