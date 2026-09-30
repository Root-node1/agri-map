import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useUser } from './contexts/UserContext'
import Layout from './components/layout/Layout'
import UserOnboarding from './pages/public/UserOnboarding'
import Home from './pages/public/Home'
import About from './pages/public/About'
import PrivacyPolicy from './pages/public/PrivacyPolicy'
import TermsConditions from './pages/public/TermsConditions'

import FarmerDashboard from './pages/dashboard/FarmerDashboard'
import CooperativeDashboard from './pages/dashboard/CooperativeDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'

import Fields from './pages/farm/Fields'
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
import Logo from './components/common/Logo'

function App() {
  const { isOnboarded } = useUser()

  const renderDashboard = () => {
    const user = JSON.parse(localStorage.getItem('agrimap_user') || '{}')
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
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              isOnboarded ? <Navigate to="/home" replace /> : <UserOnboarding />
            }
          />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />

          <Route path="/farmer/register" element={<FarmerProfileSetup />} />
          <Route path="/cooperatives" element={<Cooperatives />} />
          <Route path="/cooperatives/new" element={<CooperativeRegister />} />
          <Route path="/cooperatives/:id" element={<CooperativeDetails />} />
          <Route path="/dashboard" element={renderDashboard()} />
          <Route path="/fields" element={<Fields />} />
          <Route path="/fields/new" element={<NewField />} />
          <Route path="/fields/:id" element={<FieldDetails />} />
          <Route path="/fields/:id/report" element={<FieldReport />} />
          <Route path="/fields/:id/satellite" element={<SatelliteAnalysis />} />
          <Route path="/heatmap" element={<HeatmapView />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
