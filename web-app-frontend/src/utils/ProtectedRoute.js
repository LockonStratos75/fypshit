// src/utils/ProtectedRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, roles }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    toast.error('You need to log in to access this page.');
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      // Token expired
      localStorage.removeItem('token');
      toast.error('Session expired. Please log in again.');
      return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(decoded.role)) {
      // User does not have the required role
      toast.error('You do not have permission to access this page.');
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (error) {
    console.error('Error decoding token:', error);
    toast.error('Invalid token. Please log in again.');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
