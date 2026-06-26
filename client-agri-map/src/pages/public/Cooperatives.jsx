import React from 'react'
import { Link } from 'react-router-dom'

const Cooperatives = () => {
  return (
    <div className="page-shell page-shell-dark max-w-6xl mx-auto px-4 py-8">
      <div className="glass-card rounded-[2rem] p-8 mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Cooperatives</h1>
            <p className="text-slate-600 dark:text-slate-300">Browse and join local cooperative programs to amplify farm outputs.</p>
          </div>
          <Link to="/cooperatives/new" className="btn-primary">Register cooperative</Link>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid-2">
        {[1, 2, 3].map((coop) => (
          <div key={coop} className="glass-card rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Cooperative {coop}</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">Local farmer support, shared markets, and resource planning.</p>
            <Link to={`/cooperatives/${coop}`} className="btn-secondary">View details</Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Cooperatives
