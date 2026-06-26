import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaSatellite, FaLeaf, FaFlask } from 'react-icons/fa'
import PageHeader from '../../components/ui/PageHeader'
import FieldMap from '../../components/ui/FieldMap'
import NutrientHeatmap from '../../components/ui/NutrientHeatmap'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { fieldAPI, aiAPI } from '../../services/api'
import { demoFields, nutrientHeatmap, demoSoilData } from '../../lib/demoData'

const FieldDetail = () => {
  const { id } = useParams()
  const [field, setField] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [satellite, setSatellite] = useState(false)
  const [heatmapMetric, setHeatmapMetric] = useState('n')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fieldAPI.getOne(id)
        setField(data.field || data)
      } catch {
        setField(demoFields.find((f) => String(f.id) === String(id)) || demoFields[0])
      }
      try {
        const result = await aiAPI.analyzeField({ fieldId: id })
        setAnalysis(result)
      } catch { /* demo */ }
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <LoadingSpinner fullScreen />
  if (!field) return <p className="text-slate-300">Field not found.</p>

  const soil = analysis?.soil || demoSoilData
  const heatmap = nutrientHeatmap(field)
  const boundary = field.lat ? [
    [field.lat + 0.005, field.lng - 0.005],
    [field.lat + 0.005, field.lng + 0.005],
    [field.lat - 0.005, field.lng + 0.005],
    [field.lat - 0.005, field.lng - 0.005],
  ] : null

  return (
    <div>
      <PageHeader
        eyebrow="Field Detail"
        title={field.name}
        description={`${field.location} · ${field.size} ha · ${field.cropType}`}
        actions={
          <>
            <button
              onClick={() => setSatellite(!satellite)}
              className={`btn-secondary text-sm ${satellite ? 'ring-2 ring-emerald-400' : ''}`}
              aria-pressed={satellite}
            >
              <FaSatellite /> {satellite ? 'Satellite On' : 'Satellite Off'}
            </button>
            <Link to="/ai/field-analysis" className="btn-primary text-sm">Full Analysis</Link>
          </>
        }
      />

      <div className="dashboard-grid dashboard-grid-2 gap-6 mb-8">
        <FieldMap
          center={[field.lat || -1.2864, field.lng || 36.8172]}
          zoom={14}
          boundary={boundary}
          satellite={satellite}
          height="360px"
        />
        <div className="space-y-4">
          <div className="frosted-panel">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><FaLeaf /> Crop Detection</h3>
            <p className="text-2xl font-bold text-white">{field.cropType}</p>
            <p className="text-sm text-slate-400 mt-1">Confidence: {analysis?.cropConfidence || 94}%</p>
          </div>
          <div className="frosted-panel">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><FaFlask /> Soil Analysis</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['N', soil.nitrogen], ['P', soil.phosphorus], ['K', soil.potassium], ['pH', soil.ph]].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-white/5 p-3">
                  <span className="text-slate-400">{k}</span>
                  <p className="text-lg font-bold text-white">{v}{k === 'pH' ? '' : '%'}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="frosted-panel">
            <h3 className="text-lg font-semibold text-white mb-2">Carbon Sequestration</h3>
            <p className="text-3xl font-bold text-emerald-300">{field.carbon || 2.3} tons CO₂</p>
            <p className="text-sm text-slate-400 mt-1">Estimated annual sequestration potential</p>
          </div>
        </div>
      </div>

      <div className="frosted-panel">
        <div className="flex flex-wrap gap-2 mb-4">
          {['n', 'p', 'k', 'ph', 'moisture'].map((m) => (
            <button
              key={m}
              onClick={() => setHeatmapMetric(m)}
              className={`px-4 py-2 rounded-full text-sm capitalize ${heatmapMetric === m ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-300'}`}
            >
              {m === 'n' ? 'Nitrogen' : m === 'p' ? 'Phosphorus' : m === 'k' ? 'Potassium' : m}
            </button>
          ))}
        </div>
        <NutrientHeatmap data={heatmap} metric={heatmapMetric} />
      </div>
    </div>
  )
}

export default FieldDetail
