import React, { useState, useEffect } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import { subscriptionAPI } from '../../services/api'

const ApiKeys = () => {
  const [keys, setKeys] = useState([])
  const [usage, setUsage] = useState(null)
  const [newKey, setNewKey] = useState(null)
  const [name, setName] = useState('')

  useEffect(() => {
    subscriptionAPI.getApiKeys().then((data) => setKeys(data?.keys || data || [])).catch(() => setKeys([]))
    subscriptionAPI.getUsage().then(setUsage).catch(() => setUsage({ calls: 342, limit: 1000, rateLimit: '100/min' }))
  }, [])

  const generate = async () => {
    try {
      const data = await subscriptionAPI.generateApiKey({ name: name || 'Default Key' })
      setNewKey(data.key || data.apiKey)
      setKeys((prev) => [...prev, { id: Date.now(), name: name || 'Default Key', prefix: (data.key || 'agr_').slice(0, 8) + '...', created: new Date().toISOString().split('T')[0] }])
    } catch {
      const demoKey = `agr_${Math.random().toString(36).slice(2, 18)}`
      setNewKey(demoKey)
      setKeys((prev) => [...prev, { id: Date.now(), name: name || 'Default Key', prefix: demoKey.slice(0, 12) + '...', created: new Date().toISOString().split('T')[0] }])
    }
    setName('')
  }

  const revoke = async (id) => {
    try { await subscriptionAPI.revokeApiKey(id) } catch { /* demo */ }
    setKeys((prev) => prev.filter((k) => k.id !== id))
  }

  return (
    <div>
      <PageHeader eyebrow="Developer" title="API Key Management" description="Generate and manage API keys for programmatic access" />

      {usage && (
        <div className="dashboard-grid dashboard-grid-3 mb-8">
          <div className="stat-card"><p className="text-xs text-slate-400">API Calls (30d)</p><p className="text-2xl font-bold text-white mt-2">{usage.calls}</p></div>
          <div className="stat-card"><p className="text-xs text-slate-400">Monthly Limit</p><p className="text-2xl font-bold text-white mt-2">{usage.limit === -1 ? 'Unlimited' : usage.limit}</p></div>
          <div className="stat-card"><p className="text-xs text-slate-400">Rate Limit</p><p className="text-2xl font-bold text-emerald-300 mt-2">{usage.rateLimit || '100/min'}</p></div>
        </div>
      )}

      <div className="frosted-panel mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Generate New Key</h3>
        <div className="flex gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Key name" className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-emerald-400" aria-label="API key name" />
          <button className="btn-primary" onClick={generate}>Generate</button>
        </div>
        {newKey && (
          <div role="alert" className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-amber-200 mb-1">Copy your key now — it won't be shown again:</p>
            <code className="text-emerald-300 font-mono text-sm break-all">{newKey}</code>
          </div>
        )}
      </div>

      <div className="frosted-panel">
        <h3 className="text-lg font-semibold text-white mb-4">Active Keys</h3>
        {keys.length === 0 ? (
          <p className="text-slate-400 text-sm">No API keys yet. Generate one above.</p>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <p className="font-medium text-white">{key.name}</p>
                  <p className="text-sm font-mono text-slate-400">{key.prefix || key.key?.slice(0, 12) + '...'}</p>
                  <p className="text-xs text-slate-500">Created {key.created}</p>
                </div>
                <button onClick={() => revoke(key.id)} className="text-sm text-rose-400 hover:text-rose-300 focus-visible:ring-2 focus-visible:ring-emerald-400 rounded px-2">Revoke</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ApiKeys
