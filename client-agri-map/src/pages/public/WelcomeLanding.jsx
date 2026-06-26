import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import heroField from '../../assets/image.png'
import './WelcomeLanding.css'

// Landing screen for logged-out visitors. The card is styled like a field
// marker tag staked into the photo; choosing an action peels it off-screen
// before routing to /register or /login.
export default function WelcomeLanding() {
  const navigate = useNavigate()
  const [target, setTarget] = useState(null)
  const isPeeling = Boolean(target)

  const goTo = (path) => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      navigate(path)
      return
    }
    setTarget(path)
  }

  return (
    <div className="welcome-landing">
      <img
        src={heroField}
        alt="Rows of crops leading toward golden hills"
        className="welcome-landing__photo"
      />
      <div className="welcome-landing__scrim" aria-hidden="true" />

      <div
        className={`welcome-landing__tag${isPeeling ? ' is-peeling' : ''}`}
        onAnimationEnd={() => target && navigate(target)}
      >
        <span className="welcome-landing__eyelet" aria-hidden="true" />
        <span className="welcome-landing__string" aria-hidden="true" />

        <p className="welcome-landing__eyebrow">AgriMap · East Africa</p>
        <h1 className="welcome-landing__title">What&rsquo;s really in your soil?</h1>
        <p className="welcome-landing__lede">
          Draw your field on the map and AgriMap reads the soil, the season, and the
          carbon it&rsquo;s holding — before you plant a single seed.
        </p>

        <div className="welcome-landing__actions">
          <button
            type="button"
            className="welcome-landing__btn welcome-landing__btn--primary"
            onClick={() => goTo('/register')}
          >
            Map my field
          </button>
          <button
            type="button"
            className="welcome-landing__btn welcome-landing__btn--ghost"
            onClick={() => goTo('/login')}
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  )
}