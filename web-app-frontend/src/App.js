// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Pages
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotFound from './pages/NotFound';

// Import Components
import AdminDashboard from './components/Dashboard/AdminDashboard';
import PsychologistDashboard from './components/Dashboard/PsychologistDashboard';
import ReportGenerator from './components/Report/ReportGenerator';
import Navbar from './components/Layout/Navbar';

// Import Utilities
import ProtectedRoute from './utils/ProtectedRoute';

// Import Theme
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/psychologist/dashboard"
            element={
              <ProtectedRoute roles={['psychologist']}>
                <PsychologistDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/report"
            element={
              <ProtectedRoute roles={['admin', 'psychologist']}>
                <ReportGenerator />
              </ProtectedRoute>
            }
          />

          {/* Catch-All Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer />
      </Router>
    </ThemeProvider>
  );
}

export default App;
