import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import {
  FiUser,
  FiMail,
  FiLock,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiLoader,
  FiTruck,
  FiUsers,
  FiTrendingUp,
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { useHeroReveal } from '../../lib/motion'

/* Role picker — each option gets an icon + supporting line so the choice is
   self-explanatory rather than three bare words. */
const ROLES = [
  { value: 'farmer', label: 'Farmer', hint: 'I manage my own fields', icon: FiTruck },
  { value: 'cooperative', label: 'Cooperative', hint: 'I support member farms', icon: FiUsers },
  { value: 'investor', label: 'Investor', hint: 'I fund farm operations', icon: FiTrendingUp },
]

/** Password strength meter — feedback only, no validation logic change. */
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', tone: '' }
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  if (score <= 1) return { score: 1, label: 'Weak password', tone: 'weak' }
  if (score <= 3) return { score: 2, label: 'Fair password', tone: 'fair' }
  return { score: 3, label: 'Strong password', tone: 'strong' }
}

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
  const [showPassword, setShowPassword] = useState(false)
  const { register, googleLogin } = useAuth()
  const navigate = useNavigate()
  const reveal = useHeroReveal()

  const passwordStrength = getPasswordStrength(formData.password)
  const passwordsMatch =
    formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword

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
    const result = await register(userData)

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
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg"
      >
        <div className="frosted-panel overflow-hidden rounded-[2rem] border-white/10 p-0">
          {/* Header — dark, so the heading has real contrast against the form */}
          <div className="bg-gradient-to-br from-emerald-600 via-slate-900 to-slate-950 px-8 py-9 text-center">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              Create Account
            </h1>
            <p className="text-sm text-emerald-100/85">
              Set up your AgriMap access credentials
            </p>
          </div>

          <div className="p-8 space-y-5">
            {/* Error banner — role=alert so it is announced on submit failure */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="signup-error"
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-3 bg-red-500/15 border-red-500/40 text-red-200 p-3.5 rounded-2xl text-sm font-medium">
                    <FiAlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-5"
              variants={reveal.container}
              initial="hidden"
              animate="visible"
            >
              {/* Account type — labelled group, not three mystery buttons */}
              <motion.fieldset variants={reveal.item} className="border-0">
                <legend className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 mb-3">
                  Account Type
                </legend>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map(({ value, label, icon: Icon, hint }) => {
                    const active = formData.role === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: value })}
                        aria-pressed={active}
                        title={hint}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl text-xs font-semibold transition-colors duration-200 agrimap-focus ${
                          active
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <Icon size={17} aria-hidden="true" />
                        {label}
                      </button>
                    )
                  })}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {ROLES.find((r) => r.value === formData.role)?.hint}
                </p>
              </motion.fieldset>

              {/* Full name */}
              <motion.div variants={reveal.item}>
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 mb-2"
                >
                  Full Name
                </label>
                <div className="relative group">
                  <FiUser
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500"
                    aria-hidden="true"
                  />
                  <input
                    id="signup-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl input-floating placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/30 focus-visible:outline-none transition-colors duration-200"
                    placeholder="Lenny Gitonga"
                    required
                  />
                </div>
              </motion.div>

              {/* Email */}
              <motion.div variants={reveal.item}>
                <label
                  htmlFor="signup-email"
                  className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 mb-2"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <FiMail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500"
                    aria-hidden="true"
                  />
                  <input
                    id="signup-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl input-floating placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/30 focus-visible:outline-none transition-colors duration-200"
                    placeholder="name@domain.com"
                    required
                  />
                </div>
              </motion.div>

              {/* Password + strength meter */}
              <motion.div variants={reveal.item}>
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 mb-2"
                >
                  Password
                </label>
                <div className="relative group">
                  <FiLock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500"
                    aria-hidden="true"
                  />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    aria-describedby="signup-password-strength"
                    className="w-full pl-11 pr-12 py-3 rounded-2xl input-floating placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/30 focus-visible:outline-none transition-colors duration-200"
                    placeholder="At least 8 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1 rounded-lg agrimap-focus"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff size={16} aria-hidden="true" /> : <FiEye size={16} aria-hidden="true" />}
                  </button>
                </div>

                {/* Strength meter — colour paired with text, never colour alone */}
                <AnimatePresence>
                  {formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 pt-2.5">
                        <div className="flex-1 flex gap-1" aria-hidden="true">
                          {[1, 2, 3].map((step) => (
                            <span
                              key={step}
                              className="h-1 flex-1 rounded-full transition-colors duration-300"
                              style={{
                                backgroundColor:
                                  passwordStrength.score >= step
                                    ? passwordStrength.tone === 'strong'
                                      ? '#22c55e'
                                      : passwordStrength.tone === 'fair'
                                        ? '#f59e0b'
                                        : '#ef4444'
                                    : 'rgba(148, 163, 184, 0.3)',
                              }}
                            />
                          ))}
                        </div>
                        <span
                          id="signup-password-strength"
                          className="text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap"
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Confirm password — inline match feedback */}
              <motion.div variants={reveal.item}>
                <label
                  htmlFor="signup-confirm"
                  className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative group">
                  <FiLock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500"
                    aria-hidden="true"
                  />
                  <input
                    id="signup-confirm"
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    aria-describedby="signup-confirm-status"
                    className={`w-full pl-11 pr-11 py-3 rounded-2xl input-floating placeholder:text-slate-500 focus:ring-2 focus-visible:outline-none transition-colors duration-200 ${
                      formData.confirmPassword && !passwordsMatch
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30'
                        : 'focus:border-emerald-500 focus:ring-emerald-400/30'
                    }`}
                    placeholder="Re-enter your password"
                    required
                  />
                  {passwordsMatch && (
                    <FiCheck
                      size={16}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500"
                      aria-hidden="true"
                    />
                  )}
                </div>
                {/* Inline error tied to the field via aria-describedby */}
                <AnimatePresence>
                  {formData.confirmPassword && !passwordsMatch && (
                    <motion.p
                      id="signup-confirm-status"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-red-500 dark:text-red-400 mt-2"
                    >
                      Passwords do not match
                    </motion.p>
                  )}
                </AnimatePresence>
                {passwordsMatch && (
                  <p id="signup-confirm-status" className="sr-only">
                    Passwords match
                  </p>
                )}
              </motion.div>

              <motion.div variants={reveal.item}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={loading ? undefined : { y: -1 }}
                  whileTap={loading ? undefined : { scale: 0.99 }}
                  className="w-full btn-primary justify-center disabled:opacity-60 disabled:cursor-not-allowed agrimap-focus"
                >
                  {loading ? (
                    <>
                      <FiLoader size={16} className="animate-spin" aria-hidden="true" />
                      Creating account...
                    </>
                  ) : (
                    'Register Account'
                  )}
                </motion.button>
              </motion.div>
            </motion.form>

            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-[0.65rem] uppercase tracking-[0.35em] font-semibold text-slate-400 bg-slate-900">
                  Third Party
                </span>
              </div>
            </div>

            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google setup failed')}
                theme="filled_black"
                shape="pill"
                width="100%"
              />
            </div>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-emerald-300 font-semibold hover:text-emerald-200 transition-colors rounded agrimap-focus"
              >
                Login Here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Signup
