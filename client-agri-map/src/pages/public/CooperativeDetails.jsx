import React from 'react'
import { Link, useParams } from 'react-router-dom'

const CooperativeDetails = () => {
  const { id } = useParams()

  return (
    <div className="page-shell page-shell-dark max-w-6xl mx-auto px-4 py-8">
      <div className="glass-card rounded-[2rem] p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Cooperative details</h1>
            <p className="text-slate-600 dark:text-slate-300">Information for cooperative ID {id}. Coordinate local growers and impact reports from here.</p>
          </div>
          <Link to="/cooperatives" className="btn-secondary">Back to cooperatives</Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="stat-card rounded-[1.75rem] p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Members</h2>
            <p className="text-slate-600 dark:text-slate-300">40 farmers enrolled</p>
          </div>
          <div className="stat-card rounded-[1.75rem] p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Markets</h2>
            <p className="text-slate-600 dark:text-slate-300">Fresh produce export partners</p>
          </div>
          <div className="stat-card rounded-[1.75rem] p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Support</h2>
            <p className="text-slate-600 dark:text-slate-300">Training, loans and soil advisory.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CooperativeDetails
