// src/components/utils/ProtectedRoute.js

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Correct default import
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, roles }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkAuthorization = () => {
      if (!token) {
        toast.error('You need to log in to access this page.');
        setIsAuthorized(false);
      } else {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          // Check if token is expired
          if (decoded.exp < currentTime) {
            localStorage.removeItem('token');
            toast.error('Session expired. Please log in again.');
            setIsAuthorized(false);
          } else {
            // Check for required roles
            if (roles && !roles.includes(decoded.userType)) {
              toast.error('You do not have permission to access this page.');
              setIsAuthorized(false);
            }  else {
                // For AdminProfile or other roles
                setIsAuthorized(true);
              }
            }
          }
           catch (error) {
          console.error('Error decoding token:', error);
          toast.error('Invalid authentication token.');
          setIsAuthorized(false);
        }
      }
    };

    checkAuthorization();
  }, [roles, token]);

  if (isAuthorized === null) return null; // Optionally, show a loading indicator here

  // Determine redirection based on userType and status
  if (isAuthorized) {
    return children;
  } else {
    // Redirect based on userType and status if needed
    // For simplicity, redirect to home
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
