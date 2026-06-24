import React from 'react'

const TermsConditions = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="glass-card rounded-2xl p-8 mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Terms & Conditions</h1>
        <p className="text-gray-600 dark:text-gray-300">Last updated: January 2024</p>
      </div>

      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-3">
            Acceptance of Terms
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            By using AgriMap, you agree to these terms and conditions. If you do not agree, 
            please do not use our services.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-3">
            User Accounts
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            You are responsible for maintaining the confidentiality of your account credentials. 
            You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-3">
            User Conduct
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            You agree to use AgriMap in compliance with all applicable laws and regulations. 
            You shall not misuse our services or interfere with other users' experience.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-3">
            Contact Us
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            For questions about these terms, contact us at legal@agrimap.com
          </p>
        </div>
      </div>
    </div>
  )
}

export default TermsConditions
