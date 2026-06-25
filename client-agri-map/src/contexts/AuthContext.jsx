import React, { createContext, useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Node API wraps payload in { success, statusCode, message, data }
      setUser(response.data.data.user)
    } catch (error) {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email,
        password
      })
      const payload = response.data.data
      const tokenResp = payload.token
      const userResp = payload.user
      localStorage.setItem('token', tokenResp)
      setToken(tokenResp)
      setUser(userResp)
      navigate('/dashboard')
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' }
    }
  }

  const signup = async (userData) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, userData)
      const payload = response.data.data
      const tokenResp = payload.token
      const userResp = payload.user
      localStorage.setItem('token', tokenResp)
      setToken(tokenResp)
      setUser(userResp)
      navigate('/dashboard')
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Signup failed' }
    }
  }

  const googleLogin = async (credentialResponse) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        credential: credentialResponse.credential
      })
      const payload = response.data.data
      const tokenResp = payload.token
      const userResp = payload.user
      localStorage.setItem('token', tokenResp)
      setToken(tokenResp)
      setUser(userResp)
      navigate('/dashboard')
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Google login failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    navigate('/login')
  }

  const value = {
    user,
    loading,
    login,
    signup,
    googleLogin,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
