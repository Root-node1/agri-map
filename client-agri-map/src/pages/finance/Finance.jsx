import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaWallet, FaMoneyBillWave, FaLeaf, FaPlus, FaArrowUp, FaArrowDown, FaCoins } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { loanAPI, walletAPI, carbonCreditAPI, paymentAPI } from '../../services/nodeApi'

const Finance = () => {
  const { t } = useTranslation()
  const [loans, setLoans] = useState([])
  const [wallet, setWallet] = useState({ balance: 0 })
  const [transactions, setTransactions] = useState([])
  const [credits, setCredits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLoanModal, setShowLoanModal] = useState(false)
  const [showCarbonModal, setShowCarbonModal] = useState(false)
  const [loanData, setLoanData] = useState({
    amount: '',
    purpose: '',
    cooperative_id: ''
  })
  const [carbonData, setCarbonData] = useState({
    amount: '',
    price: ''
  })

  useEffect(() => {
    fetchFinanceData()
  }, [])

  const fetchFinanceData = async () => {
    setLoading(true)
    try {
      const [loansRes, walletRes, transactionsRes, creditsRes] = await Promise.all([
        loanAPI.getMyLoans(),
        walletAPI.getBalance(),
        walletAPI.getTransactions(),
        carbonCreditAPI.getMyCredits()
      ])
      setLoans(loansRes.data || [])
      setWallet(walletRes.data || { balance: 0 })
      setTransactions(transactionsRes.data || [])
      setCredits(creditsRes.data || [])
    } catch (error) {
      console.error('Error fetching finance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyLoan = async (e) => {
    e.preventDefault()
    try {
      await loanAPI.apply(loanData)
      setShowLoanModal(false)
      setLoanData({ amount: '', purpose: '', cooperative_id: '' })
      fetchFinanceData()
    } catch (error) {
      console.error('Error applying for loan:', error)
      alert('Error applying for loan. Please try again.')
    }
  }

  const handleTokenizeCarbon = async (e) => {
    e.preventDefault()
    try {
      await carbonCreditAPI.tokenize(carbonData)
      setShowCarbonModal(false)
      setCarbonData({ amount: '', price: '' })
      fetchFinanceData()
    } catch (error) {
      console.error('Error tokenizing carbon credits:', error)
      alert('Error tokenizing carbon credits. Please try again.')
    }
  }

  const handleSellCarbon = async (creditId) => {
    if (window.confirm('Are you sure you want to sell these carbon credits?')) {
      try {
        await carbonCreditAPI.sell({ credit_id: creditId })
        fetchFinanceData()
      } catch (error) {
        console.error('Error selling carbon credits:', error)
        alert('Error selling carbon credits. Please try again.')
      }
    }
  }

  const stats = [
    { icon: <FaWallet className="text-2xl" />, label: t('finance.balance'), value: `$${wallet.balance || 0}` },
    { icon: <FaMoneyBillWave className="text-2xl" />, label: t('finance.loans'), value: loans.length },
    { icon: <FaLeaf className="text-2xl" />, label: t('finance.carbonCredits'), value: credits.length },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-600 dark:text-gray-300">Loading finance data...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="glass-card rounded-2xl p-8 mb-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('finance.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Green financing & carbon credit marketplace
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              className="btn-primary px-6 py-2"
              onClick={() => setShowLoanModal(true)}
            >
              <FaPlus className="mr-2" /> {t('finance.applyLoan')}
            </button>
            <button 
              className="btn-outline px-6 py-2"
              onClick={() => setShowCarbonModal(true)}
            >
              <FaCoins className="mr-2" /> {t('finance.tokenize')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            className="glass-card rounded-xl p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="inline-flex p-3 bg-green-50 dark:bg-green-900/20 rounded-full mb-3 text-green-600">
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Loans Section */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {t('finance.loans')}
          </h2>
          <div className="space-y-3">
            {loans.length > 0 ? (
              loans.map((loan, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">${loan.amount}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{loan.purpose}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    loan.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    loan.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {t(`finance.${loan.status || 'pending'}`)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No loans yet. Apply for your first green loan!
              </div>
            )}
          </div>
        </div>

        {/* Carbon Credits Section */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {t('finance.carbonCredits')}
          </h2>
          <div className="space-y-3">
            {credits.length > 0 ? (
              credits.map((credit, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{credit.amount} tons</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Value: ${credit.value}</div>
                  </div>
                  <button 
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition"
                    onClick={() => handleSellCarbon(credit.id)}
                  >
                    {t('finance.sell')}
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No carbon credits yet. Tokenize your carbon sequestration!
              </div>
            )}
          </div>
        </div>

        {/* Transactions */}
        <div className="md:col-span-2 glass-card rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {t('finance.transactions')}
          </h2>
          <div className="space-y-2">
            {transactions.length > 0 ? (
              transactions.slice(0, 10).map((tx, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      tx.type === 'credit' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {tx.type === 'credit' ? 
                        <FaArrowUp className="text-green-600" /> : 
                        <FaArrowDown className="text-red-600" />
                      }
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{tx.description}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(tx.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {tx.type === 'credit' ? '+' : '-'}${tx.amount}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No transactions yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Loan Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('finance.applyLoan')}
            </h2>
            <form onSubmit={handleApplyLoan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                  {t('finance.loanAmount')}
                </label>
                <input
                  type="number"
                  value={loanData.amount}
                  onChange={(e) => setLoanData({...loanData, amount: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-gray-900 dark:text-white"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                  {t('finance.purpose')}
                </label>
                <input
                  type="text"
                  value={loanData.purpose}
                  onChange={(e) => setLoanData({...loanData, purpose: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-gray-900 dark:text-white"
                  placeholder="Enter purpose"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" className="flex-1 btn-secondary py-2" onClick={() => setShowLoanModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary py-2 justify-center">
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tokenize Carbon Modal */}
      {showCarbonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('finance.tokenize')} Carbon Credits
            </h2>
            <form onSubmit={handleTokenizeCarbon} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                  Amount (tons)
                </label>
                <input
                  type="number"
                  value={carbonData.amount}
                  onChange={(e) => setCarbonData({...carbonData, amount: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-gray-900 dark:text-white"
                  placeholder="Enter tons"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                  Price per ton ($)
                </label>
                <input
                  type="number"
                  value={carbonData.price}
                  onChange={(e) => setCarbonData({...carbonData, price: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-gray-900 dark:text-white"
                  placeholder="Enter price"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" className="flex-1 btn-secondary py-2" onClick={() => setShowCarbonModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary py-2 justify-center">
                  Tokenize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Finance
