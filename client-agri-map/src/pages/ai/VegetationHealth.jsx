import React, { useState, useEffect } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import { aiAPI } from '../../services/api'
import { demoNdviTrend } from '../../lib/demoData'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const VegetationHealth = () => {
  const [trend, setTrend] = useState(demoNdviTrend)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    aiAPI.analyzeVegetation({ fieldId: 1 })
      .then((data) => { if (data?.trend) setTrend(data.trend) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const chartData = {
    labels: trend.map((t) => t.month),
    datasets: [
      { label: 'NDVI', data: trend.map((t) => t.ndvi), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', fill: true, tension: 0.4 },
      { label: 'EVI', data: trend.map((t) => t.evi), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4 },
    ],
  }

  const currentNdvi = trend[trend.length - 1]?.ndvi || 0.75

  return (
    <div>
      <PageHeader eyebrow="AI Services" title="Vegetation Health" description="NDVI and EVI trends for crop health monitoring" />

      <div className="dashboard-grid dashboard-grid-4 mb-8">
        <div className="stat-card rounded-[1.75rem] text-center">
          <p className="text-xs text-slate-400 uppercase">Current NDVI</p>
          <p className="text-3xl font-bold text-emerald-300 mt-2">{currentNdvi}</p>
          <p className="text-xs text-slate-500 mt-1">{currentNdvi > 0.6 ? 'Healthy' : 'Needs attention'}</p>
        </div>
        <div className="stat-card rounded-[1.75rem] text-center">
          <p className="text-xs text-slate-400 uppercase">Current EVI</p>
          <p className="text-3xl font-bold text-blue-300 mt-2">{trend[trend.length - 1]?.evi || 0.67}</p>
        </div>
        <div className="stat-card rounded-[1.75rem] text-center">
          <p className="text-xs text-slate-400 uppercase">Trend</p>
          <p className="text-3xl font-bold text-white mt-2">+12%</p>
        </div>
        <div className="stat-card rounded-[1.75rem] text-center">
          <p className="text-xs text-slate-400 uppercase">Health Score</p>
          <p className="text-3xl font-bold text-white mt-2">89%</p>
        </div>
      </div>

      <div className="frosted-panel">
        <h3 className="text-lg font-semibold text-white mb-4">NDVI / EVI Trends</h3>
        {!loading && (
          <Line data={chartData} options={{ responsive: true, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { y: { min: 0, max: 1, ticks: { color: '#94a3b8' } }, x: { ticks: { color: '#94a3b8' } } } }} />
        )}
      </div>
    </div>
  )
}

export default VegetationHealth
