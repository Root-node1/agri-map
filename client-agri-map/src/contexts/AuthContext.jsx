import React, { createContext, useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { farmerAPI } from '../services/djangoApi'

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

  const fetchFarmerProfile = async () => {
    try {
      const response = await farmerAPI.getProfile()
      return response.data
    } catch {
      return null
    }
  }

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Node API wraps payload in { success, statusCode, message, data }
      const authUser = response.data.data.user || response.data.data
      let mergedUser = authUser

      if (authUser?.role === 'farmer') {
        const farmerProfile = await fetchFarmerProfile()
        if (farmerProfile) {
          mergedUser = { ...authUser, phone: farmerProfile.phone, location: farmerProfile.location }
        }
      }

      setUser(mergedUser)
    } catch (error) {
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
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email,
        password
      })
      const payload = response.data.data
      const tokenResp = payload.token
      const userResp = payload.user
      localStorage.setItem('token', tokenResp)
      setToken(tokenResp)

      let finalUser = userResp
      if (userResp?.role === 'farmer') {
        const farmerProfile = await fetchFarmerProfile()
        if (farmerProfile) {
          finalUser = { ...userResp, phone: farmerProfile.phone, location: farmerProfile.location }
        }
      }

      setUser(finalUser)
      const needsProfile = userResp?.role === 'farmer' && (!finalUser?.phone || !finalUser?.location)
      return { success: true, needsProfile }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Invalid email or password. Please try again.' }
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

      let finalUser = userResp
      if (userResp?.role === 'farmer') {
        const farmerProfile = await fetchFarmerProfile()
        if (farmerProfile) {
          finalUser = { ...userResp, phone: farmerProfile.phone, location: farmerProfile.location }
        }
      }

      setUser(finalUser)
      const needsProfile = userResp?.role === 'farmer' && (!finalUser?.phone || !finalUser?.location)
      return { success: true, needsProfile }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed. Please check your details.' }
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

      let finalUser = userResp
      if (userResp?.role === 'farmer') {
        const farmerProfile = await fetchFarmerProfile()
        if (farmerProfile) {
          finalUser = { ...userResp, phone: farmerProfile.phone, location: farmerProfile.location }
        }
      }

      setUser(finalUser)
      const needsProfile = userResp?.role === 'farmer' && (!finalUser?.phone || !finalUser?.location)
      return { success: true, needsProfile }
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

  const completeFarmerProfile = async (profileData) => {
    try {
      const response = await farmerAPI.register(profileData)
      const farmerProfile = response.data
      setUser((prevUser) => ({ ...prevUser, ...farmerProfile }))
      return { success: true, farmerProfile }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to complete farmer profile' }
    }
  }

  const isFarmer = user?.role === 'farmer'
  const needsFarmerProfile = isFarmer && (!user?.phone || !user?.location)

  const value = {
    user,
    loading,
    login,
    signup,
    googleLogin,
    logout,
    completeFarmerProfile,
    needsFarmerProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
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
