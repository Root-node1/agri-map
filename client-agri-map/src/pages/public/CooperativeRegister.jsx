import React from 'react'

const CooperativeRegister = () => {
  return (
    <div className="page-shell page-shell-dark max-w-5xl mx-auto px-4 py-8">
      <div className="glass-card rounded-[2rem] p-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Register your cooperative</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">Capture your cooperative name, mission, and local farmer support network.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="stat-card rounded-[1.75rem] p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Gather farmers</h2>
            <p className="text-slate-600 dark:text-slate-300">Build shared purchasing power and access market-ready insights.</p>
          </div>
          <div className="stat-card rounded-[1.75rem] p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Share resources</h2>
            <p className="text-slate-600 dark:text-slate-300">Centralize field health, loan support and carbon data across growers.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CooperativeRegister
