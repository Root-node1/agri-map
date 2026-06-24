import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { FaTractor, FaSeedling, FaMapMarkedAlt, FaLeaf } from 'react-icons/fa'

const FarmerDashboard = () => {
  const { user } = useAuth()

  const stats = [
    { icon: <FaTractor className="text-2xl" />, label: 'Fields', value: '4' },
    { icon: <FaSeedling className="text-2xl" />, label: 'Crops', value: '6' },
    { icon: <FaMapMarkedAlt className="text-2xl" />, label: 'Soil Health', value: 'Good' },
    { icon: <FaLeaf className="text-2xl" />, label: 'Carbon', value: '2.3 tons' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="glass-card rounded-2xl p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
        <p className="text-gray-600 dark:text-gray-300">Your agricultural dashboard</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-6 text-center">
            <div className="inline-flex p-3 bg-green-50 dark:bg-green-900/20 rounded-full mb-3 text-green-600">
              {stat.icon}
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">🌱 Planted new crop in Field A</li>
            <li className="flex items-center gap-2">📊 Updated harvest data</li>
            <li className="flex items-center gap-2">🚜 Equipment maintenance scheduled</li>
          </ul>
        </div>
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 transition text-sm font-medium">
              Add Field
            </button>
            <button className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 transition text-sm font-medium">
              Log Harvest
            </button>
            <button className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 transition text-sm font-medium">
              View Reports
            </button>
            <button className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 transition text-sm font-medium">
              Schedule Task
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FarmerDashboard
