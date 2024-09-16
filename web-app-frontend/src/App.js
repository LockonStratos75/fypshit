// frontend/src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SignupTherapist from './pages/SignupTherapist';
import Dashboard from './pages/Dashboard';
import ProfileManagement from './pages/ProfileManagement';
import './styles/App.css'; // Import global styles

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup-therapist" element={<SignupTherapist />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/profiles" element={<ProfileManagement />} />
    </Routes>
  );
};

export default App;
