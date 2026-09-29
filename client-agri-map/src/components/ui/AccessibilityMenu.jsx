import React, { useState, useEffect } from 'react'
import { FaUniversalAccess, FaFont, FaAdjust } from 'react-icons/fa'
import { useTheme } from '../../contexts/ThemeContext'

const AccessibilityMenu = () => {
  const { darkMode, toggleDarkMode } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('fontSize')
    return saved ? parseInt(saved) : 16
  })
  const [highContrast, setHighContrast] = useState(() => {
    const saved = localStorage.getItem('highContrast')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`
    localStorage.setItem('fontSize', fontSize.toString())
  }, [fontSize])

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
    localStorage.setItem('highContrast', JSON.stringify(highContrast))
  }, [highContrast])

  const increaseFont = () => {
    setFontSize(prev => Math.min(prev + 2, 24))
  }

  const decreaseFont = () => {
    setFontSize(prev => Math.max(prev - 2, 12))
  }

  const toggleContrast = () => {
    setHighContrast(!highContrast)
  }

  return (
    <div className="accessibility-container">
      <button
        className="accessibility-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Accessibility settings"
      >
        <FaUniversalAccess />
      </button>

      {isOpen && (
        <div className="accessibility-menu glass" role="menu">
          <h4>Accessibility</h4>

          <div className="accessibility-controls">
            <div className="control-group">
              <label>Font Size</label>
              <div className="font-controls">
                <button onClick={decreaseFont} aria-label="Decrease font size">
                  <FaFont /> A-
                </button>
                <span className="font-size-display">{fontSize}px</span>
                <button onClick={increaseFont} aria-label="Increase font size">
                  <FaFont /> A+
                </button>
              </div>
            </div>

            <div className="control-group">
              <label>Theme</label>
              <button
                onClick={toggleDarkMode}
                className={`contrast-btn ${darkMode ? 'active' : ''}`}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <FaAdjust /> {darkMode ? 'Light mode' : 'Dark mode'}
              </button>
            </div>

            <button
              onClick={toggleContrast}
              className={`contrast-btn ${highContrast ? 'active' : ''}`}
              aria-label="Toggle high contrast"
            >
              <FaAdjust /> High Contrast
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccessibilityMenu
