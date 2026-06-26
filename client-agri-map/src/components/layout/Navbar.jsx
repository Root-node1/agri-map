import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import AccessibilityMenu from '../ui/AccessibilityMenu'

const Navbar = () => {
  const { isAuthenticated, user } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <nav className="py-4 px-4 md:px-6 backdrop-blur-xl glass fixed inset-x-0 top-0 z-30 shadow-2xl" aria-label="Site navigation">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link to="/" className="text-lg md:text-xl font-bold tracking-tight text-white focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg">
          AgriMap
        </Link>
        <div className="hidden md:flex items-center gap-6 text-slate-300">
          <Link to="/about" className="transition hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400 rounded">About</Link>
          <Link to="/subscriptions" className="transition hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400 rounded">Pricing</Link>
          {isAuthenticated && (
            <>
              <Link to="/fields" className="transition hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400 rounded">Fields</Link>
              <Link to="/dashboard" className="transition hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400 rounded">Dashboard</Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-300 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>
          <AccessibilityMenu />
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary text-sm">
              {user?.firstName || user?.name || 'Dashboard'}
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 hover:text-white transition text-sm hidden sm:inline focus-visible:ring-2 focus-visible:ring-emerald-400 rounded">Login</Link>
              <Link to="/signup" className="btn-primary text-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
