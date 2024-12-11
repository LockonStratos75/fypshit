// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Pages
import Home from './components/pages/Home';
import LoginPage from './components/pages/LoginPage';
import SignupPage from './components/pages/SignupPage';
import NotFound from './components/pages/NotFound';
import ProfilePage from './components/pages/ProfilePage';
import ApplicationPendingPage from './components/pages/ApplicationPendingPage';
import ProfileRejectedPage from './components/pages/ProfileRejectedPage';
import AdminApplicationsPage from './components/pages/AdminApplicationsPage';
import UsersList from './components/pages/UsersList';
import PsychologistUserDetails from './components/pages/PsychologistUserDetails';
import RecordsPage from './components/pages/RecordsPage'; // Existing Page
import EmergencyPage from './components/pages/EmergencyPage'; // New Page
import LogsPage from './components/pages/LogsPage'; // Existing Page

// Import Components
import AdminDashboard from './components/Dashboard/AdminDashboard';
import PsychologistDashboard from './components/Dashboard/PsychologistDashboard';
import ReportGenerator from './components/Report/ReportGenerator';
import Navbar from './components/Layout/Navbar';

// Import Utilities
import ProtectedRoute from './components/utils/ProtectedRoute';

// Import Theme
import theme from './components/theme/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppContent />
        <ToastContainer />
      </Router>
    </ThemeProvider>
  );
}

function AppContent() {
  const location = useLocation();

  // Define routes where Navbar should be hidden
  const hideNavbarRoutes = ['/', '/login', '/signup'];

  // Check if the current route is in the hideNavbarRoutes array
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Profile Completion Route */}
        <Route
          path="/psychologist/profile"
          element={
            <ProtectedRoute roles={['PsychologistProfile']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Application Pending Route */}
        <Route
          path="/psychologist/application-pending"
          element={
            <ProtectedRoute roles={['PsychologistProfile']}>
              <ApplicationPendingPage />
            </ProtectedRoute>
          }
        />

        {/* Profile Rejected Route */}
        <Route
          path="/psychologist/profile-rejected"
          element={
            <ProtectedRoute roles={['PsychologistProfile']}>
              <ProfileRejectedPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Applications Management Route */}
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute roles={['AdminProfile']}>
              <AdminApplicationsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={['AdminProfile']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Psychologist Dashboard */}
        <Route
          path="/psychologist/dashboard"
          element={
            <ProtectedRoute roles={['PsychologistProfile']}>
              <PsychologistDashboard />
            </ProtectedRoute>
          }
        />

        {/* Report Generator (Admin Only) */}
        <Route
          path="/admin/report"
          element={
            <ProtectedRoute roles={['AdminProfile']}>
              <ReportGenerator />
            </ProtectedRoute>
          }
        />

        {/* Users List (Psychologist Only) */}
        <Route
          path="/psychologist/users"
          element={
            <ProtectedRoute roles={['PsychologistProfile']}>
              <UsersList />
            </ProtectedRoute>
          }
        />

        {/* User Details (Psychologist Only) */}
        <Route
          path="/psychologist/user/:id"
          element={
            <ProtectedRoute roles={['PsychologistProfile']}>
              <PsychologistUserDetails />
            </ProtectedRoute>
          }
        />

        {/* New Routes */}
        <Route
          path="/admin/records"
          element={
            <ProtectedRoute roles={['AdminProfile']}>
              <RecordsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/emergency"
          element={
            <ProtectedRoute roles={['AdminProfile']}>
              <EmergencyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/logs"
          element={
            <ProtectedRoute roles={['AdminProfile']}>
              <LogsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-All Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
