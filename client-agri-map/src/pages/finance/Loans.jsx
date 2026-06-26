import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { loanAPI } from '../../services/api'
import { demoLoans } from '../../lib/demoData'

const Loans = () => {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ amount: '', purpose: '', term: 12 })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loanAPI.getAll()
      .then((data) => setLoans(data?.loans || data || demoLoans))
      .catch(() => setLoans(demoLoans))
      .finally(() => setLoading(false))
  }, [])

  const apply = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    try {
      await loanAPI.apply(form)
      setMessage('Application submitted successfully!')
      setLoans((prev) => [...prev, { ...form, id: Date.now(), status: 'pending', amount: Number(form.amount) }])
      setShowForm(false)
    } catch {
      setMessage('Application submitted (demo mode).')
      setLoans((prev) => [...prev, { ...form, id: Date.now(), status: 'pending', amount: Number(form.amount) }])
      setShowForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <div>
      <PageHeader
        eyebrow="Finance"
        title="Agricultural Loans"
        description="Apply for green financing and track your loan applications"
        actions={<button className="btn-primary" onClick={() => setShowForm(true)}>Apply for Loan</button>}
      />

      {message && <div role="status" className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm">{message}</div>}

      <div className="space-y-4">
        {loans.map((loan) => (
          <div key={loan.id} className="frosted-panel flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">KES {Number(loan.amount).toLocaleString()}</h3>
              <p className="text-sm text-slate-400">{loan.purpose}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
              loan.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
              loan.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-500/20 text-slate-300'
            }`}>{loan.status}</span>
            {loan.status === 'active' && (
              <Link to="/finance/loans/dashboard" className="text-sm text-emerald-300 hover:text-white">View schedule →</Link>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">Loan Application</h2>
            <form onSubmit={apply} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm text-slate-300 mb-1">Amount (KES)</label>
                <input id="amount" type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label htmlFor="purpose" className="block text-sm text-slate-300 mb-1">Purpose</label>
                <input id="purpose" type="text" required value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label htmlFor="term" className="block text-sm text-slate-300 mb-1">Term (months)</label>
                <select id="term" value={form.term} onChange={(e) => setForm({ ...form, term: Number(e.target.value) })} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white outline-none">
                  {[6, 12, 24, 36].map((t) => <option key={t} value={t}>{t} months</option>)}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Loans
