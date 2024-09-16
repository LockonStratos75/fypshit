// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Import from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './styles/App.css'; // Import global styles

// Create a root element using createRoot
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
