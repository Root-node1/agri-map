import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import { FaEnvelope, FaLock } from 'react-icons/fa'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
    navigate('/dashboard')
  }

  const handleGoogleSuccess = async (response) => {
    const result = await googleLogin(response)
    if (!result.success) {
      setError(result.error)
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center page-shell page-shell-dark px-4 py-12">
      <div className="mobile-card w-full max-w-md overflow-hidden rounded-[2rem]">
        <div className="bg-gradient-to-br from-green-600 via-slate-950 to-slate-900 px-8 py-10 text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h1>
          <p className="text-sm text-emerald-200/90">Sign in to access your platform dashboard</p>
        </div>
        <div className="p-8 space-y-6">
          {error && (
            <div className="bg-rose-50/10 border border-rose-200/10 text-rose-100 p-3.5 rounded-3xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-3xl input-floating focus:ring-2 focus:ring-emerald-400 outline-none text-slate-100 placeholder:text-slate-500"
                  placeholder="name@domain.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-3xl input-floating focus:ring-2 focus:ring-emerald-400 outline-none text-slate-100 placeholder:text-slate-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn-primary disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-[0.65rem] uppercase tracking-[0.35em] font-semibold text-slate-400 bg-slate-950 px-3">
              Third Party
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google authentication failed')} />
          </div>

          <p className="text-center text-sm text-slate-400 font-light mt-8">
            Need a registration profile?{' '}
            <Link to="/signup" className="text-emerald-300 font-semibold hover:text-white">
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login