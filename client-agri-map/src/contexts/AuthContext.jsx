import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token') || null)

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          const userData = await authAPI.profile()
          setUser(userData)
          setToken(storedToken)
        } catch (error) {
          console.error('Auth check failed:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      const { access, refresh, user } = response
      
      localStorage.setItem('token', access)
      localStorage.setItem('refreshToken', refresh)
      setToken(access)
      setUser(user)
      
      return { success: true, user }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      const { access, refresh, user } = response
      
      localStorage.setItem('token', access)
      localStorage.setItem('refreshToken', refresh)
      setToken(access)
      setUser(user)
      
      return { success: true, user }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, error: error.message }
    }
  }

  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword({ email })
      return { success: true, message: 'Password reset email sent' }
    } catch (error) {
      console.error('Forgot password failed:', error)
      return { success: false, error: error.message }
    }
  }

  const resetPassword = async (token, newPassword) => {
    try {
      await authAPI.resetPassword({ token, new_password: newPassword })
      return { success: true, message: 'Password reset successfully' }
    } catch (error) {
      console.error('Reset password failed:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!token || !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
