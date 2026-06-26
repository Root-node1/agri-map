import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://agri-map-v81v.onrender.com'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (config.data instanceof FormData) delete config.headers['Content-Type']
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refreshToken')
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/api/auth/refresh/`, { refresh })
          const payload = data.data || data
          const newToken = payload.access || payload.token
          if (newToken) {
            localStorage.setItem('token', newToken)
            original.headers.Authorization = `Bearer ${newToken}`
            return api(original)
          }
        } catch {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

const unwrap = (res) => res.data?.data ?? res.data

// Auth API - Matches Django URLs
export const authAPI = {
  register: (data) => api.post('/api/auth/register/', data).then(unwrap),
  login: (data) => api.post('/api/auth/login/', data).then(unwrap),
  profile: () => api.get('/api/auth/me/').then(unwrap),
  refresh: (refreshToken) => api.post('/api/auth/refresh/', { refresh: refreshToken }).then(unwrap),
  logout: () => api.post('/api/auth/logout/').then(unwrap),
  forgotPassword: (data) => api.post('/api/auth/forgot-password/', data).then(unwrap),
  resetPassword: (data) => api.post('/api/auth/reset-password/', data).then(unwrap),
}

// Field API
export const fieldAPI = {
  getAll: () => api.get('/api/fields/').then(unwrap),
  getById: (id) => api.get(`/api/fields/${id}/`).then(unwrap),
  create: (data) => api.post('/api/fields/', data).then(unwrap),
  update: (id, data) => api.put(`/api/fields/${id}/`, data).then(unwrap),
  delete: (id) => api.delete(`/api/fields/${id}/`).then(unwrap),
  getBoundaries: (id) => api.get(`/api/analysis/boundaries/${id}/`).then(unwrap),
}

// Analysis API
export const analysisAPI = {
  getVegetation: (id) => api.get(`/api/analysis/vegetation/${id}/`).then(unwrap),
  getCropType: (id) => api.get(`/api/analysis/crop-type/${id}/`).then(unwrap),
  getSoil: (id) => api.get(`/api/analysis/soil/${id}/`).then(unwrap),
  getDegradation: (id) => api.get(`/api/analysis/degradation/${id}/`).then(unwrap),
  getTrends: (id) => api.get(`/api/analysis/trends/${id}/`).then(unwrap),
  predictCrop: (id, data) => api.post(`/api/analysis/crop-type/${id}/`, data).then(unwrap),
  predictSoil: (id, data) => api.post(`/api/analysis/soil-composition/${id}/`, data).then(unwrap),
}

// Carbon API
export const carbonAPI = {
  getStats: () => api.get('/api/carbon/stats/').then(unwrap),
  getAll: () => api.get('/api/carbon/').then(unwrap),
  getForField: (fieldId) => api.get(`/api/carbon/${fieldId}/`).then(unwrap),
}

// Wallet API
export const walletAPI = {
  getBalance: () => api.get('/api/wallet/balance/').then(unwrap),
  getTransactions: (params) => api.get('/api/wallet/transactions/', { params }).then(unwrap),
  deposit: (data) => api.post('/api/wallet/deposit/', data).then(unwrap),
  withdraw: (data) => api.post('/api/wallet/withdraw/', data).then(unwrap),
  transfer: (data) => api.post('/api/wallet/transfer/', data).then(unwrap),
}

export default {
  authAPI,
  fieldAPI,
  analysisAPI,
  carbonAPI,
  walletAPI,
}
