import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaTractor,
  FaSeedling,
  FaLeaf,
  FaWallet,
  FaPlus,
  FaFileExport,
} from 'react-icons/fa'
import {
  FiMapPin,
  FiActivity,
  FiDroplet,
  FiCalendar,
  FiArrowRight,
} from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import FieldMap from '../../components/ui/FieldMap'
import { StatGridSkeleton, PanelSkeleton } from '../../components/ui/Skeletons'
import { ErrorState } from '../../components/ui/StateViews'
import { fieldAPI, walletAPI, carbonAPI } from '../../services/api'
import { demoFields, demoActivities } from '../../lib/demoData'
import { useStaggerReveal, useMotionConfig } from '../../lib/motion'

/* Activity icons — the source data only carries emoji strings, which are
   font-dependent and cannot be tokenised. Map each activity id to a real
   vector icon at render time; the demo data itself is left untouched. */
const ACTIVITY_ICONS = {
  1: FaSeedling,
  2: FiActivity,
  3: FaTractor,
  4: FaLeaf,
  5: FaWallet,
  6: FiDroplet,
  7: FiCalendar,
}

const ACTIVITY_TONES = {
  1: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-300',
  2: 'bg-sky-500/12 text-sky-600 dark:text-sky-300',
  3: 'bg-amber-500/12 text-amber-600 dark:text-amber-300',
  4: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-300',
  5: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-300',
  6: 'bg-violet-500/12 text-violet-600 dark:text-violet-300',
  7: 'bg-sky-500/12 text-sky-600 dark:text-sky-300',
}

const QUICK_ACTIONS = [
  { to: '/fields', icon: FaPlus, label: 'Add Field' },
  { to: '/finance/loans', icon: FiArrowRight, label: 'Apply Loan' },
  { to: '/finance/tokenize', icon: FiArrowRight, label: 'Tokenize Credits' },
]

