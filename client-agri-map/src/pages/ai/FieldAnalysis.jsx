import React, { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import FieldMap from '../../components/ui/FieldMap'
import NutrientHeatmap from '../../components/ui/NutrientHeatmap'
import { aiAPI } from '../../services/api'
import { demoFields, nutrientHeatmap } from '../../lib/demoData'

const FieldAnalysis = () => {
  const [fieldId, setFieldId] = useState(demoFields[0].id)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const field = demoFields.find((f) => f.id === Number(fieldId)) || demoFields[0]

  const generateReport = async () => {
    setLoading(true)
    try {
      const data = await aiAPI.analyzeField({ fieldId })
      setReport(data)
    } catch {
      setReport({
        overallScore: 82,
        crop: field.cropType,
        soilHealth: 'Good',
        ndvi: field.ndvi,
        carbonPotential: field.carbon,
        risks: ['Moderate moisture deficit in zone B1', 'Phosphorus below optimal in zone A2'],
        recommendations: ['Irrigate zone B1 within 48 hours', 'Apply phosphate fertilizer to zone A2', 'Monitor NDVI weekly during flowering stage'],
      })
    } finally {
      setLoading(false)
    }
  }

  const r = report

  return (
    <div>
      <PageHeader
        eyebrow="AI Services"
        title="Comprehensive Field Analysis"
        description="Full health report with crop, soil, vegetation, and carbon insights"
        actions={
          <button className="btn-primary" onClick={generateReport} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        }
      />

      <div className="frosted-panel max-w-md mb-6">
        <label htmlFor="analysis-field" className="block text-sm text-slate-300 mb-2">Field</label>
        <select id="analysis-field" value={fieldId} onChange={(e) => setFieldId(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-emerald-400">
          {demoFields.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      {r && (
        <>
          <div className="dashboard-grid dashboard-grid-4 mb-8">
            <div className="stat-card text-center"><p className="text-xs text-slate-400">Overall Score</p><p className="text-3xl font-bold text-white mt-2">{r.overallScore}/100</p></div>
            <div className="stat-card text-center"><p className="text-xs text-slate-400">Crop</p><p className="text-3xl font-bold text-white mt-2">{r.crop}</p></div>
            <div className="stat-card text-center"><p className="text-xs text-slate-400">NDVI</p><p className="text-3xl font-bold text-emerald-300 mt-2">{r.ndvi}</p></div>
            <div className="stat-card text-center"><p className="text-xs text-slate-400">Carbon</p><p className="text-3xl font-bold text-white mt-2">{r.carbonPotential}t</p></div>
          </div>

          <div className="dashboard-grid dashboard-grid-2 gap-6 mb-8">
            <FieldMap center={[field.lat, field.lng]} zoom={14} height="300px" />
            <div className="space-y-4">
              <div className="frosted-panel">
                <h3 className="font-semibold text-white mb-3">Risk Factors</h3>
                <ul className="space-y-2">{r.risks?.map((risk, i) => <li key={i} className="text-sm text-amber-200/90 flex gap-2"><span aria-hidden="true">⚠️</span>{risk}</li>)}</ul>
              </div>
              <div className="frosted-panel">
                <h3 className="font-semibold text-white mb-3">Recommendations</h3>
                <ul className="space-y-2">{r.recommendations?.map((rec, i) => <li key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-emerald-400" aria-hidden="true">✓</span>{rec}</li>)}</ul>
              </div>
            </div>
          </div>

          <NutrientHeatmap data={nutrientHeatmap(field)} metric="n" title="Nutrient Distribution" />
        </>
      )}
    </div>
  )
}

export default FieldAnalysis
