import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { FaUsers, FaMapMarkedAlt, FaMoneyBillWave, FaLeaf, FaPlus, FaSearch } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { cooperativeAPI, fieldAPI } from '../../services/djangoApi'
import { loanAPI, walletAPI } from '../../services/nodeApi'

const CooperativeDashboard = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [cooperative, setCooperative] = useState(null)
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalFields: 0,
    totalLoans: 0,
    carbonCredits: 0,
    walletBalance: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCooperativeData()
  }, [])

  const fetchCooperativeData = async () => {
    setLoading(true)
    try {
      const coopRes = await cooperativeAPI.getMyCooperative()
      setCooperative(coopRes.data)
      
      const fieldsRes = await fieldAPI.getAll()
      const loansRes = await loanAPI.getMyLoans()
      const walletRes = await walletAPI.getBalance()
      
      setStats({
        totalFarmers: coopRes.data?.memberCount || 0,
        totalFields: fieldsRes.data?.length || 0,
        totalLoans: loansRes.data?.length || 0,
        carbonCredits: 0,
        walletBalance: walletRes.data?.balance || 0
      })
    } catch (error) {
      console.error('Error fetching cooperative data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-600 dark:text-gray-300">Loading cooperative data...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="glass-card rounded-2xl p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          {t('dashboard.cooperative.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t('dashboard.cooperative.welcome')}, {cooperative?.name || user?.name}!
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <motion.div 
          className="glass-card rounded-xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FaUsers className="text-3xl text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalFarmers}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{t('dashboard.cooperative.totalFarmers')}</div>
        </motion.div>

        <motion.div 
          className="glass-card rounded-xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FaMapMarkedAlt className="text-3xl text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalFields}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{t('dashboard.cooperative.totalFields')}</div>
        </motion.div>

        <motion.div 
          className="glass-card rounded-xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FaMoneyBillWave className="text-3xl text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLoans}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{t('dashboard.cooperative.loans')}</div>
        </motion.div>

        <motion.div 
          className="glass-card rounded-xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <FaLeaf className="text-3xl text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.carbonCredits}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{t('dashboard.cooperative.carbonCredits')}</div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {t('dashboard.cooperative.loanManagement')}
          </h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              💰 Loan applications pending: 3
            </li>
            <li className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              ✅ Approved loans: 5
            </li>
            <li className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              📊 Total loan amount: $12,500
            </li>
          </ul>
        </div>
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 transition text-sm font-medium">
              <FaPlus className="inline mr-2" /> Apply Loan
            </button>
            <button className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 transition text-sm font-medium">
              <FaSearch className="inline mr-2" /> View Applications
            </button>
            <button className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 transition text-sm font-medium">
              <FaLeaf className="inline mr-2" /> Carbon Market
            </button>
            <button className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 transition text-sm font-medium">
              <FaUsers className="inline mr-2" /> Manage Farmers
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CooperativeDashboard
