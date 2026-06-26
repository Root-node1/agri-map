import React from 'react'
import { Link, useParams } from 'react-router-dom'

const FieldReport = () => {
  const { id } = useParams()

  return (
    <div className="page-shell page-shell-dark max-w-6xl mx-auto px-4 py-8">
      <div className="glass-card rounded-[2rem] p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Field report</h1>
            <p className="text-slate-600 dark:text-slate-300">A placeholder report page for field analytics and recommendations.</p>
          </div>
          <Link to={`/fields/${id}`} className="btn-secondary">Back to field</Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="stat-card rounded-[1.75rem] p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Soil Health</h2>
            <p className="text-slate-600 dark:text-slate-300">Balanced with nutrient support.</p>
          </div>
          <div className="stat-card rounded-[1.75rem] p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">NDVI Trend</h2>
            <p className="text-slate-600 dark:text-slate-300">Trending stable across the last 14 days.</p>
          </div>
          <div className="stat-card rounded-[1.75rem] p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Irrigation</h2>
            <p className="text-slate-600 dark:text-slate-300">Next watering scheduled soon.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FieldReport
