import React from 'react'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import { useMotionConfig, useCountUp } from '../../lib/motion'

/**
 * StatCard — a single headline metric.
 *
 * Presentation only:
 *  - the numeric value counts up on mount (via useCountUp)
 *  - the icon is decorative (aria-hidden) because the label carries meaning
 *  - trend is announced with an arrow *and* text, never colour alone
 */
const StatCard = ({ icon, label, value, trend, trendLabel, className = '' }) => {
  const { transition } = useMotionConfig()
  const isNumeric = typeof value === 'number'
  const animatedValue = useCountUp(isNumeric ? value : 0)
  const displayValue = isNumeric ? Math.round(animatedValue).toLocaleString() : value
  const trendUp = trend > 0
  const TrendIcon = trendUp ? FiTrendingUp : FiTrendingDown
  return (
    <motion.div
      className={`stat-card rounded-[1.75rem] agrimap-interactive ${className}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition.slow}
    >
      {icon && (
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20 mb-4"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-1.5">
        {label}
      </p>

      <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
        {displayValue}
      </p>

      {trend != null && (
        <span
          className={`inline-flex items-center gap-1 mt-2.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            trendUp
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
          }`}
        >
          <TrendIcon size={12} aria-hidden="true" />
          {/* Explicit direction text so it is not communicated by colour alone */}
          <span className="sr-only">{trendUp ? 'Increased by' : 'Decreased by'}</span>
          {trendUp ? '+' : ''}
          {trend}%{trendLabel ? ` ${trendLabel}` : ''}
        </span>
      )}
    </motion.div>
  )
}

export default StatCard
