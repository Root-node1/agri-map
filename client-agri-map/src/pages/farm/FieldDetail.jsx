import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaArrowLeft, FaMapMarkedAlt, FaSeedling, FaLeaf, 
  FaTint, FaThermometerHalf, FaChartLine, FaEdit,
  FaTrash, FaDownload, FaShare
} from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import FieldMap from '../../components/ui/FieldMap'
import NutrientHeatmap from '../../components/ui/NutrientHeatmap'
import { fieldAPI, analysisAPI, carbonAPI } from '../../services/api'
import { demoFields, demoSoilData, nutrientHeatmap, demoPredictions, demoCarbonData } from '../../lib/demoData'

const FieldDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [field, setField] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [analysis, setAnalysis] = useState({ soil: demoSoilData })
  const [predictions, setPredictions] = useState(demoPredictions)
  const [carbonData, setCarbonData] = useState(demoCarbonData)

  useEffect(() => {
    const loadField = async () => {
      try {
        const data = await fieldAPI.getById(id)
        setField(data || demoFields.find(f => f.id === parseInt(id)) || demoFields[0])
        
        const [soil, carbon, cropPred] = await Promise.allSettled([
          analysisAPI.getSoil(id),
          carbonAPI.getForField(id),
          analysisAPI.getCropType(id)
        ])
        
        if (soil.status === 'fulfilled' && soil.value) {
          setAnalysis(prev => ({ ...prev, soil: soil.value }))
        }
        if (carbon.status === 'fulfilled' && carbon.value) {
          setCarbonData(carbon.value)
        }
        if (cropPred.status === 'fulfilled' && cropPred.value) {
          setPredictions([cropPred.value])
        }
      } catch (error) {
        console.error('Error loading field:', error)
        setField(demoFields[0])
      } finally {
        setLoading(false)
      }
    }
    loadField()
  }, [id])

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      await fieldAPI.delete(id)
      navigate('/fields')
    }
  }

  if (loading) return <LoadingSpinner fullScreen />

  if (!field) {
    return (
      <div className="page-shell page-shell-dark">
        <div className="frosted-panel text-center py-16">
          <h2 className="text-2xl font-bold text-white mb-4">Field Not Found</h2>
          <Link to="/fields" className="btn-primary">Back to Fields</Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaMapMarkedAlt /> },
    { id: 'soil', label: 'Soil Analysis', icon: <FaLeaf /> },
    { id: 'crops', label: 'Crop Predictions', icon: <FaSeedling /> },
    { id: 'carbon', label: 'Carbon Credits', icon: <FaChartLine /> }
  ]

  const soil = analysis?.soil || demoSoilData

  return (
    <div className="page-shell page-shell-dark">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/fields" className="text-slate-400 hover:text-white transition">
          <FaArrowLeft size={20} />
        </Link>
        <PageHeader
          eyebrow={`Field #${field.id}`}
          title={field.name}
          description={`${field.location || 'Unknown location'} · ${field.size || 'N/A'}`}
          actions={
            <div className="flex gap-3">
              <Link to={`/fields/${field.id}/edit`} className="btn-secondary">
                <FaEdit /> Edit
              </Link>
              <button onClick={handleDelete} className="btn-secondary text-red-400 hover:text-red-300">
                <FaTrash /> Delete
              </button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="frosted-panel text-center py-3">
          <div className="text-sm text-slate-400">Health Score</div>
          <div className="text-2xl font-bold text-emerald-400">{field.health || 85}%</div>
        </div>
        <div className="frosted-panel text-center py-3">
          <div className="text-sm text-slate-400">Crop Type</div>
          <div className="text-xl font-semibold text-white">{field.cropType || 'Not Set'}</div>
        </div>
        <div className="frosted-panel text-center py-3">
          <div className="text-sm text-slate-400">Carbon Credits</div>
          <div className="text-xl font-semibold text-emerald-400">{field.carbonCredits || 0} tCO2</div>
        </div>
        <div className="frosted-panel text-center py-3">
          <div className="text-sm text-slate-400">Status</div>
          <div className={`text-xl font-semibold ${
            field.status === 'active' ? 'text-emerald-400' :
            field.status === 'harvested' ? 'text-yellow-400' :
            'text-slate-400'
          }`}>
            {field.status || 'Unknown'}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 flex items-center gap-2 transition-all ${
              activeTab === tab.id 
                ? 'text-emerald-400 border-b-2 border-emerald-400' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="frosted-panel">
              <h3 className="text-lg font-semibold text-white mb-4">Field Location</h3>
              <FieldMap
                center={[field.lat || -1.2864, field.lng || 36.8172]}
                zoom={14}
                markers={[{ id: field.id, lat: field.lat || -1.2864, lng: field.lng || 36.8172, label: field.name }]}
                height="300px"
              />
            </div>
            <div className="frosted-panel">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="btn-secondary">Run Crop Detection</button>
                <button className="btn-secondary">Analyze Soil</button>
                <button className="btn-secondary">Predict Yield</button>
                <button className="btn-secondary">Tokenize Credits</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'soil' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="frosted-panel">
              <h3 className="text-lg font-semibold text-white mb-4">Nutrient Heatmap</h3>
              <NutrientHeatmap data={nutrientHeatmap} />
            </div>
            <div className="frosted-panel">
              <h3 className="text-lg font-semibold text-white mb-4">Soil Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-slate-400">Nitrogen</span><span className="text-white">{soil.nitrogen || 0.62}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Phosphorus</span><span className="text-white">{soil.phosphorus || 0.48}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Potassium</span><span className="text-white">{soil.potassium || 0.55}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">pH Level</span><span className="text-white">{soil.ph || 6.5}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Moisture</span><span className="text-white">{soil.moisture || 0.4}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Temperature</span><span className="text-white">{soil.temperature || 25}°C</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'crops' && (
          <div className="frosted-panel">
            <h3 className="text-lg font-semibold text-white mb-4">Crop Predictions</h3>
            <div className="space-y-4">
              {predictions.map((pred, idx) => (
                <div key={idx} className="bg-white/5 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xl font-semibold text-white">{pred.crop}</span>
                      <span className="text-sm text-slate-400 ml-3">{pred.season}</span>
                    </div>
                    <div className="text-emerald-400 font-semibold">
                      {(pred.confidence * 100).toFixed(0)}% confidence
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'carbon' && (
          <div className="frosted-panel">
            <h3 className="text-lg font-semibold text-white mb-4">Carbon Credits</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{carbonData.totalCredits || 12.5}</div>
                <div className="text-sm text-slate-400">Total Credits (tCO2)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">${carbonData.totalValue || 625}</div>
                <div className="text-sm text-slate-400">Total Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">${carbonData.pricePerTon || 50}</div>
                <div className="text-sm text-slate-400">Price per Ton</div>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-white font-medium mb-2">History</h4>
              <div className="space-y-2">
                {carbonData.history?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                    <span className="text-slate-400">{item.date}</span>
                    <span className="text-emerald-400">{item.credits} tCO2</span>
                    <span className="text-yellow-400">${item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FieldDetail
