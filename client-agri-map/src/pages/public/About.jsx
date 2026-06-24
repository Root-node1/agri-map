import React from 'react'
import { useTranslation } from 'react-i18next'

const About = () => {
  const { t } = useTranslation()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="glass-card rounded-2xl p-8 mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3">{t('about.title')}</h1>
        <p className="text-gray-600 dark:text-gray-300">{t('about.subtitle')}</p>
      </div>

      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-3">
            {t('about.mission')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {t('about.missionDesc')}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-3">
            {t('about.vision')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {t('about.visionDesc')}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-3">
            {t('about.team')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {t('about.teamDesc')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default About
