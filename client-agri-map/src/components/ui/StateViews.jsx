import React from 'react'
import { motion } from 'framer-motion'
import { FiInbox, FiAlertTriangle, FiRefreshCw, FiWifiOff } from 'react-icons/fi'
import { useMotionConfig } from '../../lib/motion'

/* ==========================================================================
   EmptyState — replaces raw "No fields found" text.
   UX guidance: "Show helpful message and action", never a blank screen.
   ========================================================================== */
export const EmptyState = ({
  icon: Icon = FiInbox,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}) => {
  const { transition, prefersReducedMotion } = useMotionConfig()

  return (
    <motion.div
      className={`agrimap-state ${className}`}
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition.slow}
    >
      <span className="agrimap-state-icon" aria-hidden="true">
        <Icon size={30} />
      </span>
      <h3 className="agrimap-state-title agrimap-heading">{title}</h3>
      {description && <p className="agrimap-state-copy">{description}</p>}
      {(action || secondaryAction) && (
        <div className="agrimap-state-actions">
          {action}
          {secondaryAction}
        </div>
      )}
    </motion.div>
  )
}

/* ==========================================================================
   ErrorState — always offers a recovery path ("Try again" + help link),
   per the Error Recovery UX guideline.
   ========================================================================== */
export const ErrorState = ({
  title = 'Something went wrong',
  description = 'We could not load this section. Check your connection and try again.',
  onRetry,
  retryLabel = 'Try again',
  helpHref = '/about',
  helpLabel = 'Get help',
  offline = false,
  className = '',
}) => {
  const { prefersReducedMotion } = useMotionConfig()
  const Icon = offline ? FiWifiOff : FiAlertTriangle

  return (
    <motion.div
      className={`agrimap-state agrimap-state-error ${className}`}
      role="alert"
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="agrimap-state-icon agrimap-state-icon-error" aria-hidden="true">
        <Icon size={30} />
      </span>
      <h3 className="agrimap-state-title agrimap-heading">{title}</h3>
      <p className="agrimap-state-copy">{description}</p>
      <div className="agrimap-state-actions">
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-primary agrimap-focus">
            <FiRefreshCw size={15} aria-hidden="true" />
            {retryLabel}
          </button>
        )}
        {helpHref && (
          <a href={helpHref} className="btn-secondary agrimap-focus">
            {helpLabel}
          </a>
        )}
      </div>
    </motion.div>
  )
}

export default EmptyState
