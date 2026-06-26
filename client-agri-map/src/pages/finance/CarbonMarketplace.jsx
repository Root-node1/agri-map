import React, { useState, useEffect } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import { carbonAPI } from '../../services/api'
import { demoCarbonCredits } from '../../lib/demoData'

const CarbonMarketplace = () => {
  const [credits, setCredits] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    Promise.allSettled([carbonAPI.getAll(), carbonAPI.getStats()])
      .then(([all, s]) => {
        setCredits(all.status === 'fulfilled' ? (all.value?.credits || all.value || demoCarbonCredits) : demoCarbonCredits)
        setStats(s.status === 'fulfilled' ? s.value : { total: 7.2, available: 5.4, sold: 1.8 })
      })
  }, [])

  return (
    <div>
      <PageHeader eyebrow="Finance" title="Carbon Credit Marketplace" description="Buy and sell verified carbon credits from agricultural fields" />

      <div className="dashboard-grid dashboard-grid-3 mb-8">
        <div className="stat-card text-center"><p className="text-xs text-slate-400">Total Credits</p><p className="text-3xl font-bold text-white mt-2">{stats?.total || 7.2}t</p></div>
        <div className="stat-card text-center"><p className="text-xs text-slate-400">Available</p><p className="text-3xl font-bold text-emerald-300 mt-2">{stats?.available || 5.4}t</p></div>
        <div className="stat-card text-center"><p className="text-xs text-slate-400">Sold</p><p className="text-3xl font-bold text-white mt-2">{stats?.sold || 1.8}t</p></div>
      </div>

      <div className="dashboard-grid dashboard-grid-2 gap-6">
        {credits.map((credit) => (
          <div key={credit.id} className="frosted-panel">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{credit.field}</h3>
                <p className="text-2xl font-bold text-emerald-300 mt-1">{credit.amount}t CO₂</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs capitalize ${
                credit.status === 'available' ? 'bg-emerald-500/20 text-emerald-300' :
                credit.status === 'tokenized' ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-500/20 text-slate-300'
              }`}>{credit.status}</span>
            </div>
            <p className="text-slate-400 text-sm mb-4">Price: KES {credit.price?.toLocaleString()}/ton</p>
            {credit.status === 'available' && (
              <div className="flex gap-2">
                <button className="btn-primary text-sm flex-1 justify-center">Buy</button>
                <button className="btn-secondary text-sm flex-1 justify-center">Tokenize</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CarbonMarketplace
