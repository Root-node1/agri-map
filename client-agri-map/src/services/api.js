import axios from 'axios'

// Host only. Every path below already starts with /api
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // Render free tier can take ~50s to wake up
})

// Auth is switched off on the backend for the prototype, so no token or refresh logic here.
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) delete config.headers['Content-Type']
  return config
})

/* ---------- response helpers ---------- */

// Single object: tolerate both a bare object and a { data: ... } wrapper
const unwrap = (res) => res.data?.data ?? res.data

// Lists: DRF paginates as { count, next, previous, results }
export const unwrapList = (res) => {
  const d = res.data
  if (Array.isArray(d)) return d
  if (Array.isArray(d?.results)) return d.results
  if (Array.isArray(d?.data)) return d.data
  return []
}

// Readable message from a DRF error: { detail } or { field: ["msg"] }
export const apiError = (err, fallback = 'Something went wrong. Please try again.') => {
  const d = err?.response?.data
  if (!d) return err?.message || fallback
  if (typeof d === 'string') return d
  if (d.detail) return d.detail
  const first = Object.entries(d)[0]
  if (first) return `${first[0]}: ${[].concat(first[1]).join(' ')}`
  return fallback
}

/* ---------- Fields (confirmed in the audit) ---------- */
export const fieldAPI = {
  getAll: () => api.get('/api/fields/').then(unwrapList),
  getById: (id) => api.get(`/api/fields/${id}/`).then(unwrap),
  // Django requires { name, geometry } where geometry is a GeoJSON geometry object
  create: ({ name, geometry, ...rest }) => api.post('/api/fields/', { name, geometry, ...rest }).then(unwrap),
  update: (id, data) => api.put(`/api/fields/${id}/`, data).then(unwrap),
  delete: (id) => api.delete(`/api/fields/${id}/`).then(unwrap),
  // GeoJSON FeatureCollection of all fields, for drawing every boundary on one map
  getGeoJSON: () => api.get('/api/fields/geojson/').then(unwrap),
}

/* ---------- Satellite (confirmed) ---------- */
export const satelliteAPI = {
  fetch: (data) => api.post('/api/satellite/fetch/', data).then(unwrap),
  process: (data) => api.post('/api/satellite/process/', data).then(unwrap),
  getImages: () => api.get('/api/satellite/images/').then(unwrapList),
  getImage: (id) => api.get(`/api/satellite/images/${id}/`).then(unwrap),
  getJobs: () => api.get('/api/satellite/jobs/').then(unwrapList),
  getJob: (id) => api.get(`/api/satellite/jobs/${id}/`).then(unwrap),
}

/* ---------- Reports (confirmed) ---------- */
export const reportAPI = {
  getFieldReport: (fieldId) => api.get(`/api/reports/field/${fieldId}/`).then(unwrap),
}

/* ---------- Carbon (only the per-field route exists in Django) ---------- */
export const carbonAPI = {
  getForField: (fieldId) => api.get(`/api/carbon/${fieldId}/`).then(unwrap),
  create: (fieldId, data) => api.post(`/api/carbon/${fieldId}/create/`, data).then(unwrap),
}

/* ---------- Soil (path corrected from /api/analysis/soil to /api/soil) ---------- */
export const soilAPI = {
  getForField: (fieldId) => api.get(`/api/soil/${fieldId}/`).then(unwrap),
}

/* ---------- Farmer profile ---------- */
export const farmerAPI = {
  register: (data) => api.post('/api/farmers/register/', data).then(unwrap),
  getMe: () => api.get('/api/farmers/me/').then(unwrap),
}

/* ---------- Health ---------- */
export const healthAPI = {
  check: () => api.get('/api/health/').then(unwrap),
}

/* ---------- Cooperatives (Django: /api/farmers/cooperatives/...) ---------- */
export const cooperativeAPI = {
  getAll: () => api.get('/api/farmers/cooperatives/').then(unwrapList),
  getById: (id) => api.get(`/api/farmers/cooperatives/${id}/`).then(unwrap),
  create: (data) => api.post('/api/farmers/cooperatives/', data).then(unwrap),
  getMembers: (id) => api.get(`/api/farmers/cooperatives/${id}/members/`).then(unwrapList),
  addMember: (id, data) => api.post(`/api/farmers/cooperatives/${id}/members/`, data).then(unwrap),
  updateMember: (id, memberId, data) => api.put(`/api/farmers/cooperatives/${id}/members/${memberId}/`, data).then(unwrap),
  removeMember: (id, memberId) => api.delete(`/api/farmers/cooperatives/${id}/members/${memberId}/`).then(unwrap),
}

/* ---------- Analysis: paths confirmed from urls.py; confirm GET vs POST per view in /api/docs/ ---------- */
export const analysisAPI = {
  getVegetation: (id) => api.get(`/api/analysis/vegetation/${id}/`).then(unwrap),
  getDegradation: (id) => api.get(`/api/analysis/degradation/${id}/`).then(unwrap),
  getTrends: (id) => api.get(`/api/analysis/trends/${id}/`).then(unwrap),
  getCropArea: (id) => api.get(`/api/analysis/crop-area/${id}/`).then(unwrap),
  getBoundaries: (id) => api.get(`/api/analysis/boundaries/${id}/`).then(unwrap),
  predictCrop: (id, data) => api.post(`/api/analysis/crop-type/${id}/`, data).then(unwrap),
  predictSoil: (id, data) => api.post(`/api/analysis/soil-composition/${id}/`, data).then(unwrap),
}

export default { fieldAPI, satelliteAPI, reportAPI, carbonAPI, soilAPI, farmerAPI, healthAPI, cooperativeAPI, analysisAPI }