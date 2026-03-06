import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import LiveMap from './pages/LiveMap';
import RoutesPage from './pages/RoutesPage';
import Vehicles from './pages/Vehicles';
import Schedule from './pages/Schedule';
import MainLayout from './layouts/MainLayout';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';
import Login from './pages/Login';
import ProtectedRoute from './routes/ProtectedRoute';
import Companies from './pages/Companies';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}> 
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/live-map" element={<LiveMap />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/companies" element={<Companies />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;