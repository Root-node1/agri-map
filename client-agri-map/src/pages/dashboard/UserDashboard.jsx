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
    <div className="dashboard user-dashboard">
      <header className="dashboard-header glass">
        <h1>Welcome, {user?.name}!</h1>
        <p>Your agricultural dashboard</p>
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
        <div className="recent-activity glass">
          <h2>Recent Activity</h2>
          <ul>
            <li>🌱 Planted new crop in Field A</li>
            <li>📊 Updated harvest data</li>
            <li>🚜 Equipment maintenance scheduled</li>
            <li>🌧️ Weather alert received</li>
          </ul>
        </div>

        <div className="quick-actions glass">
          <h2>Quick Actions</h2>
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
