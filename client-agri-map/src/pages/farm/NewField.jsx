import React from 'react'

const NewField = () => {
  return (
    <div className="page-shell page-shell-dark max-w-5xl mx-auto px-4 py-8">
      <div className="glass-card rounded-[2rem] p-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create a new field</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">Add new land plots into your farm profile and manage crop data in one place.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="stat-card rounded-[1.75rem] p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Field information</h2>
            <p className="text-slate-600 dark:text-slate-300">Use the field registration form to capture plot name, location, size and crop type.</p>
          </div>
          <div className="stat-card rounded-[1.75rem] p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Next step</h2>
            <p className="text-slate-600 dark:text-slate-300">After registration, review the field details page and schedule satellite scans.</p>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] bg-slate-50/90 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-6 text-slate-700 dark:text-slate-300">
          <p className="font-semibold">Note:</p>
          <p className="mt-2 text-sm leading-relaxed">
            This page preserves the existing field workflow structure while routing users to the core farm and report views as requested.
          </p>
        </div>
      </div>
    </div>
  )
}

export default NewField
