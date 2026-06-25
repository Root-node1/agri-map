import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="bg-white dark:bg-gray-900 shadow">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold text-green-600">AgriMap</Link>
          </div>
          <div className="hidden md:flex space-x-4">
            <Link to="/about" className="text-gray-700 dark:text-gray-200 hover:text-green-600">About</Link>
            <Link to="/fields" className="text-gray-700 dark:text-gray-200 hover:text-green-600">Fields</Link>
            <Link to="/satellite" className="text-gray-700 dark:text-gray-200 hover:text-green-600">Satellite</Link>
            <Link to="/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-green-600">Dashboard</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-gray-700 dark:text-gray-200 hover:text-green-600">Login</Link>
            <Link to="/signup" className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Sign up</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
