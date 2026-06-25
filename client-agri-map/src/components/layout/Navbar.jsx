import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="py-4 px-4 md:px-6 backdrop-blur-xl glass fixed inset-x-0 top-0 z-30 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link to="/" className="text-lg md:text-xl font-bold tracking-tight text-white">
          AgriMap
        </Link>
        <div className="hidden md:flex items-center gap-4 text-slate-300">
          <Link to="/fields" className="transition hover:text-white">Fields</Link>
          <Link to="/satellite" className="transition hover:text-white">Satellite</Link>
          <Link to="/dashboard" className="transition hover:text-white">Dashboard</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-slate-300 hover:text-white transition">Login</Link>
          <Link to="/signup" className="btn-primary text-sm">Sign Up</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
