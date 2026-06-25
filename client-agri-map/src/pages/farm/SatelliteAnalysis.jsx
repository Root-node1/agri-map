import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaSatellite, FaChartLine, FaMapMarkedAlt, FaLeaf, FaWater, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { satelliteAPI, analysisAPI, fieldAPI, carbonAPI } from '../../services/djangoApi'

const SatelliteAnalysis = () => {
  const { t } = useTranslation()
  const [fields, setFields] = useState([])
  const [selectedField, setSelectedField] = useState(null)
  const [analysisData, setAnalysisData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('')

  useEffect(() => {
    fetchFields()
  }, [])

  const fetchFields = async () => {
    setLoading(true)
    try {
      const res = await fieldAPI.getAll()
      setFields(res.data || [])
      if (res.data && res.data.length > 0) {
        setSelectedField(res.data[0])
        await fetchAnalysis(res.data[0].id)
      }
    } catch (error) {
      console.error('Error fetching fields:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalysis = async (fieldId) => {
    setLoading(true)
    try {
      const [vegetation, crop, soil, carbon, boundaries, degradation] = await Promise.all([
        analysisAPI.getVegetationIndices(fieldId),
        analysisAPI.predictCropType(fieldId),
        analysisAPI.getSoilHealth(fieldId),
        carbonAPI.calculate(fieldId),
        analysisAPI.detectBoundaries(fieldId),
        analysisAPI.getDegradation(fieldId)
      ])

      setAnalysisData({
        vegetation: vegetation.data,
        crop: crop.data,
        soil: soil.data,
        carbon: carbon.data,
        boundaries: boundaries.data,
        degradation: degradation.data
      })
    } catch (error) {
      console.error('Error fetching analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessSatellite = async () => {
    if (!selectedField) return
    setProcessing(true)
    setProcessingStatus('Fetching Sentinel-2 imagery...')
    
    try {
      // Step 1: Fetch imagery
      await satelliteAPI.fetchImagery({ 
        field_id: selectedField.id,
        date_range: ['2024-01-01', '2024-03-01']
      })
      setProcessingStatus('Processing satellite data...')
      
      // Step 2: Process imagery
      await satelliteAPI.processImagery({ field_id: selectedField.id })
      setProcessingStatus('Analyzing vegetation indices...')
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProcessingStatus('Detecting crop boundaries...')
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProcessingStatus('Calculating carbon sequestration...')
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProcessingStatus('Complete!')
      
      await fetchAnalysis(selectedField.id)
    } catch (error) {
      console.error('Error processing satellite data:', error)
      setProcessingStatus('Error processing data')
    } finally {
      setTimeout(() => {
        setProcessing(false)
        setProcessingStatus('')
      }, 2000)
    }
  }

  if (loading && !analysisData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-600 dark:text-gray-300">Loading satellite data...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="glass-card rounded-2xl p-8 mb-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('satellite.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Real-time satellite intelligence for your fields
            </p>
          </div>
          <div className="flex gap-3">
            <select 
              className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              value={selectedField?.id || ''}
              onChange={(e) => {
                const field = fields.find(f => f.id === e.target.value)
                setSelectedField(field)
                if (field) fetchAnalysis(field.id)
              }}
            >
              {fields.map(field => (
                <option key={field.id} value={field.id}>{field.name}</option>
              ))}
            </select>
            <button 
              className="btn-primary px-6 py-2"
              onClick={handleProcessSatellite}
              disabled={processing}
            >
              {processing ? (
                <><FaSpinner className="animate-spin" /> Processing...</>
              ) : (
                <><FaSatellite /> {t('satellite.fetchData')}</>
              )}
            </button>
          </div>
        </div>
        {processingStatus && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 text-sm flex items-center gap-2">
            <FaSpinner className="animate-spin" />
            {processingStatus}
          </div>
        )}
      </div>

      {analysisData ? (
        <>
          {/* Analysis Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div 
              className="glass-card rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <FaChartLine className="text-green-500 text-xl" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">{t('satellite.ndvi')}</h3>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analysisData.vegetation?.ndvi || 'N/A'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Status: {analysisData.vegetation?.status || 'Unknown'}
              </div>
            </motion.div>

            <motion.div 
              className="glass-card rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <FaLeaf className="text-green-500 text-xl" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">{t('satellite.cropDetection')}</h3>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analysisData.crop?.type || 'N/A'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Confidence: {(analysisData.crop?.confidence * 100 || 0).toFixed(1)}%
              </div>
            </motion.div>

            <motion.div 
              className="glass-card rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <FaWater className="text-blue-500 text-xl" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">{t('satellite.soilMoisture')}</h3>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analysisData.soil?.moisture_index || 'N/A'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Nitrogen: {analysisData.soil?.nitrogen_proxy || 'N/A'}
              </div>
            </motion.div>

            <motion.div 
              className="glass-card rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <FaMapMarkedAlt className="text-purple-500 text-xl" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">{t('satellite.carbonSequestration')}</h3>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analysisData.carbon?.carbon_tons || 0} tons
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Confidence: {(analysisData.carbon?.confidence_score * 100 || 0).toFixed(1)}%
              </div>
            </motion.div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Soil Health Analysis
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Nitrogen Proxy</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {analysisData.soil?.nitrogen_proxy || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Moisture Index</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {analysisData.soil?.moisture_index || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Degradation Risk</span>
                  <span className={`font-semibold ${
                    analysisData.degradation?.risk === 'low' ? 'text-green-600' :
                    analysisData.degradation?.risk === 'moderate' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {analysisData.degradation?.risk || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Carbon Credit Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Carbon Sequestered</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {analysisData.carbon?.carbon_tons || 0} tons
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Methodology</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {analysisData.carbon?.methodology || 'NDVI-based'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Estimated Value</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    ${(analysisData.carbon?.carbon_tons || 0) * 15}.00
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card rounded-xl p-12 text-center">
          <FaSatellite className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Satellite Data Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Process satellite imagery for your fields to get started
          </p>
          <button 
            className="btn-primary px-6 py-2"
            onClick={handleProcessSatellite}
            disabled={processing}
          >
            <FaSatellite className="mr-2" />
            Process Satellite Data
          </button>
        </div>
      )}
    </div>
  )
}

export default SatelliteAnalysis
