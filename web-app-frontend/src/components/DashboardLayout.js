// frontend/src/components/DashboardLayout.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Components.css'; // Import component-specific styles

const DashboardLayout = ({ children }) => (
  <div className="dashboard-layout">
    <nav className="dashboard-nav">
      <Link to="/dashboard/analytics" className="nav-link">Analytics</Link>
      <Link to="/dashboard/assessments" className="nav-link">Assessments</Link>
      <Link to="/dashboard/monitoring" className="nav-link">Monitoring</Link>
    </nav>
    <main className="dashboard-content">
      {children}
    </main>
  </div>
);

export default DashboardLayout;
