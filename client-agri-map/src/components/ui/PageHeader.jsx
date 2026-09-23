import React from 'react'
import { motion } from 'framer-motion'
import { useMotionConfig } from '../../lib/motion'

/**
 * PageHeader — the shared title block for authenticated pages.
 * Fades and rises once on mount so every route feels like it "arrived".
 */
const PageHeader = ({ eyebrow, title, description, actions }) => {
  const { prefersReducedMotion, transition } = useMotionConfig()

  return (
    <motion.div
      className="glass-card rounded-[2rem] p-6 md:p-8 mb-8"
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition.slow}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <span className="hero-pill mb-3 inline-flex text-[0.65rem]">{eyebrow}</span>
          )}
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-slate-300 mt-2 text-sm md:text-base leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </motion.div>
  )
}

export default PageHeader
