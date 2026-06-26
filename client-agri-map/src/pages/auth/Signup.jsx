import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa'

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
    phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup, googleLogin } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const { confirmPassword, ...userData } = formData
    const result = await signup(userData)

    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
    navigate(result.needsProfile ? '/farmer/register' : '/dashboard')
  }

  const handleGoogleSuccess = async (response) => {
    setLoading(true)
    const result = await googleLogin(response)
    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
    navigate(result.needsProfile ? '/farmer/register' : '/dashboard')
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center page-shell page-shell-dark px-4 py-12">
      <div className="mobile-card w-full max-w-md overflow-hidden rounded-[2rem]">
        <div className="bg-gradient-to-br from-green-600 via-slate-950 to-slate-900 px-8 py-10 text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Create Account</h1>
          <p className="text-sm text-emerald-200/90">Establish a digital interface access credentials</p>
        </div>
        <div className="p-8 space-y-5">
          {error && (
            <div className="bg-rose-50/10 border border-rose-200/10 text-rose-100 p-3.5 rounded-3xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 mb-2">Account Type</label>
              <div className="grid grid-cols-3 gap-2">
                {['farmer', 'cooperative', 'investor'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, role })}
                    className={`py-2.5 rounded-2xl text-sm font-medium capitalize transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                      formData.role === role ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-300 border border-white/10'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 mb-2">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-2.5 rounded-3xl input-floating focus:ring-2 focus:ring-emerald-400 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="Lenny Gitonga"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-2.5 rounded-3xl input-floating focus:ring-2 focus:ring-emerald-400 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="name@domain.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 mb-2">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-2.5 rounded-3xl input-floating focus:ring-2 focus:ring-emerald-400 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 mb-2">Confirm Password</label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-2.5 rounded-3xl input-floating focus:ring-2 focus:ring-emerald-400 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full btn-primary disabled:opacity-60">{loading ? 'Creating Credentials...' : 'Register Account'}</button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-[0.65rem] uppercase tracking-[0.35em] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-900 dark:text-slate-300 px-3">
              Third Party
            </div>
          </div>

          <div className="flex justify-center w-full transform hover:scale-[1.01] transition-transform duration-200 mb-4">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google setup failed')} />
          </div>

          <p className="text-center text-sm text-slate-400 font-light">
            Already have an active profile?{' '}
            <Link to="/login" className="text-emerald-300 font-semibold hover:text-white">Login Here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup