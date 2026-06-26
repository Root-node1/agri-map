import React, { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  HomeIcon, MapIcon, CpuChipIcon, ChatBubbleLeftRightIcon,
  BanknotesIcon, WalletIcon, CreditCardIcon, KeyIcon,
  Cog6ToothIcon, Bars3Icon, XMarkIcon, SunIcon, MoonIcon,
  ArrowRightOnRectangleIcon, ChartBarIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import SkipLink from '../ui/SkipLink'
import AccessibilityMenu from '../ui/AccessibilityMenu'

const navSections = [
  {
    title: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
      { to: '/fields', label: 'Fields', icon: MapIcon },
      { to: '/heatmap', label: 'Heatmap', icon: ChartBarIcon },
    ],
  },
  {
    title: 'AI Services',
    items: [
      { to: '/ai/crop-detection', label: 'Crop Detection', icon: CpuChipIcon },
      { to: '/ai/soil-analysis', label: 'Soil Analysis', icon: CpuChipIcon },
      { to: '/ai/yield-prediction', label: 'Yield Prediction', icon: CpuChipIcon },
      { to: '/ai/vegetation', label: 'Vegetation Health', icon: CpuChipIcon },
      { to: '/ai/field-analysis', label: 'Field Analysis', icon: CpuChipIcon },
    ],
  },
  {
    title: 'Finance',
    items: [
      { to: '/finance/loans', label: 'Loans', icon: BanknotesIcon },
      { to: '/finance/carbon', label: 'Carbon Market', icon: BanknotesIcon },
      { to: '/finance/tokenize', label: 'Tokenization', icon: BanknotesIcon },
      { to: '/wallet', label: 'Wallet', icon: WalletIcon },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/subscriptions', label: 'Subscriptions', icon: CreditCardIcon },
      { to: '/api-keys', label: 'API Keys', icon: KeyIcon },
      { to: '/settings', label: 'Settings', icon: Cog6ToothIcon },
    ],
  },
]

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-emerald-400 outline-none ${
      isActive ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:bg-white/5 hover:text-white'
    }`

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-[#061b12]/95 backdrop-blur-xl border-r border-white/10 transform transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <Link to="/" className="text-xl font-bold text-white tracking-tight" onClick={onClose}>
            AgriMap
          </Link>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white" aria-label="Close menu">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100%-140px)]">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-500 px-4 mb-2">{section.title}</p>
              <ul className="space-y-1">
                {section.items.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <NavLink to={to} className={linkClass} onClick={onClose}>
                      <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#061b12]/95">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold text-sm">
              {(user?.firstName?.[0] || user?.name?.[0] || 'U').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.firstName || user?.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{user?.role || 'farmer'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleDarkMode}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 text-slate-300 text-sm hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => { logout(); navigate('/login') }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 text-slate-300 text-sm hover:bg-rose-500/20 hover:text-rose-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label="Sign out"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="page-shell page-shell-dark min-h-screen">
      <SkipLink />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex items-center gap-4 px-4 py-3 backdrop-blur-xl bg-[#061b12]/80 border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Open navigation menu"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <NavLink
            to="/chatbot"
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            Assistant
          </NavLink>
          <AccessibilityMenu />
        </header>
        <main id="main-content" className="px-4 py-6 max-w-7xl mx-auto" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
