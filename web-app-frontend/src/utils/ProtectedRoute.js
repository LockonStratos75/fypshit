import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
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

          if (decoded.exp < currentTime) {
            localStorage.removeItem('token');
            toast.error('Session expired. Please log in again.');
            setIsAuthorized(false);
          } else if (roles && !roles.includes(decoded.role)) {
            toast.error('You do not have permission to access this page.');
            setIsAuthorized(false);
          } else {
            setIsAuthorized(true);
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          setIsAuthorized(false);
        }
      }
    };

    checkAuthorization();
  }, [roles, token]);

  if (isAuthorized === null) return null; // Render nothing until the auth check is complete
  return isAuthorized ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
