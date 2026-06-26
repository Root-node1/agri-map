import React, { useState, useEffect } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { walletAPI, paymentAPI } from '../../services/api'
import { demoWallet, demoTransactions } from '../../lib/demoData'

const WalletDashboard = () => {
  const [wallet, setWallet] = useState(demoWallet)
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState('')
  const [showDeposit, setShowDeposit] = useState(false)

  useEffect(() => {
    Promise.allSettled([walletAPI.getBalance(), walletAPI.getTransactions({ limit: 20 })])
      .then(([w, t]) => {
        if (w.status === 'fulfilled') setWallet(w.value)
        setTransactions(t.status === 'fulfilled' ? (t.value?.transactions || t.value || demoTransactions) : demoTransactions)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleDeposit = async () => {
    const amount = Number(depositAmount)
    if (!amount) return
    try {
      const payment = await paymentAPI.initiate({ amount, type: 'deposit', currency: 'KES' })
      if (payment.authorizationUrl) window.open(payment.authorizationUrl, '_blank')
      else {
        await walletAPI.deposit({ amount })
        setWallet((w) => ({ ...w, balance: w.balance + amount }))
      }
    } catch {
      setWallet((w) => ({ ...w, balance: w.balance + amount }))
      setTransactions((prev) => [{ id: Date.now(), type: 'deposit', amount, description: 'Demo deposit', date: new Date().toISOString().split('T')[0], status: 'completed' }, ...prev])
    }
    setShowDeposit(false)
    setDepositAmount('')
  }

  const filtered = filter === 'all' ? transactions : transactions.filter((t) => t.type === filter)

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <div>
      <PageHeader
        eyebrow="Wallet"
        title="Wallet & Transactions"
        description="Manage your balance, deposits, and transaction history"
        actions={
          <>
            <button className="btn-secondary" onClick={() => setShowDeposit(true)}>Deposit</button>
            <button className="btn-primary">Withdraw</button>
          </>
        }
      />

      <div className="dashboard-grid dashboard-grid-3 mb-8">
        <div className="stat-card col-span-2 md:col-span-1">
          <p className="text-xs text-slate-400 uppercase">Available Balance</p>
          <p className="text-4xl font-bold text-white mt-2">KES {wallet.balance?.toLocaleString()}</p>
        </div>
        <div className="stat-card"><p className="text-xs text-slate-400">Pending</p><p className="text-2xl font-bold text-amber-300 mt-2">KES {(wallet.pending || 0).toLocaleString()}</p></div>
        <div className="stat-card"><p className="text-xs text-slate-400">Currency</p><p className="text-2xl font-bold text-white mt-2">{wallet.currency || 'KES'}</p></div>
      </div>

      <div className="frosted-panel">
        <div className="flex flex-wrap gap-2 mb-4">
          {['all', 'deposit', 'withdraw', 'carbon_sale', 'subscription'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs capitalize ${filter === f ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-300'}`}>{f.replace('_', ' ')}</button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-slate-400 border-b border-white/10"><th className="py-3 text-left">Date</th><th className="py-3 text-left">Description</th><th className="py-3 text-right">Amount</th><th className="py-3 text-left">Status</th></tr></thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} className="border-b border-white/5 text-slate-300">
                  <td className="py-3">{tx.date}</td>
                  <td className="py-3">{tx.description}</td>
                  <td className={`py-3 text-right font-medium ${tx.amount > 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {tx.amount > 0 ? '+' : ''}KES {Math.abs(tx.amount).toLocaleString()}
                  </td>
                  <td className="py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-white/5 capitalize">{tx.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showDeposit && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content glass">
            <h2 className="text-xl font-bold text-white mb-4">Deposit via Paystack</h2>
            <label htmlFor="deposit-amount" className="block text-sm text-slate-300 mb-1">Amount (KES)</label>
            <input id="deposit-amount" type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white mb-4 outline-none focus:ring-2 focus:ring-emerald-400" />
            <div className="flex gap-3 justify-end">
              <button className="btn-secondary" onClick={() => setShowDeposit(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleDeposit}>Pay with Paystack</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WalletDashboard
