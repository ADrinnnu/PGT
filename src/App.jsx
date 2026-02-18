import React from 'react';
// 1. ADD THIS: Import Router tools
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 2. IMPORT PAGES
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import LiveMap from './pages/LiveMap';
import RoutesPage from './pages/Routes';
import Vehicles from './pages/Vehicles';
import Schedule from './pages/Schedule'; // <--- 3. ADD THIS MISSING IMPORT
import MainLayout from './layouts/MainLayout';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
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

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;