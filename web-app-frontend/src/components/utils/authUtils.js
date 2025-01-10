// src/utils/authUtils.js

import {jwtDecode} from 'jwt-decode';

export const getUserInfo = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    // Adjust the key based on your token's payload structure
    return {
      userType: decoded.userType, // e.g., 'AdminProfile' or 'PsychologistProfile'
      username: decoded.username, // Adjust if your token uses a different key for the username
      email: decoded.email,
      // Add other fields as necessary
    };  
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
};
