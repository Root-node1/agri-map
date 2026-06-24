import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaArrowRight, FaSeedling, FaTractor, FaChartLine } from 'react-icons/fa'

const Home = () => {
  const { t } = useTranslation()

  const features = [
    { 
      icon: <FaSeedling className="text-3xl text-green-500" />, 
      title: t('home.features.smartFarming'), 
      desc: t('home.features.smartFarmingDesc') 
    },
    { 
      icon: <FaTractor className="text-3xl text-green-500" />, 
      title: t('home.features.equipment'), 
      desc: t('home.features.equipmentDesc') 
    },
    { 
      icon: <FaChartLine className="text-3xl text-green-500" />, 
      title: t('home.features.analytics'), 
      desc: t('home.features.analyticsDesc') 
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center mx-4 my-4 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/85 to-blue-800/75 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Agriculture"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 w-full px-6 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
              {t('home.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/signup" className="btn-primary px-8 py-3 text-base">
                {t('home.getStarted')} <FaArrowRight className="text-sm" />
              </Link>
              <Link to="/about" className="btn-secondary px-8 py-3 text-base">
                {t('home.learnMore')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('home.whyChoose')}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="glass-card rounded-xl p-8 text-center hover:shadow-lg transition-all">
                <div className="inline-flex p-4 bg-green-50 dark:bg-green-900/20 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
