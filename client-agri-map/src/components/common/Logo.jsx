import React from 'react'

const Logo = () => {
  return (
    <svg 
      width="36" 
      height="36" 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="logo-svg"
    >
      <circle cx="20" cy="20" r="18" stroke="#4CAF50" strokeWidth="2"/>
      <path d="M20 2 L20 38 M2 20 L38 20" stroke="#4CAF50" strokeWidth="1.5" opacity="0.3"/>
      <circle cx="20" cy="20" r="7" fill="#4CAF50" opacity="0.9"/>
      <circle cx="20" cy="20" r="3" fill="white"/>
      <path d="M20 10 C24 14 28 17 32 20 C28 23 24 26 20 30 C16 26 12 23 8 20 C12 17 16 14 20 10Z" 
            stroke="#4CAF50" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <circle cx="20" cy="12" r="1.5" fill="#4CAF50" opacity="0.3"/>
    </svg>
  )
}

export default Logo
