import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/* ==========================================================================
   AgriMap motion primitives
   Centralised Framer Motion variants so every page animates on the same
   rhythm. Timings mirror the CSS motion tokens in design-tokens.css and the
   "Stagger List" preset in design-system/agrimap/MASTER.md.

   Every variant below collapses to a plain opacity change (or nothing at all)
   when the user prefers-reduced-motion enabled — see useMotionConfig().
   ========================================================================== */

/* --- Easings ------------------------------------------------------------- */
export const EASE_OUT = [0.22, 1, 0.36, 1]
export const EASE_STANDARD = [0.4, 0, 0.2, 1]

/* --- Durations (seconds, Framer Motion uses seconds) --------------------- */
export const DURATION = {
  fast: 0.16,
  base: 0.24,
  slow: 0.32,
  reveal: 0.42,
}

/**
 * Reads the user's motion preference once and hands back ready-made
 * transition objects. Components never need to touch matchMedia directly.
 */
export const useMotionConfig = () => {
  const prefersReducedMotion = useReducedMotion()

  return {
    prefersReducedMotion,
    /** Durations collapse to ~0 when motion is reduced. */
    duration: {
      fast: prefersReducedMotion ? 0 : DURATION.fast,
      base: prefersReducedMotion ? 0 : DURATION.base,
      slow: prefersReducedMotion ? 0 : DURATION.slow,
      reveal: prefersReducedMotion ? 0 : DURATION.reveal,
    },
    transition: {
      fast: { duration: prefersReducedMotion ? 0 : DURATION.fast, ease: EASE_STANDARD },
      base: { duration: prefersReducedMotion ? 0 : DURATION.base, ease: EASE_OUT },
      slow: { duration: prefersReducedMotion ? 0 : DURATION.slow, ease: EASE_OUT },
      reveal: { duration: prefersReducedMotion ? 0 : DURATION.reveal, ease: EASE_OUT },
      spring: prefersReducedMotion
        ? { duration: 0 }
        : { type: 'spring', stiffness: 380, damping: 30, mass: 0.7 },
    },
  }
}

/* --- Page transition ------------------------------------------------------
   Wraps a route's content. A short fade + rise reads as "the page arrived"
   without the jank of a full slide on a data-dense dashboard.             */
export const usePageTransition = () => {
  const { prefersReducedMotion, duration } = useMotionConfig()

  return {
    initial: { opacity: 0, y: prefersReducedMotion ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: prefersReducedMotion ? 0 : -8 },
    transition: { duration: duration.slow, ease: EASE_OUT },
  }
}

/* --- Hero / heading reveal ------------------------------------------------
   Staggered children for a hero block: eyebrow → title → copy → actions.  */
export const useHeroReveal = () => {
  const { prefersReducedMotion, duration } = useMotionConfig()

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
        delayChildren: prefersReducedMotion ? 0 : 0.04,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: duration.reveal, ease: EASE_OUT },
    },
  }

  return { container, item }
}

/* --- Staggered grid / list reveal ----------------------------------------
   The MASTER.md "Stagger List" preset, translated to Framer Motion.
   `step` is intentionally small (60ms) so a 12-card grid still settles
   inside the 300-450ms window.                                            */
export const useStaggerReveal = ({ step = 0.06, delay = 0.05 } = {}) => {
  const { prefersReducedMotion, duration } = useMotionConfig()

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : step,
        delayChildren: prefersReducedMotion ? 0 : delay,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16, scale: prefersReducedMotion ? 1 : 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: duration.reveal, ease: EASE_OUT },
    },
  }

  return { container, item }
}

/* --- Interaction presets -------------------------------------------------- */

/** Hover lift for clickable cards. No layout-shifting scale. */
export const cardHover = {
  rest: { y: 0 },
  hover: { y: -4, transition: { duration: DURATION.base, ease: EASE_OUT } },
}

/** Tactile press feedback for buttons. */
export const buttonPress = {
  whileHover: { y: -1 },
  whileTap: { scale: 0.98 },
}

/** Standard fade for modals, drawers and toasts. */
export const useOverlayMotion = () => {
  const { prefersReducedMotion, duration } = useMotionConfig()

  return {
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: duration.base, ease: EASE_STANDARD },
    },
    panel: {
      initial: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.96, y: prefersReducedMotion ? 0 : 12 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.98, y: prefersReducedMotion ? 0 : 8 },
      transition: { duration: duration.slow, ease: EASE_OUT },
    },
  }
}

/* --- Count-up number ------------------------------------------------------
   Animates a numeric stat from 0 to its value on mount. Respects reduced
   motion by rendering the final value immediately.                        */
export const useCountUp = (target, { durationMs = 900 } = {}) => {
  const prefersReducedMotion = useReducedMotion()
  const numericTarget = typeof target === 'number' && Number.isFinite(target) ? target : null
  const [display, setDisplay] = useState(prefersReducedMotion || numericTarget === null ? target : 0)
  const frameRef = useRef(null)

  useEffect(() => {
    if (numericTarget === null || prefersReducedMotion) {
      setDisplay(target)
      return undefined
    }

    const start = performance.now()
    // Ease-out cubic so the number decelerates into its final value.
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / durationMs, 1)
      setDisplay(numericTarget * easeOutCubic(progress))
      if (progress < 1) frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [numericTarget, durationMs, prefersReducedMotion, target])

  return display
}

export default {
  EASE_OUT,
  EASE_STANDARD,
  DURATION,
  useMotionConfig,
  usePageTransition,
  useHeroReveal,
  useStaggerReveal,
  useOverlayMotion,
  useCountUp,
  cardHover,
  buttonPress,
}
