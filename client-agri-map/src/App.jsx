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
// Finance page removed (not present) — route omitted

function App() {
  const { user } = useAuth()

  // 🔓 AUTH REMOVED: Bypassing auth loading blocker entirely to jump right to the UI
  /*
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    )
  }
  */

  const getDashboard = () => {
    // 🔓 AUTH REMOVED: If no backend user exists yet, automatically default to the main Farmer view
    if (!user) return <FarmerDashboard />
    
    switch(user.role) {
      case 'admin': return <AdminDashboard />
      case 'cooperative': return <CooperativeDashboard />
      default: return <FarmerDashboard />
    }
  }

  return (
    <Layout>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* 🔓 Internal Pages (Protected Wrappers Removed) */}
        <Route path="/dashboard" element={getDashboard()} />
        <Route path="/fields" element={<Fields />} />
        <Route path="/satellite" element={<SatelliteAnalysis />} />
        {/* finance route removed (no component present) */}
        
        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App