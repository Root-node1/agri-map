import React, { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('agrimap_user')
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('agrimap_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('agrimap_user')
    }
  }, [user])

  const completeOnboarding = (userData) => {
    setUser(userData)
  }

  const resetUser = () => {
    setUser(null)
    localStorage.removeItem('agrimap_user')
  }

  const value = {
    user,
    completeOnboarding,
    resetUser,
    isOnboarded: !!user,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export default UserContext
