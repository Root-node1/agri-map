import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { FaSun, FaMoon, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa'
import Logo from '../common/Logo'

const Navbar = () => {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/privacy', label: t('nav.privacy') },
    { path: '/terms', label: t('nav.terms') },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 mx-4 my-3 glass rounded-2xl px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <Logo />
          <span className="text-gray-900 dark:text-white">
            Agri<span className="text-green-500">Map</span>
          </span>
        </Link>

        <button 
          className="md:hidden text-2xl text-gray-700 dark:text-gray-300"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`${mobileOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row absolute md:relative top-full left-0 right-0 md:top-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-md md:bg-transparent p-6 md:p-0 rounded-2xl md:rounded-none shadow-lg md:shadow-none gap-4 md:gap-8 items-center mt-2 md:mt-0`}>
          {navLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          
          {user ? (
            <>
              <Link to="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-green-600 transition">
                {t('nav.dashboard')}
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">{user.email}</span>
                <button 
                  onClick={handleLogout} 
                  className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition"
                  aria-label={t('nav.logout')}
                >
                  <FaSignOutAlt />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 transition"
                onClick={() => setMobileOpen(false)}
              >
                {t('nav.login')}
              </Link>
              <Link 
                to="/signup" 
                className="btn-primary text-sm px-5 py-2"
                onClick={() => setMobileOpen(false)}
              >
                {t('nav.signup')}
              </Link>
            </>
          )}
          
          <button 
            onClick={toggleDarkMode} 
            className="text-gray-700 dark:text-gray-300 hover:text-green-600 transition text-xl"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
