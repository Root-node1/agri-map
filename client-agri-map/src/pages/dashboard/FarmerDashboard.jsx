import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { FaTractor, FaSeedling, FaMapMarkedAlt, FaLeaf } from 'react-icons/fa'

const FarmerDashboard = () => {
  const { user } = useAuth()

  const stats = [
    { icon: <FaTractor className="text-2xl" />, label: 'Fields', value: '4' },
    { icon: <FaSeedling className="text-2xl" />, label: 'Crops', value: '6' },
    { icon: <FaMapMarkedAlt className="text-2xl" />, label: 'Soil Health', value: 'Good' },
    { icon: <FaLeaf className="text-2xl" />, label: 'Carbon', value: '2.3 tons' }
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 page-shell-dark">
      <div className="glass-card rounded-[2rem] p-8 mb-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold mb-2 text-white">Welcome, {user?.name || 'Farmer'}!</h1>
            <p className="text-slate-300">Your agricultural dashboard</p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-3 text-sm text-slate-200 border border-white/10">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Live insights active
          </div>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card rounded-[1.75rem] text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-300 mx-auto mb-5">
              {React.cloneElement(stat.icon, { className: 'text-2xl' })}
            </div>
            <div className="text-3xl font-semibold text-white mb-2">{stat.value}</div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid dashboard-grid-2 gap-6">
        <div className="glass-card rounded-[2rem] p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Recent Activity</h2>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-center gap-3 rounded-3xl bg-white/5 p-4">🌱 Planted new crop in Field A</li>
            <li className="flex items-center gap-3 rounded-3xl bg-white/5 p-4">📊 Updated harvest data</li>
            <li className="flex items-center gap-3 rounded-3xl bg-white/5 p-4">🚜 Equipment maintenance scheduled</li>
          </ul>
        </div>
        <div className="glass-card rounded-[2rem] p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button className="btn-secondary w-full justify-center">Add Field</button>
            <button className="btn-secondary w-full justify-center">Log Harvest</button>
            <button className="btn-secondary w-full justify-center">View Reports</button>
            <button className="btn-secondary w-full justify-center">Schedule Task</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FarmerDashboard
