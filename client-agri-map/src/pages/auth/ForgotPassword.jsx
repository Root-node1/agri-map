import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FaEnvelope } from 'react-icons/fa'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { forgotPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await forgotPassword(email)
    setLoading(false)
    if (result.success) setSuccess(true)
    else setError(result.error)
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center page-shell page-shell-dark px-4 py-12">
      <div className="mobile-card w-full max-w-md overflow-hidden rounded-[2rem]">
        <div className="bg-gradient-to-br from-green-600 via-slate-950 to-slate-900 px-8 py-10 text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Reset Password</h1>
          <p className="text-sm text-emerald-200/90">Enter your email to receive reset instructions</p>
        </div>
        <div className="p-8">
          {success ? (
            <div role="alert" className="text-center space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 p-4 rounded-3xl text-sm">
                If an account exists for {email}, you will receive password reset instructions shortly.
              </div>
              <Link to="/login" className="btn-primary inline-flex">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div role="alert" className="bg-rose-50/10 border border-rose-200/10 text-rose-100 p-3.5 rounded-3xl text-sm">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="reset-email" className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" aria-hidden="true" />
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-3xl input-floating focus:ring-2 focus:ring-emerald-400 outline-none text-slate-100"
                    placeholder="name@domain.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <button type="submit" className="w-full btn-primary disabled:opacity-60" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <p className="text-center text-sm text-slate-400">
                <Link to="/login" className="text-emerald-300 font-semibold hover:text-white">Back to Login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
