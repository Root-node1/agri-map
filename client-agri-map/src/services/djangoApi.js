import axios from 'axios'

const DJANGO_API_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000/api'

const djangoApi = axios.create({
  baseURL: DJANGO_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
djangoApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Farmer endpoints
export const farmerAPI = {
  register: (data) => djangoApi.post('/farmers/register', data),
  getProfile: () => djangoApi.get('/farmers/me'),
  updateProfile: (data) => djangoApi.put('/farmers/me', data),
}

// Cooperative endpoints
export const cooperativeAPI = {
  register: (data) => djangoApi.post('/cooperatives', data),
  getDetails: (id) => djangoApi.get(`/cooperatives/${id}`),
  getMyCooperative: () => djangoApi.get('/cooperatives/me'),
}

// Field endpoints
export const fieldAPI = {
  create: (data) => djangoApi.post('/fields', data),
  getAll: () => djangoApi.get('/fields'),
  getOne: (id) => djangoApi.get(`/fields/${id}`),
  update: (id, data) => djangoApi.put(`/fields/${id}`, data),
  delete: (id) => djangoApi.delete(`/fields/${id}`),
}

// Satellite endpoints
export const satelliteAPI = {
  fetchImagery: (data) => djangoApi.post('/satellite/fetch', data),
  processImagery: (data) => djangoApi.post('/satellite/process', data),
}

// Analysis endpoints
export const analysisAPI = {
  getVegetationIndices: (fieldId) => djangoApi.get(`/analysis/vegetation/${fieldId}`),
  predictCropType: (fieldId) => djangoApi.get(`/analysis/crop-type/${fieldId}`),
  detectBoundaries: (fieldId) => djangoApi.get(`/analysis/boundaries/${fieldId}`),
  getSoilHealth: (fieldId) => djangoApi.get(`/analysis/soil/${fieldId}`),
  getTrends: (fieldId) => djangoApi.get(`/analysis/trends/${fieldId}`),
  getDegradation: (fieldId) => djangoApi.get(`/analysis/degradation/${fieldId}`),
}

// Carbon endpoints
export const carbonAPI = {
  calculate: (fieldId) => djangoApi.get(`/carbon/${fieldId}`),
}

// Report endpoints
export const reportAPI = {
  getFieldReport: (fieldId) => djangoApi.get(`/reports/field/${fieldId}`),
}

// Health check
export const healthAPI = {
  check: () => djangoApi.get('/health'),
}

export default djangoApi
