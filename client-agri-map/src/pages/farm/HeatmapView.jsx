import React, { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import NutrientHeatmap from '../../components/ui/NutrientHeatmap'
import FieldMap from '../../components/ui/FieldMap'
import { demoFields, nutrientHeatmap } from '../../lib/demoData'

const metrics = [
  { key: 'n', label: 'Nitrogen (N)', desc: 'Green gradient — low to high' },
  { key: 'p', label: 'Phosphorus (P)', desc: 'Blue gradient' },
  { key: 'k', label: 'Potassium (K)', desc: 'Orange gradient' },
  { key: 'ph', label: 'pH Levels', desc: 'Red/green indicator' },
  { key: 'moisture', label: 'Moisture Index', desc: 'Water droplet visualization' },
]

const HeatmapView = () => {
  const [selectedField, setSelectedField] = useState(demoFields[0])
  const [metric, setMetric] = useState('n')
  const heatmap = nutrientHeatmap(selectedField)

  return (
    <div>
      <PageHeader
        eyebrow="Visualization"
        title="Field Health Heatmap"
        description="Color-coded nutrient and vegetation health indicators across field zones"
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {demoFields.map((field) => (
          <button
            key={field.id}
            onClick={() => setSelectedField(field)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedField.id === field.id ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-300 border border-white/10'
            }`}
          >
            {field.name}
          </button>
        ))}
      </div>

      <div className="dashboard-grid dashboard-grid-2 gap-6 mb-8">
        <FieldMap
          center={[selectedField.lat, selectedField.lng]}
          zoom={13}
          markers={[{ lat: selectedField.lat, lng: selectedField.lng, label: selectedField.name }]}
          height="320px"
        />
        <div className="frosted-panel">
          <h3 className="text-lg font-semibold text-white mb-2">NDVI Vegetation Health</h3>
          <div className="h-8 rounded-full overflow-hidden flex" role="img" aria-label="NDVI gradient from poor to excellent">
            <div className="flex-1 bg-red-600" title="Poor" />
            <div className="flex-1 bg-yellow-500" title="Fair" />
            <div className="flex-1 bg-lime-500" title="Good" />
            <div className="flex-1 bg-green-600" title="Excellent" />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>Poor (0.2)</span>
            <span>Current: {selectedField.ndvi}</span>
            <span>Excellent (0.9)</span>
          </div>
          <p className="text-3xl font-bold text-emerald-300 mt-4">{selectedField.health}%</p>
          <p className="text-sm text-slate-400">Overall field health score</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {metrics.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`px-4 py-2 rounded-full text-sm ${metric === m.key ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-300'}`}
            title={m.desc}
          >
            {m.label}
          </button>
        ))}
      </div>

      <NutrientHeatmap data={heatmap} metric={metric} title={`${selectedField.name} — ${metrics.find((m) => m.key === metric)?.label}`} />
    </div>
  )
}

export default HeatmapView
