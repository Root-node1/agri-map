import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaTractor, FaSeedling, FaLeaf, FaWallet, FaPlus, FaFileExport } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import FieldMap from '../../components/ui/FieldMap'
import { fieldAPI, walletAPI, carbonAPI } from '../../services/api'
import { demoFields, demoActivities } from '../../lib/demoData'

const FarmerDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({ fields: 0, crops: 0, carbon: 0, balance: 0 })
  const [activities, setActivities] = useState(demoActivities)
  const [loading, setLoading] = useState(true)
  const [apiLatency, setApiLatency] = useState(null)

  useEffect(() => {
    const load = async () => {
      const start = performance.now()
      try {
        const [fields, wallet, carbon] = await Promise.allSettled([
          fieldAPI.getAll(),
          walletAPI.getBalance(),
          carbonAPI.getStats(),
        ])
        const fieldData = fields.status === 'fulfilled' ? (fields.value?.fields || fields.value || demoFields) : demoFields
        const walletData = wallet.status === 'fulfilled' ? wallet.value : { balance: 45750 }
        const carbonData = carbon.status === 'fulfilled' ? carbon.value : { total: 7.2 }
        setStats({
          fields: Array.isArray(fieldData) ? fieldData.length : demoFields.length,
          crops: Array.isArray(fieldData) ? new Set(fieldData.map((f) => f.cropType)).size : 3,
          carbon: carbonData.total || carbonData.totalCredits || 7.2,
          balance: walletData.balance || 0,
        })
      } catch {
        setStats({ fields: 3, crops: 3, carbon: 7.2, balance: 45750 })
      } finally {
        setApiLatency(Math.round(performance.now() - start))
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner fullScreen message="Loading dashboard..." />

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 page-shell page-shell-dark">
      {/* Header */}
      <div className="glass-card rounded-[2rem] p-8 mb-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold mb-2 text-slate-900 dark:text-white">
              Welcome, {user?.firstName || user?.name || 'Farmer'}!
            </h1>
            <p className="text-slate-600 dark:text-slate-300">Your agricultural intelligence overview</p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full bg-slate-100/90 dark:bg-white/10 px-4 py-3 text-sm text-slate-900 dark:text-slate-200 border border-slate-200/70 dark:border-white/10">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            {apiLatency != null ? `LIVE · ${apiLatency}ms` : 'Live insights active'}
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="glass-card rounded-[2rem] overflow-hidden mb-10">
        <img
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80"
          alt="Kenyan farmers working in a field"
          className="w-full h-64 object-cover sm:h-72"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={<FaTractor className="text-2xl" />} 
          label="Total Fields" 
          value={stats.fields} 
          trend={12} 
        />
        <StatCard 
          icon={<FaSeedling className="text-2xl" />} 
          label="Active Crops" 
          value={stats.crops} 
          trend={8} 
        />
        <StatCard 
          icon={<FaLeaf className="text-2xl" />} 
          label="Carbon Credits" 
          value={`${stats.carbon} t`} 
          trend={15} 
        />
        <StatCard 
          icon={<FaWallet className="text-2xl" />} 
          label="Wallet Balance" 
          value={`KES ${stats.balance.toLocaleString()}`} 
        />
      </div>

      {/* Field Map & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Field Map */}
        <div className="frosted-panel lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Field Map</h2>
            <Link to="/fields" className="text-sm text-emerald-300 hover:text-white">View all</Link>
          </div>
          <FieldMap
            center={[-1.2864, 36.8172]}
            zoom={11}
            markers={demoFields.map((f) => ({ id: f.id, lat: f.lat, lng: f.lng, label: `${f.name} - ${f.health}% health` }))}
            height="280px"
          />
        </div>

        {/* Activity Feed */}
        <div className="frosted-panel">
          <h2 className="text-xl font-semibold text-white mb-4">Activity Feed</h2>
          <ul className="space-y-3" aria-label="Recent activity">
            {activities.map((item) => (
              <motion.li
                key={item.id}
                className="flex items-start gap-3 rounded-2xl bg-white/5 p-4 text-sm text-slate-300"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <span aria-hidden="true">{item.icon}</span>
                <div>
                  <p>{item.message}</p>
                  <time className="text-xs text-slate-500">{item.time}</time>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="frosted-panel">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/fields" className="btn-secondary justify-center"><FaPlus /> Add Field</Link>
          <Link to="/finance/loans" className="btn-secondary justify-center">Apply Loan</Link>
          <Link to="/finance/tokenize" className="btn-secondary justify-center">Tokenize Credits</Link>
          <button className="btn-secondary justify-center" aria-label="Export reports"><FaFileExport /> Export</button>
        </div>
      </div>
    </div>
  )
}

export default FarmerDashboard
