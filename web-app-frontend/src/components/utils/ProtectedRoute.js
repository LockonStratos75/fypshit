// src/components/utils/ProtectedRoute.js

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
          } else if (roles && !roles.includes(decoded.userType)) {
            toast.error('You do not have permission to access this page.');
            setIsAuthorized(false);
          } else if (decoded.userType === 'PsychologistProfile') {
            // Check application status
            if (decoded.status === 'pending') {
              toast.info('Your application is pending approval.');
              setIsAuthorized(false); // Redirect to application pending page
            } else if (decoded.status === 'rejected') {
              toast.error('Your application has been rejected.');
              setIsAuthorized(false); // Redirect to profile rejected page
            } else if (decoded.status === 'approved') {
              setIsAuthorized(true);
            } else {
              // Handle other statuses if any
              toast.error('Unknown profile status.');
              setIsAuthorized(false);
            }
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
  return isAuthorized ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
