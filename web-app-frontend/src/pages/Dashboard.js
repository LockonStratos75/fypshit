// frontend/src/pages/Dashboard.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import Analytics from '../components/Analytics';
import Assessments from '../components/Assessments';
import Monitoring from '../components/Monitoring';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/assessments" element={<Assessments />} />
        <Route path="/monitoring" element={<Monitoring />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
