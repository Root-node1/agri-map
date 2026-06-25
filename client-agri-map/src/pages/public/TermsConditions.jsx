import React from 'react'

const TermsConditions = () => {
  const terms = [
    {
      title: "Acceptance of Terms",
      desc: "By using AgriMap, you agree to these terms and conditions. If you do not agree, please do not use our services."
    },
    {
      title: "User Accounts",
      desc: "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account."
    },
    {
      title: "User Conduct",
      desc: "You agree to use AgriMap in compliance with all applicable laws and regulations. You shall not misuse our services or interfere with other users' experience."
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Document Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-8 mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
            Terms & Conditions
          </h1>
          <p className="text-xs tracking-wider text-slate-500 dark:text-slate-400 font-medium uppercase">
            Last updated: January 2024
          </p>
        </div>

        {/* Core Provisions */}
        <div className="space-y-10">
          {terms.map((term, index) => (
            <div key={index} className="group relative grid md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-1">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight group-hover:text-emerald-500 transition-colors duration-200">
                  {term.title}
                </h2>
              </div>
              <div className="md:col-span-2">
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light">
                  {term.desc}
                </p>
              </div>
            </div>
          ))}

          {/* Footer Card */}
          <div className="mt-12 bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/50 rounded-xl p-6 text-center">
            <h3 className="text-sm font-semibold mb-1 text-slate-900 dark:text-white">Legal Framework</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
              For administrative questions regarding compliance terms, contact{" "}
              <a href="mailto:legal@agrimap.com" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                legal@agrimap.com
              </a>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default TermsConditions