import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaArrowRight, FaSeedling, FaTractor, FaChartLine } from 'react-icons/fa'

const Home = () => {
  const { t } = useTranslation()

  const features = [
    {
      icon: <FaSeedling className="text-2xl text-emerald-500" />,
      title: t('home.features.smartFarming'),
      desc: t('home.features.smartFarmingDesc')
    },
    {
      icon: <FaTractor className="text-2xl text-emerald-500" />,
      title: t('home.features.equipment'),
      desc: t('home.features.equipmentDesc')
    },
    {
      icon: <FaChartLine className="text-2xl text-emerald-500" />,
      title: t('home.features.analytics'),
      desc: t('home.features.analyticsDesc')
    }
  ]

  return (
    <div className="page-shell page-shell-dark">
      <section className="relative min-h-[88vh] flex items-center px-4 pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.24),_transparent_35%),linear-gradient(180deg,_rgba(4,17,11,0.92),_rgba(7,23,16,0.96))]" />
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8">
          <div className="hero-panel rounded-[2rem] p-8 md:p-12 overflow-hidden hero-glow">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <span className="hero-pill mb-5 inline-flex">Smart Farming</span>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
                  {t('home.title')}
                </h1>
                <p className="max-w-2xl text-slate-200/80 text-base md:text-lg leading-relaxed mb-8">
                  {t('home.subtitle')}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/signup" className="btn-primary">
                    {t('home.getStarted')}
                    <FaArrowRight className="text-sm" />
                  </Link>
                  <Link to="/about" className="btn-secondary">
                    {t('home.learnMore')}
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block w-full max-w-md rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_50px_120px_rgba(0,0,0,0.45)]">
                <div className="bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.35),_transparent_25%)] h-64 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }} />
                <div className="bg-slate-950/85 p-6">
                  <div className="text-slate-400 text-xs uppercase tracking-[0.3em] mb-4">Field Overview</div>
                  <div className="grid gap-4">
                    <div className="rounded-3xl bg-slate-900/80 p-4 border border-white/10">
                      <div className="text-sm text-slate-400">Crop health</div>
                      <div className="mt-2 text-2xl font-bold text-white">89%</div>
                    </div>
                    <div className="rounded-3xl bg-slate-900/80 p-4 border border-white/10">
                      <div className="text-sm text-slate-400">Soil quality</div>
                      <div className="mt-2 text-2xl font-bold text-white">Good</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 max-w-6xl mx-auto text-slate-100">
        <div className="text-center mb-12">
          <span className="section-title text-emerald-400 text-xs tracking-[0.35em] mb-3 inline-block">Capabilities</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{t('home.whyChoose')}</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="stat-card rounded-[2rem] p-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-emerald-500/15 text-emerald-300 mb-5">
                {React.cloneElement(feature.icon, { className: 'text-2xl' })}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-300 leading-relaxed text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home