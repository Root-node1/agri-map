import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoadingSpinner from './components/ui/LoadingSpinner'

import Home from './pages/public/Home'
import About from './pages/public/About'
import PrivacyPolicy from './pages/public/PrivacyPolicy'
import TermsConditions from './pages/public/TermsConditions'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'

import FarmerDashboard from './pages/dashboard/FarmerDashboard'
import CooperativeDashboard from './pages/dashboard/CooperativeDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'

import Fields from './pages/farm/Fields'
import FieldDetail from './pages/farm/FieldDetail'
import HeatmapView from './pages/farm/HeatmapView'
import SatelliteAnalysis from './pages/farm/SatelliteAnalysis'

import CropDetection from './pages/ai/CropDetection'
import SoilAnalysis from './pages/ai/SoilAnalysis'
import YieldPrediction from './pages/ai/YieldPrediction'
import VegetationHealth from './pages/ai/VegetationHealth'
import FieldAnalysis from './pages/ai/FieldAnalysis'

import ChatbotPage from './pages/chatbot/ChatbotPage'

import Loans from './pages/finance/Loans'
import LoanDashboard from './pages/finance/LoanDashboard'
import CarbonMarketplace from './pages/finance/CarbonMarketplace'
import Tokenization from './pages/finance/Tokenization'

import WalletDashboard from './pages/wallet/WalletDashboard'

import Pricing from './pages/subscriptions/Pricing'
import ApiKeys from './pages/subscriptions/ApiKeys'

import Settings from './pages/settings/Settings'

const DashboardRouter = () => {
  const { user } = useAuth()
  switch (user?.role) {
    case 'admin': return <AdminDashboard />
    case 'cooperative': return <CooperativeDashboard />
    case 'investor': return <FarmerDashboard />
    default: return <FarmerDashboard />
  }
}

const AppShell = ({ children }) => (
  <DashboardLayout>{children}</DashboardLayout>
)

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="page-shell page-shell-dark min-h-screen">
        <LoadingSpinner fullScreen message="Loading AgriMap..." />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes with marketing layout */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/about" element={<Layout><About /></Layout>} />
      <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />
      <Route path="/terms" element={<Layout><TermsConditions /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/signup" element={<Layout><Signup /></Layout>} />
      <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
      <Route path="/subscriptions" element={<Layout><Pricing /></Layout>} />

      {/* Protected dashboard routes */}
      <Route path="/dashboard" element={<ProtectedRoute><AppShell><DashboardRouter /></AppShell></ProtectedRoute>} />
      <Route path="/fields" element={<ProtectedRoute><AppShell><Fields /></AppShell></ProtectedRoute>} />
      <Route path="/fields/:id" element={<ProtectedRoute><AppShell><FieldDetail /></AppShell></ProtectedRoute>} />
      <Route path="/heatmap" element={<ProtectedRoute><AppShell><HeatmapView /></AppShell></ProtectedRoute>} />
      <Route path="/satellite" element={<ProtectedRoute><AppShell><SatelliteAnalysis /></AppShell></ProtectedRoute>} />

      <Route path="/ai/crop-detection" element={<ProtectedRoute><AppShell><CropDetection /></AppShell></ProtectedRoute>} />
      <Route path="/ai/soil-analysis" element={<ProtectedRoute><AppShell><SoilAnalysis /></AppShell></ProtectedRoute>} />
      <Route path="/ai/yield-prediction" element={<ProtectedRoute><AppShell><YieldPrediction /></AppShell></ProtectedRoute>} />
      <Route path="/ai/vegetation" element={<ProtectedRoute><AppShell><VegetationHealth /></AppShell></ProtectedRoute>} />
      <Route path="/ai/field-analysis" element={<ProtectedRoute><AppShell><FieldAnalysis /></AppShell></ProtectedRoute>} />

      <Route path="/chatbot" element={<ProtectedRoute><AppShell><ChatbotPage /></AppShell></ProtectedRoute>} />

      <Route path="/finance/loans" element={<ProtectedRoute><AppShell><Loans /></AppShell></ProtectedRoute>} />
      <Route path="/finance/loans/dashboard" element={<ProtectedRoute><AppShell><LoanDashboard /></AppShell></ProtectedRoute>} />
      <Route path="/finance/carbon" element={<ProtectedRoute><AppShell><CarbonMarketplace /></AppShell></ProtectedRoute>} />
      <Route path="/finance/tokenize" element={<ProtectedRoute><AppShell><Tokenization /></AppShell></ProtectedRoute>} />

      <Route path="/wallet" element={<ProtectedRoute><AppShell><WalletDashboard /></AppShell></ProtectedRoute>} />

      <Route path="/api-keys" element={<ProtectedRoute><AppShell><ApiKeys /></AppShell></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppShell><Settings /></AppShell></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
