import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowRight, FaSeedling, FaLeaf, FaWallet, FaRobot } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'

const Home = () => {
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: <FaSeedling className="text-3xl" />,
      title: 'Crop Detection',
      description: 'Identify crops with 92% accuracy using AI'
    },
    {
      icon: <FaLeaf className="text-3xl" />,
      title: 'Soil Analysis',
      description: 'Get detailed soil health reports'
    },
    {
      icon: <FaWallet className="text-3xl" />,
      title: 'Green Financing',
      description: 'Access loans and carbon credits'
    },
    {
      icon: <FaRobot className="text-3xl" />,
      title: 'AI Assistant',
      description: 'Get instant farming advice from our AI'
    }
  ]

  return (
    <div className="page-shell page-shell-dark">
      {/* Hero Section */}
      <section className="text-center py-16">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-white mb-6"
        >
          🌾 Welcome to AgriMap
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-300 max-w-2xl mx-auto mb-8"
        >
          AI-powered agricultural intelligence for smallholder farmers
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary text-lg">
              Go to Dashboard <FaArrowRight className="inline ml-2" />
            </Link>
          ) : (
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/register" className="btn-primary text-lg">
                Get Started <FaArrowRight className="inline ml-2" />
              </Link>
              <Link to="/login" className="btn-secondary text-lg">
                Sign In
              </Link>
            </div>
          )}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="frosted-panel text-center p-6 hover:shadow-xl transition-all"
            >
              <div className="text-emerald-400 text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
