import React from 'react'

const PrivacyPolicy = () => {
  const policies = [
    {
      title: "Information We Collect",
      desc: "We collect information you provide directly, such as when you create an account, update your profile, or use our services. This may include your name, email address, phone number, and location data."
    },
    {
      title: "How We Use Your Information",
      desc: "We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to protect the security of our platform."
    },
    {
      title: "Data Security",
      desc: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, or destruction."
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Document Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-8 mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-xs tracking-wider text-slate-500 dark:text-slate-400 font-medium uppercase">
            Last updated: January 2024
          </p>
        </div>

        {/* Core Provisions */}
        <div className="space-y-10">
          {policies.map((policy, index) => (
            <div key={index} className="group relative grid md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-1">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight group-hover:text-emerald-500 transition-colors duration-200">
                  {policy.title}
                </h2>
              </div>
              <div className="md:col-span-2">
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light">
                  {policy.desc}
                </p>
              </div>
            </div>
          ))}

          {/* Footer Card */}
          <div className="mt-12 bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/50 rounded-xl p-6 text-center">
            <h3 className="text-sm font-semibold mb-1 text-slate-900 dark:text-white">Contact Administration</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
              Inquiries regarding personal data handling rules can be directed to{" "}
              <a href="mailto:privacy@agrimap.com" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                privacy@agrimap.com
              </a>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default PrivacyPolicy