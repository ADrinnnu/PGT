import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('tms_token');
  const userStr = localStorage.getItem('tms_user');
  
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />; 
    }
  } catch (error) {
    localStorage.removeItem('tms_token');
    localStorage.removeItem('tms_user');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;