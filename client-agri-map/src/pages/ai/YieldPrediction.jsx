import React, { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import { aiAPI } from '../../services/api'
import { demoFields } from '../../lib/demoData'

const YieldPrediction = () => {
  const [fieldId, setFieldId] = useState(demoFields[0].id)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const predict = async () => {
    setLoading(true)
    try {
      const data = await aiAPI.predictYield({ fieldId })
      setResult(data)
    } catch {
      setResult({
        predictedYield: 4.2,
        unit: 'tons/ha',
        confidence: 87,
        interval: { low: 3.6, high: 4.8 },
        factors: ['Favorable rainfall', 'Good NDVI trend', 'Adequate soil nitrogen'],
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader eyebrow="AI Services" title="Yield Prediction" description="Forecast crop yields with confidence intervals" />

      <div className="frosted-panel max-w-2xl mb-6">
        <label htmlFor="field-select" className="block text-sm text-slate-300 mb-2">Select Field</label>
        <div className="flex gap-3">
          <select
            id="field-select"
            value={fieldId}
            onChange={(e) => setFieldId(e.target.value)}
            className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-400 outline-none"
          >
            {demoFields.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <button className="btn-primary" onClick={predict} disabled={loading}>{loading ? 'Predicting...' : 'Predict'}</button>
        </div>
      </div>

      {result && (
        <div className="dashboard-grid dashboard-grid-2 gap-6">
          <div className="frosted-panel text-center">
            <p className="text-sm text-slate-400 uppercase tracking-wider">Predicted Yield</p>
            <p className="text-5xl font-bold text-white mt-2">{result.predictedYield}</p>
            <p className="text-emerald-300">{result.unit || 'tons/ha'}</p>
            <p className="text-sm text-slate-400 mt-4">Confidence: {result.confidence}%</p>
            <p className="text-xs text-slate-500 mt-1">
              Range: {result.interval?.low} – {result.interval?.high} {result.unit || 'tons/ha'}
            </p>
          </div>
          <div className="frosted-panel">
            <h3 className="text-lg font-semibold text-white mb-3">Contributing Factors</h3>
            <ul className="space-y-2">
              {(result.factors || []).map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default YieldPrediction
