import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, needsFarmerProfile } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="loading-screen">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  if (needsFarmerProfile && location.pathname !== '/farmer/register') {
    return <Navigate to="/farmer/register" replace />
  }

  return children
}

export default ProtectedRoute
