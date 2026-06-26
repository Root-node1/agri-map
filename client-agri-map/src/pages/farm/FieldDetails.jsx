import React from 'react'
import { Link, useParams } from 'react-router-dom'

const FieldDetails = () => {
  const { id } = useParams()

  return (
    <div className="page-shell page-shell-dark max-w-6xl mx-auto px-4 py-8">
      <div className="glass-card rounded-[2rem] p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Field details</h1>
            <p className="text-slate-600 dark:text-slate-300">Review crop progress, soil condition and satellite history for this field.</p>
          </div>
          <Link to="/fields" className="btn-secondary">Back to fields</Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="stat-card rounded-[1.75rem] p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Field ID</h2>
            <p className="text-slate-600 dark:text-slate-300">{id}</p>
          </div>
          <div className="stat-card rounded-[1.75rem] p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Latest summary</h2>
            <p className="text-slate-600 dark:text-slate-300">Here you can add crop, soil and reporting data for the selected field.</p>
          </div>
        </div>

        <div className="mt-8">
          <Link to={`/fields/${id}/report`} className="btn-primary">View field report</Link>
        </div>
      </div>
    </div>
  )
}

export default FieldDetails
