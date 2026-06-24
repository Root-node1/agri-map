import React from 'react'

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="glass-card rounded-2xl p-8 mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-600 dark:text-gray-300">Last updated: January 2024</p>
      </div>

      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-3">
            Information We Collect
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We collect information you provide directly, such as when you create an account, 
            update your profile, or use our services. This may include your name, email address, 
            phone number, and location data.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-3">
            How We Use Your Information
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We use the information we collect to provide, maintain, and improve our services, 
            to communicate with you, and to protect the security of our platform.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-3">
            Data Security
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We implement appropriate technical and organizational measures to protect your 
            personal information against unauthorized access, alteration, or destruction.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-3">
            Contact Us
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at privacy@agrimap.com
          </p>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
