import React from 'react'
import { Link } from 'react-router-dom'
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa'

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="mx-4 mb-4 mt-8 glass rounded-3xl px-6 py-8 backdrop-blur-xl border border-white/10">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-slate-300">
        <div>
          <h3 className="font-bold text-lg mb-3">AgriMap</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Smart farming solutions for modern agriculture
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition">Home</Link></li>
            <li><Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition">About</Link></li>
            <li><Link to="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition">Privacy</Link></li>
            <li><Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition">Terms</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>info@agrimap.com</li>
            <li>+1 (555) 123-4567</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Follow Us</h4>
          <div className="flex gap-4 text-xl">
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition"><FaTwitter /></a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition"><FaLinkedin /></a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition"><FaGithub /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        &copy; {year} AgriMap. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
