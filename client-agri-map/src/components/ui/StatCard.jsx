import React from 'react'
import { motion } from 'framer-motion'

const StatCard = ({ icon, label, value, trend, trendLabel, className = '' }) => (
  <motion.div
    className={`stat-card rounded-[1.75rem] ${className}`}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
  >
    {icon && (
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-emerald-500/10 text-emerald-300 mb-4">
        {icon}
      </div>
    )}
    <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
    <p className="text-3xl font-bold text-white">{value}</p>
    {trend != null && (
      <span className="inline-flex mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300">
        {trend > 0 ? '+' : ''}{trend}%{trendLabel ? ` ${trendLabel}` : ''}
      </span>
    )}
  </motion.div>
)

export default StatCard
