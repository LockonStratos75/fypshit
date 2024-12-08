// src/components/Flash.js

import React from 'react';
import { Alert } from '@mui/material';

const Flash = ({ message, setMessage }) => {
  if (!message) return null;

  return (
    <Alert
      severity="error"
      onClose={() => setMessage('')}
      style={{ position: 'absolute', top: '10px', width: '100%' }}
    >
      {message}
    </Alert>
  );
};

export default Flash;
