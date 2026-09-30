import React, { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { FaBars, FaTimes, FaSeedling, FaMapMarkedAlt, FaChartPie, FaUsers } from 'react-icons/fa'
import { useUser } from '../../contexts/UserContext'

const LINKS = [
  { to: '/fields', label: 'Fields', icon: FaMapMarkedAlt },
  { to: '/dashboard', label: 'Dashboard', icon: FaChartPie },
  { to: '/cooperatives', label: 'Cooperatives', icon: FaUsers },
]

const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`

const initials = (name = '') =>
  name.split(' ').filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase()

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, resetUser } = useUser()
  const { pathname } = useLocation()

  const handleReset = () => {
    resetUser()
    window.location.href = '/'
  }

  // close the mobile menu after navigating
  useEffect(() => setIsOpen(false), [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="site-nav" data-scrolled={scrolled}>
      <nav className="site-nav-inner" aria-label="Main">
        <Link to="/" className="nav-brand">
          <span className="nav-brand-mark" aria-hidden="true">
            <FaSeedling size={18} />
          </span>
          <span>Agri<span className="nav-brand-accent">Map</span></span>
        </Link>

        <div className="nav-links">
          {LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} className={linkClass}>{label}</NavLink>
          ))}
        </div>

        <div className="nav-user">
          {user && (
            <>
              <span className="nav-avatar" aria-hidden="true">{initials(user.name)}</span>
              <span className="nav-greeting">Hello, <strong>{user.name}</strong></span>
              <button type="button" onClick={handleReset} className="nav-switch">
                Switch User
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((o) => !o)}
        >
          {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </nav>

      {isOpen && (
        <div className="nav-menu md:hidden">
          {LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon size={16} aria-hidden="true" /> {label}
            </NavLink>
          ))}
          {user && (
            <div className="nav-menu-footer">
              <span className="nav-greeting">Hello, <strong>{user.name}</strong></span>
              <button type="button" onClick={handleReset} className="nav-switch">
                Switch User
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

export default Navbar