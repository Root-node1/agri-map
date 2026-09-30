import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSeedling, FaUserTie, FaFlask, FaUsers, FaEllipsisH } from 'react-icons/fa'
import { useUser } from '../../contexts/UserContext'
import './UserOnboarding.css'

const ROLES = [
  { value: 'small_scale_farmer', label: 'Small Scale Farmer', icon: FaSeedling, description: 'I farm on a small plot, usually for subsistence or local market' },
  { value: 'large_scale_farmer', label: 'Large Scale Farmer', icon: FaUserTie, description: 'I run a commercial farming operation with extensive land' },
  { value: 'researcher', label: 'Researcher', icon: FaFlask, description: 'I study agriculture, soil science, or related fields' },
  { value: 'cooperative', label: 'Cooperative', icon: FaUsers, description: 'I represent a farmers cooperative or group' },
  { value: 'other', label: 'Other', icon: FaEllipsisH, description: 'I have a different role (please specify)' },
]

export default function UserOnboarding() {
  const navigate = useNavigate()
  const { completeOnboarding } = useUser()
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [otherSpecification, setOtherSpecification] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    if (!role) {
      setError('Please select your role')
      return
    }

    if (role === 'other' && !otherSpecification.trim()) {
      setError('Please specify your role')
      return
    }

    const userData = {
      name: name.trim(),
      role: role,
      ...(role === 'other' && { otherSpecification: otherSpecification.trim() }),
    }

    completeOnboarding(userData)
    navigate('/')
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-background" aria-hidden="true">
        <div className="onboarding-glow" />
      </div>

      <div className="onboarding-container">
        <div className="onboarding-card">
          <div className="onboarding-header">
            <div className="onboarding-logo">
              <FaSeedling className="onboarding-logo-icon" />
            </div>
            <h1 className="onboarding-title">Welcome to AgriMap</h1>
            <p className="onboarding-subtitle">
              Tell us about yourself so we can personalize your experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="onboarding-form">
            <div className="onboarding-field">
              <label htmlFor="name" className="onboarding-label">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="onboarding-input"
                autoFocus
              />
            </div>

            <div className="onboarding-field">
              <label className="onboarding-label">I am a...</label>
              <div className="onboarding-roles">
                {ROLES.map(({ value: roleValue, label: roleLabel, icon: Icon, description }) => (
                  <button
                    key={roleValue}
                    type="button"
                    className={`onboarding-role-card ${role === roleValue ? 'onboarding-role-card--selected' : ''}`}
                    onClick={() => {
                      setRole(roleValue)
                      setError('')
                    }}
                  >
                    <div className="onboarding-role-icon">
                      <Icon />
                    </div>
                    <div className="onboarding-role-content">
                      <span className="onboarding-role-label">{roleLabel}</span>
                      <span className="onboarding-role-description">{description}</span>
                    </div>
                    <div className={`onboarding-role-check ${role === roleValue ? 'onboarding-role-check--visible' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {role === 'other' && (
              <div className="onboarding-field onboarding-field--other">
                <label htmlFor="otherSpecification" className="onboarding-label">
                  Please specify your role
                </label>
                <input
                  type="text"
                  id="otherSpecification"
                  value={otherSpecification}
                  onChange={(e) => setOtherSpecification(e.target.value)}
                  placeholder="E.g., Agri-entrepreneur, Student, etc."
                  className="onboarding-input"
                />
              </div>
            )}

            {error && (
              <div className="onboarding-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="onboarding-submit">
              Get Started
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="onboarding-submit-icon">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </form>

          <p className="onboarding-footer">
            By continuing, you agree to our Terms & Conditions and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
