import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaUsers, FaHands, FaLeaf, FaWallet, FaPlus, FaChartLine } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const CooperativeDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    members: 0,
    fields: 0,
    carbonCredits: 0,
    balance: 0
  })

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        members: 45,
        fields: 23,
        carbonCredits: 156.5,
        balance: 45750
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <div className="page-shell page-shell-dark">
      <PageHeader
        eyebrow="Cooperative Dashboard"
        title={`Welcome, ${user?.firstName || 'Cooperative'}!`}
        description="Manage your cooperative's agricultural activities"
        actions={
          <Link to="/cooperative/members/add" className="btn-primary">
            <FaPlus className="mr-2" /> Add Member
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={<FaUsers className="text-2xl" />} 
          label="Total Members" 
          value={stats.members} 
          trend={12} 
        />
        <StatCard 
          icon={<FaHands className="text-2xl" />} 
          label="Active Fields" 
          value={stats.fields} 
          trend={8} 
        />
        <StatCard 
          icon={<FaLeaf className="text-2xl" />} 
          label="Carbon Credits" 
          value={`${stats.carbonCredits} t`} 
          trend={15} 
        />
        <StatCard 
          icon={<FaWallet className="text-2xl" />} 
          label="Cooperative Balance" 
          value={`KES ${stats.balance.toLocaleString()}`} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="frosted-panel">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <FaUsers className="text-emerald-400" />
              <span className="text-slate-300">New member joined: John M.</span>
            </li>
            <li className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <FaLeaf className="text-emerald-400" />
              <span className="text-slate-300">Carbon credits tokenized: 12.5 tCO2</span>
            </li>
            <li className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <FaChartLine className="text-blue-400" />
              <span className="text-slate-300">Field analysis completed for 5 fields</span>
            </li>
          </ul>
        </div>

        <div className="frosted-panel">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/fields" className="btn-secondary justify-center">View Fields</Link>
            <Link to="/finance/loans" className="btn-secondary justify-center">Apply Loan</Link>
            <Link to="/carbon" className="btn-secondary justify-center">Carbon Credits</Link>
            <Link to="/reports" className="btn-secondary justify-center">Generate Report</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CooperativeDashboard
