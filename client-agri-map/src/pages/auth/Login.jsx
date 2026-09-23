import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import { FaFacebook, FaApple } from 'react-icons/fa'
import { FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff, FiLoader } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { useHeroReveal } from '../../lib/motion'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()
  const reveal = useHeroReveal()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const result = await googleLogin(credentialResponse.credential)
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError('Google login failed')
      }
    } catch (err) {
      setError('Google login error')
    }
  }

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-4">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="frosted-panel p-8 rounded-3xl border-white/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400">Sign in to your AgriMap account</p>
          </div>

          {/* Error banner — role=alert so it is announced on submit failure */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="login-error"
                role="alert"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-3 bg-red-500/15 border-red-500/40 text-red-200 px-4 py-3 rounded-2xl text-sm">
                  <FiAlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            variants={reveal.container}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={reveal.item}>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative group">
                <FiMail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-emerald-400"
                  aria-hidden="true"
                />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 transition-colors duration-200 hover:border-white/20 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40 focus-visible:outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={reveal.item}>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative group">
                <FiLock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-emerald-400"
                  aria-hidden="true"
                />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 transition-colors duration-200 hover:border-white/20 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40 focus-visible:outline-none"
                  placeholder="••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 rounded-lg agrimap-focus"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={16} aria-hidden="true" /> : <FiEye size={16} aria-hidden="true" />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={reveal.item} className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/10 bg-white/5 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors rounded agrimap-focus"
              >
                Forgot password?
              </Link>
            </motion.div>

            <motion.div variants={reveal.item}>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? undefined : { y: -1 }}
                whileTap={loading ? undefined : { scale: 0.99 }}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-2xl transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 agrimap-focus"
              >
                {loading ? (
                  <>
                    <FiLoader size={16} className="animate-spin" aria-hidden="true" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </motion.div>
          </motion.form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="space-y-3">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              shape="pill"
              width="100%"
              text="continue_with"
              locale="en"
            />

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 transition-colors duration-200 agrimap-focus"
            >
              <FaFacebook className="text-blue-400" aria-hidden="true" />
              <span className="text-sm text-white">Continue with Facebook</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 transition-colors duration-200 agrimap-focus"
            >
              <FaApple className="text-white" aria-hidden="true" />
              <span className="text-sm text-white">Continue with Apple</span>
            </button>
          </div>

          <p className="text-center text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors rounded agrimap-focus"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
