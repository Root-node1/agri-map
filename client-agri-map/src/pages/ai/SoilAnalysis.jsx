import React, { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import { aiAPI } from '../../services/api'
import { demoSoilData } from '../../lib/demoData'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const SoilAnalysis = () => {
  const [form, setForm] = useState({ nitrogen: 45, phosphorus: 32, potassium: 58, ph: 6.8, moisture: 42, organicMatter: 3.2 })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyze = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await aiAPI.analyzeSoil(form)
      setResult(data)
    } catch {
      setResult({ ...demoSoilData, recommendation: 'Apply nitrogen-rich fertilizer in zones A1 and B2. Maintain pH between 6.5-7.0.', score: 78 })
    } finally {
      setLoading(false)
    }
  }

  const data = result || demoSoilData
  const chartData = {
    labels: ['N', 'P', 'K', 'Moisture', 'Organic'],
    datasets: [{ label: 'Soil Levels (%)', data: [data.nitrogen, data.phosphorus, data.potassium, data.moisture, (data.organicMatter || 3) * 10], backgroundColor: ['#22c55e', '#3b82f6', '#f97316', '#06b6d4', '#a855f7'] }],
  }

  return (
    <div>
      <PageHeader eyebrow="AI Services" title="Soil Analysis" description="Input soil parameters for AI-powered nutrient analysis" />

      <div className="dashboard-grid dashboard-grid-2 gap-6">
        <form onSubmit={analyze} className="frosted-panel space-y-4">
          <h3 className="text-lg font-semibold text-white">Soil Parameters</h3>
          {Object.entries(form).map(([key, val]) => (
            <div key={key}>
              <label htmlFor={key} className="block text-sm text-slate-300 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
              <input
                id={key}
                type="number"
                step="0.1"
                value={val}
                onChange={(e) => setForm({ ...form, [key]: parseFloat(e.target.value) })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-400 outline-none"
              />
            </div>
          ))}
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Soil'}
          </button>
        </form>

        <div className="space-y-4">
          <div className="frosted-panel">
            <h3 className="text-lg font-semibold text-white mb-4">Nutrient Visualization</h3>
            <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { max: 100, ticks: { color: '#94a3b8' } }, x: { ticks: { color: '#94a3b8' } } } }} />
          </div>
          {result?.recommendation && (
            <div className="frosted-panel">
              <h3 className="text-lg font-semibold text-white mb-2">AI Recommendation</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{result.recommendation}</p>
              <p className="text-emerald-300 font-bold mt-3">Health Score: {result.score || 78}/100</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SoilAnalysis
