import React from 'react'

const NutrientHeatmap = ({ data = [], metric = 'n', title }) => {
  const labels = { n: 'Nitrogen (N)', p: 'Phosphorus (P)', k: 'Potassium (K)', ph: 'pH', moisture: 'Moisture' }
  const gradients = {
    n: ['#14532d', '#22c55e', '#86efac'],
    p: ['#1e3a5f', '#3b82f6', '#93c5fd'],
    k: ['#7c2d12', '#f97316', '#fdba74'],
    ph: ['#991b1b', '#eab308', '#22c55e'],
    moisture: ['#164e63', '#06b6d4', '#67e8f9'],
  }

  const getColor = (value) => {
    const colors = gradients[metric] || gradients.n
    if (value < 40) return colors[0]
    if (value < 70) return colors[1]
    return colors[2]
  }

  return (
    <div className="frosted-panel" role="img" aria-label={`${labels[metric]} heatmap visualization`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title || labels[metric]}</h3>
      <div className="grid grid-cols-3 gap-2">
        {data.map((zone) => (
          <div
            key={zone.zone}
            className="rounded-xl p-4 text-center transition-transform hover:scale-105"
            style={{ backgroundColor: getColor(zone[metric]) }}
            title={`Zone ${zone.zone}: ${zone[metric]}${metric === 'ph' ? '' : '%'}`}
          >
            <span className="text-xs font-bold text-white/90">{zone.zone}</span>
            <p className="text-lg font-bold text-white mt-1">{zone[metric]}{metric === 'ph' ? '' : '%'}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 text-xs text-slate-400">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  )
}

export default NutrientHeatmap