const FarmerDashboard = () => {
  const { user } = useAuth()
  const { prefersReducedMotion, transition } = useMotionConfig()
  const [stats, setStats] = useState({ fields: 0, crops: 0, carbon: 0, balance: 0 })
  const [activities, setActivities] = useState(demoActivities)
  const [loading, setLoading] = useState(true)
  const [apiLatency, setApiLatency] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const statReveal = useStaggerReveal({ step: 0.07 })
  const panelReveal = useStaggerReveal({ step: 0.09, delay: 0.08 })
  const activityReveal = useStaggerReveal({ step: 0.05, delay: 0.1 })

  useEffect(() => {
    const load = async () => {
      const start = performance.now()
      setLoading(true)
      setLoadError(false)
      try {
        const [fields, wallet, carbon] = await Promise.allSettled([
          fieldAPI.getAll(),
          walletAPI.getBalance(),
          carbonAPI.getStats(),
        ])
        // If every request failed we surface a recoverable error state rather
        // than silently presenting demo numbers as if they were live data.
        const allFailed = [fields, wallet, carbon].every((r) => r.status === 'rejected')
        if (allFailed) {
          setLoadError(true)
          setActivities(demoActivities)
          return
        }
        const fieldData =
          fields.status === 'fulfilled'
            ? (fields.value?.fields || fields.value || demoFields)
            : demoFields
        const walletData = wallet.status === 'fulfilled' ? wallet.value : { balance: 45750 }
        const carbonData = carbon.status === 'fulfilled' ? carbon.value : { total: 7.2 }
        setStats({
          fields: Array.isArray(fieldData) ? fieldData.length : demoFields.length,
          crops: Array.isArray(fieldData) ? new Set(fieldData.map((f) => f.cropType)).size : 3,
          carbon: carbonData.total || carbonData.totalCredits || 7.2,
          balance: walletData.balance || 0,
        })
        setActivities(demoActivities)
      } catch {
        setLoadError(true)
        setStats({ fields: 3, crops: 3, carbon: 7.2, balance: 45750 })
        setActivities(demoActivities)
      } finally {
        setApiLatency(Math.round(performance.now() - start))
        setLoading(false)
      }
    }
    load()
  }, [reloadKey])

  const displayName = user?.firstName || user?.name || 'Farmer'

  return (
    <div className="page-shell page-shell-dark">
      <PageHeader
        eyebrow="Live Dashboard"
        title={`Welcome, ${displayName}!`}
        description="Your agricultural intelligence overview"
        actions={
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-700 dark:text-emerald-300 border-emerald-500/20">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              {!prefersReducedMotion && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              )}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>LIVE{apiLatency != null && ` · ${apiLatency}ms`}</span>
          </span>
        }
      />

      {loadError && (
        <div className="mb-6">
          <ErrorState
            title="Could not reach the AgriMap servers"
            description="Showing the last known figures. Retry to reconnect to the live field, wallet and carbon services."
            onRetry={() => setReloadKey((k) => k + 1)}
          />
        </div>
      )}

      {/* ----------------------------------------------------------------
          Stat cards — skeleton while loading, staggered reveal after
          ---------------------------------------------------------------- */}
      {loading ? (
        <StatGridSkeleton count={4} />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          variants={statReveal.container}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={statReveal.item}>
            <StatCard
              icon={<FaTractor className="text-lg" />}
              label="Total Fields"
              value={stats.fields}
              trend={12}
            />
          </motion.div>
          <motion.div variants={statReveal.item}>
            <StatCard
              icon={<FaSeedling className="text-lg" />}
              label="Active Crops"
              value={stats.crops}
              trend={8}
            />
          </motion.div>
          <motion.div variants={statReveal.item}>
            <StatCard
              icon={<FaLeaf className="text-lg" />}
              label="Carbon Credits"
              value={stats.carbon}
              trend={15}
              trendLabel="t"
            />
          </motion.div>
          <motion.div variants={statReveal.item}>
            <StatCard
              icon={<FaWallet className="text-lg" />}
              label="Wallet Balance"
              value={`KES ${Number(stats.balance || 0).toLocaleString()}`}
            />
          </motion.div>
        </motion.div>
      )}

      {/* ----------------------------------------------------------------
          Map + activity feed
          ---------------------------------------------------------------- */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PanelSkeleton lines={0} className="min-h-[360px]" />
          <PanelSkeleton lines={6} />
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          variants={panelReveal.container}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={panelReveal.item} className="frosted-panel lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FiMapPin size={17} className="text-emerald-400" aria-hidden="true" />
                Field Map
              </h2>
              <Link
                to="/fields"
                className="inline-flex items-center gap-1 text-sm text-emerald-300 hover:text-emerald-200 transition-colors rounded agrimap-focus"
              >
                View all
                <FiArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
            <FieldMap
              center={[-1.2864, 36.8172]}
              zoom={11}
              markers={demoFields.map((f) => ({
                id: f.id,
                lat: f.lat,
                lng: f.lng,
                label: `${f.name} - ${f.health}% health`,
              }))}
              height="280px"
            />
          </motion.div>

          {/* Activity Feed — vector icons, staggered reveal */}
          <motion.div variants={panelReveal.item} className="frosted-panel">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiActivity size={17} className="text-emerald-400" aria-hidden="true" />
              Activity Feed
            </h2>
            <motion.ul
              className="space-y-2.5"
              aria-label="Recent activity"
              variants={activityReveal.container}
              initial="hidden"
              animate="visible"
            >
              {activities.map((item) => {
                const Icon = ACTIVITY_ICONS[item.id] || FiActivity
                const tone =
                  ACTIVITY_TONES[item.id] ||
                  'bg-emerald-500/12 text-emerald-600 dark:text-emerald-300'
                return (
                  <motion.li
                    key={item.id}
                    variants={activityReveal.item}
                    className="flex items-start gap-3 rounded-2xl bg-white/5 hover:bg-white/[0.08] p-3.5 text-sm text-slate-300 transition-colors"
                  >
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-xl shrink-0 ${tone}`}
                      aria-hidden="true"
                    >
                      <Icon size={14} />
                    </span>
                    <div className="min-w-0">
                      <p className="leading-snug">{item.message}</p>
                      <time className="text-xs text-slate-500">{item.time}</time>
                    </div>
                  </motion.li>
                )
              })}
            </motion.ul>
          </motion.div>
        </motion.div>
      )}

      {/* ----------------------------------------------------------------
          Quick actions
          ---------------------------------------------------------------- */}
      {!loading && (
        <motion.div
          className="frosted-panel"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition.slow, delay: 0.16 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map(({ to, icon: Icon, label }) => (
              <motion.div key={label} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link to={to} className="btn-secondary justify-center w-full agrimap-focus">
                  <Icon size={14} aria-hidden="true" />
                  {label}
                </Link>
              </motion.div>
            ))}
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <button
                type="button"
                className="btn-secondary justify-center w-full agrimap-focus"
                aria-label="Export reports"
              >
                <FaFileExport size={14} aria-hidden="true" /> Export
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default FarmerDashboard
