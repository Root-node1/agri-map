import React from 'react';

const ProtectedRoute = ({ children, requiredRole, requireFarmerProfile }) => {
  // Authentication removed - all routes are now publicly accessible
  return children;
};

export default ProtectedRoute;
