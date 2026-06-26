import React from 'react'

const Settings = () => {
  return (
    <div className="page-shell page-shell-dark max-w-5xl mx-auto px-4 py-8">
      <div className="glass-card rounded-[2rem] p-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">Adjust your farmer profile, notifications, and platform preferences from one secure page.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="stat-card rounded-[1.75rem] p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Profile controls</h2>
            <p className="text-slate-600 dark:text-slate-300">Update your contact details and farm identity.</p>
          </div>
          <div className="stat-card rounded-[1.75rem] p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Privacy</h2>
            <p className="text-slate-600 dark:text-slate-300">Manage access levels for dashboard and cooperative sharing.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
