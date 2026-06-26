import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { FaUsers, FaChartBar, FaCog, FaSearch } from 'react-icons/fa'
import { motion } from 'framer-motion'
import axios from 'axios'

const AdminDashboard = () => {
  const { user, token } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    newUsers: users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length
  }

  return (
    <div className="page-shell page-shell-dark max-w-6xl mx-auto px-4 py-8">
      <header className="dashboard-header glass-card rounded-[2rem] p-8 mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-300">Welcome back, {user?.name}!</p>
      </header>

      <div className="stats-grid">
        <motion.div 
          className="stat-card glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FaUsers className="stat-icon" />
          <div className="stat-info">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FaChartBar className="stat-icon" />
          <div className="stat-info">
            <h3>Active Users</h3>
            <p>{stats.activeUsers}</p>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FaCog className="stat-icon" />
          <div className="stat-info">
            <h3>New This Week</h3>
            <p>{stats.newUsers}</p>
          </div>
        </motion.div>
      </div>

      <div className="users-section glass-card rounded-[2rem] p-6">
        <div className="section-header">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">User Management</h2>
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search users"
              className="w-full rounded-3xl border border-slate-200 bg-white/95 dark:bg-slate-950/80 dark:border-slate-700 px-4 py-3 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading users...</div>
        ) : (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                    <td><span className={`status-badge ${user.status}`}>{user.status}</span></td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
