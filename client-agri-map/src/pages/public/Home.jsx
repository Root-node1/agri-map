import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowRight } from 'react-icons/fa'
import {
  FiTarget,
  FiLayers,
  FiTrendingUp,
  FiMessageSquare,
  FiMap,
  FiShield,
  FiArrowRight as FiArrowRightLine,
} from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { useHeroReveal, useStaggerReveal } from '../../lib/motion'

/* Feature list — vector icons only (no emoji-as-icons) with a per-feature
   accent so the grid reads as four distinct capabilities, not four clones. */
const FEATURES = [
  {
    icon: FiTarget,
    accent: 'emerald',
    title: 'Crop Detection',
    description: 'Identify what is growing across your plots with 92% accuracy using satellite and AI imagery.',
  },
  {
    icon: FiLayers,
    accent: 'sky',
    title: 'Soil Analysis',
    description: 'Get nutrient, pH and organic-matter readings translated into plain-language field actions.',
  },
  {
    icon: FiTrendingUp,
    accent: 'amber',
    title: 'Green Financing',
    description: 'Unlock loans and carbon credit payouts backed by verified field and yield data.',
  },
  {
    icon: FiMessageSquare,
    accent: 'violet',
    title: 'AI Assistant',
    description: 'Ask farming questions in English or Swahili and get answers grounded in your own records.',
  },
]

/* Trust row — concrete proof points instead of generic marketing copy. */
const TRUST_SIGNALS = [
  { icon: FiMap, label: 'Field mapping', value: 'GPS-accurate boundaries' },
  { icon: FiShield, label: 'Data ownership', value: 'Your records stay yours' },
  { icon: FiTrendingUp, label: 'Verified payouts', value: 'Carbon credits, auditable' },
]

/* Mirrors the "Enterprise Gateway" pattern in MASTER.md: the visitor picks
   their path (farmer / cooperative) rather than reading one generic pitch. */
const PATHS = [
  {
    icon: FiTarget,
    kicker: 'I am a farmer',
    title: 'Map and measure my plots',
    copy: 'Register your fields, track crop health through the season, and build the data record lenders ask for.',
    to: '/register',
    cta: 'Start as a farmer',
  },
  {
    icon: FiLayers,
    kicker: 'I am a cooperative',
    title: 'Oversee member fields',
    copy: 'Aggregate member plots, monitor regional health trends, and manage shared financing and carbon programmes.',
    to: '/cooperatives',
    cta: 'Explore cooperatives',
  },
]

const ACCENT_STYLES = {
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
  sky: 'bg-sky-500/10 text-sky-300 border-sky-500/25',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
  violet: 'bg-violet-500/10 text-violet-300 border-violet-500/25',
}

const Home = () => {
  const { isAuthenticated } = useAuth()
  const hero = useHeroReveal()
  const featureReveal = useStaggerReveal({ step: 0.07 })
  const pathReveal = useStaggerReveal({ step: 0.08, delay: 0.08 })
  const trustReveal = useStaggerReveal({ step: 0.06 })

  return (
    <div className="page-shell page-shell-dark">
      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* ----------------------------------------------------------------
            Hero
            ---------------------------------------------------------------- */}
        <motion.section
          className="text-center pt-14 pb-16 md:pt-20 md:pb-20"
          variants={hero.container}
          initial="hidden"
          animate="visible"
        >
          <motion.span variants={hero.item} className="hero-pill mb-6 inline-flex">
            Agricultural intelligence for Kenya
          </motion.span>

          <motion.h1
            variants={hero.item}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
          >
            Welcome to{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-green-500 bg-clip-text text-transparent">
              AgriMap
            </span>
          </motion.h1>

          <motion.p
            variants={hero.item}
            className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-9 leading-relaxed"
          >
            AI-powered agricultural intelligence for smallholder farmers and the
            cooperatives that support them.
          </motion.p>

          <motion.div
            variants={hero.item}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {isAuthenticated ? (
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/dashboard"
                  className="btn-primary text-base agrimap-focus"
                >
                  Go to Dashboard
                  <FaArrowRight size={14} aria-hidden="true" />
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/register" className="btn-primary text-base agrimap-focus">
                    Get Started
                    <FaArrowRight size={14} aria-hidden="true" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/login" className="btn-secondary text-base agrimap-focus">
                    Sign In
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Trust signals sit directly under the primary CTA */}
          <motion.ul
            variants={trustReveal.container}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-14"
            aria-label="Why farmers choose AgriMap"
          >
            {TRUST_SIGNALS.map(({ icon: Icon, label, value }) => (
              <motion.li
                key={label}
                variants={trustReveal.item}
                className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border border-white/10 bg-white/5"
              >
                <Icon size={18} className="text-emerald-400" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {label}
                </span>
                <span className="text-sm text-slate-200 text-center">{value}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.section>

        {/* ----------------------------------------------------------------
            Features
            ---------------------------------------------------------------- */}
        <section className="py-12" aria-labelledby="features-heading">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            className="text-center mb-10"
          >
            <span className="agrimap-eyebrow block mb-3">Platform</span>
            <h2
              id="features-heading"
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
            >
              Key Features
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Four tools that turn scattered field records into decisions you can act on.
            </p>
          </motion.div>

          <motion.div
            variants={featureReveal.container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {FEATURES.map(({ icon: Icon, accent, title, description }) => (
              <motion.article
                key={title}
                variants={featureReveal.item}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="frosted-panel text-left p-6 hover:border-emerald-500/30 transition-colors agrimap-focus"
              >
                <span
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl border mb-5 ${ACCENT_STYLES[accent]}`}
                  aria-hidden="true"
                >
                  <Icon size={22} />
                </span>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        {/* ----------------------------------------------------------------
            Path selection — "I am a..." per the Enterprise Gateway pattern
            ---------------------------------------------------------------- */}
        <section className="py-12" aria-labelledby="paths-heading">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            className="text-center mb-10"
          >
            <span className="agrimap-eyebrow block mb-3">Get started</span>
            <h2
              id="paths-heading"
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
            >
              Choose your path
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              AgriMap looks different depending on how you farm.
            </p>
          </motion.div>

          <motion.div
            variants={pathReveal.container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {PATHS.map(({ icon: Icon, kicker, title, copy, to, cta }) => (
              <motion.div key={title} variants={pathReveal.item} whileHover={{ y: -4 }}>
                <Link
                  to={to}
                  className="frosted-panel block h-full p-7 hover:border-emerald-500/40 transition-colors group agrimap-focus"
                >
                  <span
                    className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 mb-5"
                    aria-hidden="true"
                  >
                    <Icon size={22} />
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 mb-2">
                    {kicker}
                  </p>
                  <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">{copy}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 group-hover:text-emerald-200 transition-colors">
                    {cta}
                    <FiArrowRightLine
                      size={15}
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ----------------------------------------------------------------
            Closing CTA
            ---------------------------------------------------------------- */}
        {!isAuthenticated && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            className="frosted-panel text-center px-6 py-12 mt-6 border-emerald-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-3">
              Ready to map your first field?
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto mb-7 text-sm sm:text-base">
              Create an account in under a minute. No payment details required to start.
            </p>
            <motion.div
              className="flex flex-wrap justify-center gap-4"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/register" className="btn-primary agrimap-focus">
                Create free account
                <FaArrowRight size={14} aria-hidden="true" />
              </Link>
            </motion.div>
          </motion.section>
        )}
      </div>
    </div>
  )
}

export default Home
