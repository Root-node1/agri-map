import React, { useState, useEffect } from 'react'
import { FaSatellite, FaChartLine, FaMapMarkedAlt, FaLeaf, FaWater, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { motion } from 'framer-motion'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { satelliteAPI, analysisAPI } from '../../services/api'

const SatelliteAnalysis = () => {
  const [loading, setLoading] = useState(true)
  const [satelliteData, setSatelliteData] = useState(null)
  const [analysisResults, setAnalysisResults] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [satellite, analysis] = await Promise.all([
          satelliteAPI.fetch({ field_id: 1 }),
          analysisAPI.getVegetation(1)
        ])
        setSatelliteData(satellite)
        setAnalysisResults(analysis)
      } catch (error) {
        console.error('Error loading satellite data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <div className="page-shell page-shell-dark">
      <PageHeader
        eyebrow="Satellite Analysis"
        title="Satellite Imagery Analysis"
        description="Analyze your fields using satellite data"
        actions={
          <button className="btn-primary">
            <FaSatellite className="mr-2" /> Refresh Data
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="frosted-panel text-center py-4">
          <FaChartLine className="text-2xl text-emerald-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">12</div>
          <div className="text-sm text-slate-400">Satellite Images</div>
        </div>
        <div className="frosted-panel text-center py-4">
          <FaLeaf className="text-2xl text-emerald-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">0.72</div>
          <div className="text-sm text-slate-400">NDVI Index</div>
        </div>
        <div className="frosted-panel text-center py-4">
          <FaWater className="text-2xl text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">0.48</div>
          <div className="text-sm text-slate-400">Moisture Index</div>
        </div>
      </div>

      <div className="frosted-panel p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Analysis Results</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <FaCheckCircle className="text-emerald-400" />
            <span className="text-slate-300">Crop health: Excellent (92% confidence)</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <FaExclamationTriangle className="text-yellow-400" />
            <span className="text-slate-300">Soil moisture: Moderate (needs monitoring)</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <FaMapMarkedAlt className="text-blue-400" />
            <span className="text-slate-300">Field boundary detected: 5.2 hectares</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SatelliteAnalysis
