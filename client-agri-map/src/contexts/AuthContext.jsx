import React, { createContext, useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const navigate = useNavigate()

  useEffect(() => {
    if (token) fetchUser()
    else setLoading(false)
  }, [token])

  const persistAuth = (payload) => {
    const tokenResp = payload.token || payload.access
    const refreshResp = payload.refreshToken || payload.refresh
    const userResp = payload.user || payload
    if (tokenResp) {
      localStorage.setItem('token', tokenResp)
      setToken(tokenResp)
    }
    if (refreshResp) localStorage.setItem('refreshToken', refreshResp)
    if (userResp?.email || userResp?.id) setUser(userResp)
  }

  const fetchUser = async () => {
    try {
      const profile = await authAPI.profile()
      setUser(profile.user || profile)
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password, rememberMe = false) => {
    try {
      const payload = await authAPI.login({ email, password })
      persistAuth(payload)
      if (rememberMe) localStorage.setItem('rememberMe', 'true')
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Invalid email or password. Please try again.' }
    }
  }

  const signup = async (userData) => {
    try {
      const payload = await authAPI.register({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName || userData.name?.split(' ')[0] || '',
        lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
        phone: userData.phone || '',
        role: userData.role || 'farmer',
      })
      persistAuth(payload)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed. Please check your details.' }
    }
  }

  const googleLogin = async (credentialResponse) => {
    try {
      const payload = await authAPI.googleLogin(credentialResponse.credential)
      persistAuth(payload)
      return { success: true }
    } catch (error) {
      try {
        const payload = await authAPI.firebaseLogin({ credential: credentialResponse.credential })
        persistAuth(payload)
        return { success: true }
      } catch {
        return { success: false, error: error.response?.data?.message || 'Google authentication failed.' }
      }
    }
  }

  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword(email)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Unable to send reset email.' }
    }
  }

  const logout = async () => {
    try { await authAPI.logout() } catch { /* ignore */ }
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setToken(null)
    setUser(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{
      user, loading, login, signup, googleLogin, forgotPassword, logout,
      isAuthenticated: !!token || !!user,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
