import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'
import Logo from '../common/Logo'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="py-4 px-4 md:px-6 bg-white/95 dark:bg-slate-950/95 border-b border-slate-200/70 dark:border-white/10 fixed inset-x-0 top-0 z-40 shadow-2xl backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          <Logo />
          <span>AgriMap</span>
        </Link>

        <div className="hidden md:flex items-center gap-4 text-slate-700 dark:text-slate-300">
          <Link to="/fields" className="transition hover:text-slate-900 dark:hover:text-white">Fields</Link>
          <Link to="/satellite" className="transition hover:text-slate-900 dark:hover:text-white">Satellite</Link>
          <Link to="/dashboard" className="transition hover:text-slate-900 dark:hover:text-white">Dashboard</Link>
          <Link to="/cooperatives" className="transition hover:text-slate-900 dark:hover:text-white">Cooperatives</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition">Login</Link>
          <Link to="/register" className="btn-primary text-sm">Sign Up</Link>
        </div>

        <button
          className="md:hidden text-slate-900 dark:text-slate-100 hover:text-black/80 dark:hover:text-white transition"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </div>

      {isOpen && (
        <div className="mobile-nav-menu glass border border-white/10 mt-3 rounded-3xl p-5 shadow-[0_30px_90px_rgba(0,0,0,0.2)] md:hidden">
          <div className="flex flex-col gap-4 text-slate-200">
            <Link to="/fields" className="block rounded-2xl px-4 py-3 transition hover:bg-white/10" onClick={() => setIsOpen(false)}>
              Fields
            </Link>
            <Link to="/satellite" className="block rounded-2xl px-4 py-3 transition hover:bg-white/10" onClick={() => setIsOpen(false)}>
              Satellite
            </Link>
            <Link to="/dashboard" className="block rounded-2xl px-4 py-3 transition hover:bg-white/10" onClick={() => setIsOpen(false)}>
              Dashboard
            </Link>
            <Link to="/cooperatives" className="block rounded-2xl px-4 py-3 transition hover:bg-white/10" onClick={() => setIsOpen(false)}>
              Cooperatives
            </Link>
            <Link to="/login" className="block rounded-2xl px-4 py-3 text-emerald-200 transition hover:bg-white/10" onClick={() => setIsOpen(false)}>
              Login
            </Link>
            <Link to="/register" className="btn-primary w-full justify-center text-center" onClick={() => setIsOpen(false)}>
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
