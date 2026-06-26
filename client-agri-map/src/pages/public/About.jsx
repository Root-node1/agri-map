import React from 'react'
import { motion } from 'framer-motion'
import { FaSeedling, FaLeaf, FaHands, FaGlobe } from 'react-icons/fa'

const About = () => {
  const features = [
    {
      icon: <FaSeedling className="text-4xl" />,
      title: 'Smart Farming',
      description: 'AI-powered crop detection and yield prediction'
    },
    {
      icon: <FaLeaf className="text-4xl" />,
      title: 'Sustainable Agriculture',
      description: 'Carbon credit tracking and environmental monitoring'
    },
    {
      icon: <FaHands className="text-4xl" />,
      title: 'Farmer Support',
      description: 'Access to financing and cooperative management'
    },
    {
      icon: <FaGlobe className="text-4xl" />,
      title: 'Global Impact',
      description: 'Supporting smallholder farmers worldwide'
    }
  ]

  return (
    <div className="page-shell page-shell-dark">
      <div className="text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-4"
        >
          About AgriMap
        </motion.h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Empowering smallholder farmers with AI-powered agricultural intelligence
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="frosted-panel text-center p-6 hover:shadow-xl transition-all"
          >
            <div className="text-emerald-400 mb-4">{feature.icon}</div>
            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-slate-400 text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="frosted-panel p-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">Our Mission</h2>
        <p className="text-slate-300 leading-relaxed text-center">
          AgriMap combines satellite imagery, artificial intelligence, and blockchain technology 
          to help smallholder farmers access green financing, optimize crop yields, and build 
          sustainable farming practices for a better future.
        </p>
      </div>
    </div>
  )
}

export default About
