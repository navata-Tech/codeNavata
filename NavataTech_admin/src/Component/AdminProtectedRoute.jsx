import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdminAuthenticated } from '../Utility/auth';  // Make sure the path is correct

const AdminProtectedRoute = ({ children }) => {
  // If the admin is authenticated, render the children (the protected component)
  if (isAdminAuthenticated()) {
    return children;
  }
  // If not authenticated, redirect to the login page
  return <Navigate to="/login" />;
};

export default AdminProtectedRoute;
