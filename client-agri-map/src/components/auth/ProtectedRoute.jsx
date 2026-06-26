import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole, requireFarmerProfile = false }) => {
  const { user, loading, isAuthenticated, needsFarmerProfile } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner fullScreen message="Authenticating..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Redirect to login if user is null (shouldn't happen but just in case)
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if farmer needs to complete profile
  if (requireFarmerProfile && needsFarmerProfile && location.pathname !== '/farmer/register') {
    return <Navigate to="/farmer/register" replace />;
  }

  // Render children if all checks pass
  return children;
};

export default ProtectedRoute;
