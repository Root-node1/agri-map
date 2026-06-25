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

    // 🚀 DEVELOPER NOTE: If your backend endpoint is down, swap these lines to bypass:
    // localStorage.setItem('token', 'mock-developer-token'); navigate('/dashboard'); return;
    
    const result = await login(email, password)
    if (!result.success) setError(result.error)
    setLoading(false)
  }

  const handleGoogleSuccess = async (response) => {
    const result = await googleLogin(response)
    if (!result.success) setError(result.error)
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300 px-4 py-12">
      <div className="backdrop-blur-md bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl p-8 w-full max-w-md shadow-xl">
        
        <header className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-sm font-light text-slate-500 dark:text-slate-400">
            Sign in to access your platform dashboard
          </p>
        </header>
        
        {error && (
          <div className="bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 p-3.5 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition duration-200 text-sm font-light"
                placeholder="name@domain.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition duration-200 text-sm font-light"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm tracking-wide py-3 rounded-xl shadow-lg shadow-emerald-500/10 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 mt-2" 
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
            <span className="px-4 bg-white dark:bg-[#0b1329] text-slate-400">
              Third Party
            </span>
          </div>
        </div>

        <div className="flex justify-center w-full transform hover:scale-[1.01] transition-transform duration-200">
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google authentication failed')} />
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-light mt-8">
          Need a registration profile?{' '}
          <Link to="/signup" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login