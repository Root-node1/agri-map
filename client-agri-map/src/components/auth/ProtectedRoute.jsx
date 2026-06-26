import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner fullScreen message="Authenticating..." />

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  if (roles && user?.role && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
