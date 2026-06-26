import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const FarmerProfileSetup = () => {
  const navigate = useNavigate()
  const { user, completeFarmerProfile } = useAuth()
  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    location: user?.location || ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!formData.phone.trim() || !formData.location.trim()) {
      setError('Please provide both phone number and farm location before continuing.')
      return
    }

    setLoading(true)
    const result = await completeFarmerProfile(formData)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="page-shell page-shell-dark min-h-[85vh] px-4 py-10">
      <div className="max-w-3xl mx-auto glass-card rounded-[2rem] p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">Complete your farmer profile</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Finish your registration by sharing the mobile contact and the primary location for your farm.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-rose-200/20 bg-rose-50/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-3xl border border-slate-300 bg-white/90 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="e.g. +254 712 345 678"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Farm Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full rounded-3xl border border-slate-300 bg-white/90 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Village or region, e.g. Kiambu County"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Saving profile…' : 'Continue to dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default FarmerProfileSetup
