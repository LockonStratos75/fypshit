// App.js

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
import UsersList from './components/pages/UsersList';
import PsychologistUserDetails from './components/pages/PsychologistUserDetails';
import RecordsPage from './components/pages/RecordsPage'; // Existing Page
import EmergencyPage from './components/pages/EmergencyPage'; // New Page
import LogsPage from './components/pages/LogsPage'; // Existing Admin Page
import ForgotPasswordPage from './components/pages/forgotPassword'; // Corrected Capitalization
import AssessmentsPage from './components/pages/AssessmentsPage';
import PsychologistRecords from './components/pages/PsychologistRecords'; 
import PsychologistReportsPage from './components/pages/PsychologistReportsPage';

// Import New Psychologist Pages
import AlertsPage from './components/pages/PsychologistAlertsPage'; // New Psychologist Alerts Page
import PsychologistLogsPage from './components/pages/PsychologistLogsPage'; // New Psychologist Logs Page

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
  const hideNavbarRoutes = ['/', '/login', '/signup', '/forgot-password'];

  // Check if the current route is in the hideNavbarRoutes array
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Routes for Psychologists */}
        <Route
          path="/psychologist/profile"
          element={
            <ProtectedRoute roles={['PsychologistProfile']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />        
        <Route
          path="/psychologist/dashboard"
          element={
            <ProtectedRoute roles={['PsychologistProfile']}>
              <PsychologistDashboard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/psychologist/assessments" 
          element={
            <ProtectedRoute roles={['PsychologistProfile']}>
              <AssessmentsPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/psychologist/reports" 
          element={
            <ProtectedRoute roles={['PsychologistProfile']}>
                  <PsychologistReportsPage />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/psychologist/users"
          element={
            <ProtectedRoute roles={['PsychologistProfile']}>
              <UsersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/psychologist/user/:id"
          element={
            <ProtectedRoute roles={['PsychologistProfile']}>
              <PsychologistUserDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/psychologist/alerts"
          element={
            <ProtectedRoute roles={['PsychologistProfile']}>
              <AlertsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/psychologist/logs"
          element={
            <ProtectedRoute roles={['PsychologistProfile']}>
              <PsychologistLogsPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes for Admins */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={['AdminProfile']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/report"
          element={
            <ProtectedRoute roles={['AdminProfile']}>
              <ReportGenerator />
            </ProtectedRoute>
          }
        />
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
        
        <Route
          path="/admin/psychologists"
          element={
            <ProtectedRoute roles={['AdminProfile']}>
              <PsychologistRecords />
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
