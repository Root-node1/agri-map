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
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="hero-panel rounded-[2rem] p-6 md:p-10 overflow-hidden hero-glow">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.95fr] lg:items-center">
              <div className="space-y-8">
                <span className="hero-pill">Smart Farming</span>
                <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight text-gray-950 leading-tight">
                  {t('home.title')}
                </h1>
                <p className="max-w-2xl text-slate-200/85 text-base md:text-lg leading-relaxed">
                  {t('home.subtitle')}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                  <Link to="/register" className="btn-primary w-full sm:w-auto">
                    {t('home.getStarted')}
                    <FaArrowRight className="text-sm" />
                  </Link>
                  <Link to="/about" className="btn-secondary w-full sm:w-auto">
                    {t('home.learnMore')}
                  </Link>
                </div>
              </div>

              <div className="space-y-5">
                <div className="hero-image-box rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_35px_90px_rgba(0,0,0,0.35)]">
                  <img
                    src="https://images.unsplash.com/photo-1499336315816-097655dcfbda?auto=format&fit=crop&w=1200&q=80"
                    alt="African farm landscape with farmers and crops"
                    className="h-72 w-full object-cover sm:h-80 lg:h-[420px]"
                  />
                  <div className="hero-image-overlay text-slate-100 text-sm">
                    Real Kenyan and East African agricultural landscapes captured for local farm users.
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="glass-card rounded-[1.75rem] p-5">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Field operations</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                      Keep every plot, crop and soil reading visible in one adaptive dashboard.
                    </p>
                  </div>
                  <div className="glass-card rounded-[1.75rem] p-5">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Local grower support</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                      Designed for African farms, with clear charts and stronger mobile readability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 max-w-6xl mx-auto text-slate-900 dark:text-slate-100">
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
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home