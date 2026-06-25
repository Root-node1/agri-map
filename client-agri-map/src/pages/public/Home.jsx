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
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center mx-4 my-4 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-slate-900/80 to-blue-950/75 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Agriculture Management"
            className="w-full h-full object-cover scale-105 animate-subtle-zoom"
          />
        </div>
        
        <div className="relative z-10 w-full px-6 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              {t('home.title')}
            </h1>
            <p className="text-base md:text-xl text-slate-200/90 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <Link 
                to="/signup" 
                className="group inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                {t('home.getStarted')}
                <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link 
                to="/about" 
                className="backdrop-blur-md bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide transition-all duration-300 transform hover:-translate-y-0.5"
              >
                {t('home.learnMore')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 block">
            Capabilities
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('home.whyChoose')}
          </h2>
          <div className="h-1 w-12 bg-emerald-500 mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative backdrop-blur-md bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl p-8 hover:shadow-xl dark:hover:shadow-emerald-950/20 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="inline-flex p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl mb-6 transition-colors duration-300 group-hover:bg-emerald-500 group-hover:text-white text-emerald-500">
                {React.cloneElement(feature.icon, { className: 'text-2xl transition-colors duration-300 group-hover:text-slate-950' })}
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home