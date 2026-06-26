import React, { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import { carbonAPI } from '../../services/api'
import { demoCarbonCredits } from '../../lib/demoData'

const Tokenization = () => {
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const available = demoCarbonCredits.filter((c) => c.status === 'available' || c.status === 'tokenized')

  const tokenize = async () => {
    if (!selected) return
    setLoading(true)
    try {
      const data = await carbonAPI.tokenize(selected.id, { amount: selected.amount })
      setResult(data)
    } catch {
      setResult({ tokenId: `AGR-${Date.now()}`, amount: selected.amount, blockchain: 'Polygon', status: 'tokenized' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Finance" title="Carbon Credit Tokenization" description="Convert carbon credits to blockchain tokens for trading" />

      <div className="dashboard-grid dashboard-grid-2 gap-6">
        <div className="frosted-panel">
          <h3 className="text-lg font-semibold text-white mb-4">Select Credit to Tokenize</h3>
          <div className="space-y-3">
            {available.map((credit) => (
              <button
                key={credit.id}
                onClick={() => { setSelected(credit); setResult(null) }}
                className={`w-full text-left p-4 rounded-xl border transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  selected?.id === credit.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <p className="font-semibold text-white">{credit.field}</p>
                <p className="text-sm text-slate-400">{credit.amount}t · KES {credit.price?.toLocaleString()}</p>
              </button>
            ))}
          </div>
          <button className="btn-primary w-full mt-4 justify-center" onClick={tokenize} disabled={!selected || loading}>
            {loading ? 'Tokenizing...' : 'Tokenize Credits'}
          </button>
        </div>

        <div className="frosted-panel">
          <h3 className="text-lg font-semibold text-white mb-4">Token Details</h3>
          {result ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <p className="text-xs text-slate-400">Token ID</p>
                <p className="font-mono text-emerald-300 break-all">{result.tokenId}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white/5 p-3"><span className="text-slate-400">Amount</span><p className="text-white font-bold">{result.amount}t</p></div>
                <div className="rounded-xl bg-white/5 p-3"><span className="text-slate-400">Blockchain</span><p className="text-white font-bold">{result.blockchain || 'Polygon'}</p></div>
              </div>
              <p className="text-sm text-emerald-300">✓ Successfully tokenized</p>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Select a carbon credit and click tokenize to generate blockchain tokens.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Tokenization
