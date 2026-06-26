import React from 'react'
import PageHeader from '../../components/ui/PageHeader'
import { demoLoans } from '../../lib/demoData'

const LoanDashboard = () => {
  const activeLoan = demoLoans.find((l) => l.status === 'active')

  const schedule = Array.from({ length: 6 }, (_, i) => ({
    date: new Date(2026, 6 + i, 15).toLocaleDateString(),
    amount: 12500,
    status: i === 0 ? 'upcoming' : 'scheduled',
  }))

  return (
    <div>
      <PageHeader eyebrow="Finance" title="Loan Dashboard" description="Active loans and repayment schedule" />

      {activeLoan ? (
        <>
          <div className="dashboard-grid dashboard-grid-4 mb-8">
            <div className="stat-card"><p className="text-xs text-slate-400">Original Amount</p><p className="text-2xl font-bold text-white mt-2">KES {activeLoan.amount.toLocaleString()}</p></div>
            <div className="stat-card"><p className="text-xs text-slate-400">Remaining</p><p className="text-2xl font-bold text-white mt-2">KES {activeLoan.remaining?.toLocaleString()}</p></div>
            <div className="stat-card"><p className="text-xs text-slate-400">Interest Rate</p><p className="text-2xl font-bold text-white mt-2">{activeLoan.interest}%</p></div>
            <div className="stat-card"><p className="text-xs text-slate-400">Next Payment</p><p className="text-2xl font-bold text-emerald-300 mt-2">{activeLoan.nextPayment}</p></div>
          </div>

          <div className="frosted-panel">
            <h3 className="text-lg font-semibold text-white mb-4">Repayment Schedule</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-slate-400 border-b border-white/10"><th className="py-3 text-left">Date</th><th className="py-3 text-left">Amount</th><th className="py-3 text-left">Status</th></tr></thead>
                <tbody>
                  {schedule.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 text-slate-300">
                      <td className="py-3">{row.date}</td>
                      <td className="py-3">KES {row.amount.toLocaleString()}</td>
                      <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${row.status === 'upcoming' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5'}`}>{row.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <p className="text-slate-400">No active loans. <a href="/finance/loans" className="text-emerald-300">Apply for a loan</a></p>
      )}
    </div>
  )
}

export default LoanDashboard
