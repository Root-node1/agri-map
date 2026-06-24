import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import Home from './pages/public/Home'
import About from './pages/public/About'
import PrivacyPolicy from './pages/public/PrivacyPolicy'
import TermsConditions from './pages/public/TermsConditions'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import FarmerDashboard from './pages/dashboard/FarmerDashboard'
import CooperativeDashboard from './pages/dashboard/CooperativeDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import Fields from './pages/farm/Fields'
import SatelliteAnalysis from './pages/farm/SatelliteAnalysis'
import Finance from './pages/finance/Finance'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    )
  }

  const getDashboard = () => {
    if (!user) return <Navigate to="/login" />
    switch(user.role) {
      case 'admin': return <AdminDashboard />
      case 'cooperative': return <CooperativeDashboard />
      default: return <FarmerDashboard />
    }
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute>{getDashboard()}</ProtectedRoute>} />
        <Route path="/fields" element={<ProtectedRoute><Fields /></ProtectedRoute>} />
        <Route path="/satellite" element={<ProtectedRoute><SatelliteAnalysis /></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
