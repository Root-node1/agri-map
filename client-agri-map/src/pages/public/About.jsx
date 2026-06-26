import React from 'react'
import { useTranslation } from 'react-i18next'

const About = () => {
  const { t } = useTranslation()

  const sections = [
    { key: 'mission', title: t('about.mission'), desc: t('about.missionDesc') },
    { key: 'vision', title: t('about.vision'), desc: t('about.visionDesc') },
    { key: 'team', title: t('about.team'), desc: t('about.teamDesc') }
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Header */}
        <div className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 p-8 md:p-12 mb-12 shadow-xl text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400 mb-3 block">
            Who We Are
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            {t('about.title')}
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto font-light leading-relaxed text-sm md:text-base">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Dynamic Structural Grid */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {sections.map((section) => (
            <div 
              key={section.key}
              className="flex flex-col h-full bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-8 hover:shadow-lg transition-all duration-300"
            >
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1 block">
                {section.key}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                {section.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light flex-grow">
                {section.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default About