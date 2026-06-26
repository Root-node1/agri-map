import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { FaUser, FaChartLine, FaMapMarkerAlt, FaLeaf } from 'react-icons/fa'
import { motion } from 'framer-motion'

const UserDashboard = () => {
  const { user } = useAuth()

  const stats = [
    { icon: <FaUser />, label: 'Profile', value: 'Active' },
    { icon: <FaChartLine />, label: 'Projects', value: '12' },
    { icon: <FaMapMarkerAlt />, label: 'Fields', value: '8' },
    { icon: <FaLeaf />, label: 'Crops', value: '6' }
  ]

  return (
    <div className="page-shell page-shell-dark max-w-6xl mx-auto px-4 py-8">
      <header className="dashboard-header glass-card rounded-[2rem] p-8 mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome, {user?.name}!</h1>
        <p className="text-slate-600 dark:text-slate-300">Your agricultural dashboard</p>
      </header>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            className="stat-card glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="recent-activity glass-card rounded-[2rem] p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
          <ul className="mt-4 space-y-3 text-slate-600 dark:text-slate-300">
            <li>🌱 Planted new crop in Field A</li>
            <li>📊 Updated harvest data</li>
            <li>🚜 Equipment maintenance scheduled</li>
            <li>🌧️ Weather alert received</li>
          </ul>
        </div>

        <div className="quick-actions glass-card rounded-[2rem] p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
          <div className="action-grid">
            <button className="action-btn">Add Field</button>
            <button className="action-btn">Log Harvest</button>
            <button className="action-btn">View Reports</button>
            <button className="action-btn">Schedule Task</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
