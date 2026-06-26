import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import WelcomeLanding from './pages/public/WelcomeLanding'
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
import FieldDetails from './pages/farm/FieldDetails'
import FieldReport from './pages/farm/FieldReport'
import NewField from './pages/farm/NewField'
import FarmerProfileSetup from './pages/farm/FarmerProfileSetup'
import Cooperatives from './pages/public/Cooperatives'
import CooperativeDetails from './pages/public/CooperativeDetails'
import CooperativeRegister from './pages/public/CooperativeRegister'
import Settings from './pages/public/Settings'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  const { user, needsFarmerProfile } = useAuth()

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />
      case 'cooperative':
        return <CooperativeDashboard />
      default:
        return <FarmerDashboard />
    }
  }

  return (
    <Layout>
      <Routes>
        {/* Logged-out visitors land on the welcome tag before login/register.
            Logged-in farmers who still need to complete profile are sent to the
            farmer registration step before they can use the dashboard. */}
        <Route
          path="/"
          element={
            user ? (
              needsFarmerProfile ? <Navigate to="/farmer/register" replace /> : <Navigate to="/dashboard" replace />
            ) : (
              <WelcomeLanding />
            )
          }
        />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />

        {/* Farmer profile (phone + location) is a separate, authenticated step
            after account creation — POST /api/farmers/register/ needs a token,
            so this can't reuse the public Signup component. */}
        <Route
          path="/farmer/register"
          element={
            <ProtectedRoute requiredRole="farmer">
              <FarmerProfileSetup />
            </ProtectedRoute>
          }
        />

        {/* /api/farmers/cooperatives/ is JWT-gated on the backend — these were
            public before, which meant a logged-out visit would 401 silently. */}
        <Route
          path="/cooperatives"
          element={
            <ProtectedRoute>
              <Cooperatives />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cooperatives/new"
          element={
            <ProtectedRoute>
              <CooperativeRegister />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cooperatives/:id"
          element={
            <ProtectedRoute>
              <CooperativeDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {needsFarmerProfile ? <Navigate to="/farmer/register" replace /> : renderDashboard()}
            </ProtectedRoute>
          }
        />
        <Route
          path="/fields"
          element={
            <ProtectedRoute>
              <Fields />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fields/new"
          element={
            <ProtectedRoute>
              <NewField />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fields/:id"
          element={
            <ProtectedRoute>
              <FieldDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fields/:id/report"
          element={
            <ProtectedRoute>
              <FieldReport />
            </ProtectedRoute>
          }
        />
        {/* SatelliteAnalysis was imported but had no route — wiring it in
            under the field it analyzes, matching the Satellite tab flow. */}
        <Route
          path="/fields/:id/satellite"
          element={
            <ProtectedRoute>
              <SatelliteAnalysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
