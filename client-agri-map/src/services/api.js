import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://agri-map-v81v.onrender.com'

const api = axios.create({
  baseURL: API_URL,  // Remove '/api' from here
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
          const { data } = await axios.post(`${API_URL}/api/auth/refresh-token`, { refreshToken: refresh })
          const payload = data.data || data
          const newToken = payload.token || payload.access
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

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data).then(unwrap),
  login: (data) => api.post('/api/auth/login', data).then(unwrap),
  profile: () => api.get('/api/auth/profile').then(unwrap),
  refresh: (refreshToken) => api.post('/api/auth/refresh-token', { refreshToken }).then(unwrap),
  logout: () => api.post('/api/auth/logout').then(unwrap),
}

// Field API
export const fieldAPI = {
  getAll: () => api.get('/api/fields').then(unwrap),
  getById: (id) => api.get(`/api/fields/${id}`).then(unwrap),
  create: (data) => api.post('/api/fields', data).then(unwrap),
  update: (id, data) => api.put(`/api/fields/${id}`, data).then(unwrap),
  delete: (id) => api.delete(`/api/fields/${id}`).then(unwrap),
  getBoundaries: (id) => api.get(`/api/analysis/boundaries/${id}`).then(unwrap),
}

// Analysis API
export const analysisAPI = {
  getVegetation: (id) => api.get(`/api/analysis/vegetation/${id}`).then(unwrap),
  getCropType: (id) => api.get(`/api/analysis/crop-type/${id}`).then(unwrap),
  getSoil: (id) => api.get(`/api/analysis/soil/${id}`).then(unwrap),
  getDegradation: (id) => api.get(`/api/analysis/degradation/${id}`).then(unwrap),
  getTrends: (id) => api.get(`/api/analysis/trends/${id}`).then(unwrap),
  predictCrop: (id, data) => api.post(`/api/analysis/crop-type/${id}`, data).then(unwrap),
  predictSoil: (id, data) => api.post(`/api/analysis/soil-composition/${id}`, data).then(unwrap),
}

// Carbon API
export const carbonAPI = {
  getStats: () => api.get('/api/carbon-credits/stats').then(unwrap),
  getAll: () => api.get('/api/carbon-credits').then(unwrap),
  getAvailable: () => api.get('/api/carbon-credits/available').then(unwrap),
  create: (data) => api.post('/api/carbon-credits', data).then(unwrap),
  tokenize: (id, data) => api.post(`/api/carbon-credits/${id}/tokenize`, data).then(unwrap),
  sell: (id, data) => api.post(`/api/carbon-credits/${id}/sell`, data).then(unwrap),
  getForField: (fieldId) => api.get(`/api/carbon/${fieldId}`).then(unwrap),
}

// Wallet API
export const walletAPI = {
  getBalance: () => api.get('/api/wallet').then(unwrap),
  getTransactions: (params) => api.get('/api/wallet/transactions', { params }).then(unwrap),
  deposit: (data) => api.post('/api/wallet/deposit', data).then(unwrap),
  withdraw: (data) => api.post('/api/wallet/withdraw', data).then(unwrap),
  transfer: (data) => api.post('/api/wallet/transfer', data).then(unwrap),
}

// Loan API
export const loanAPI = {
  apply: (data) => api.post('/api/loans/apply', data).then(unwrap),
  getAll: (params) => api.get('/api/loans', { params }).then(unwrap),
  getById: (id) => api.get(`/api/loans/${id}`).then(unwrap),
  approve: (id, data) => api.put(`/api/loans/${id}/approve`, data).then(unwrap),
  disburse: (id, data) => api.post(`/api/loans/${id}/disburse`, data).then(unwrap),
}

// Payment API
export const paymentAPI = {
  initiate: (data) => api.post('/api/payments/initiate', data).then(unwrap),
  getAll: (params) => api.get('/api/payments', { params }).then(unwrap),
  refund: (id, data) => api.post(`/api/payments/${id}/refund`, data).then(unwrap),
}

// Subscription API
export const subscriptionAPI = {
  getPlans: () => api.get('/api/subscriptions/plans').then(unwrap),
  create: (data) => api.post('/api/subscriptions/create', data).then(unwrap),
  getMySubscription: () => api.get('/api/subscriptions/my-subscription').then(unwrap),
  generateApiKey: (data) => api.post('/api/subscriptions/generate-api-key', data).then(unwrap),
  listApiKeys: () => api.get('/api/subscriptions/api-keys').then(unwrap),
  revokeApiKey: (keyId) => api.delete(`/api/subscriptions/api-keys/${keyId}`).then(unwrap),
  getUsage: () => api.get('/api/subscriptions/usage').then(unwrap),
  cancel: (data) => api.post('/api/subscriptions/cancel', data).then(unwrap),
}

// Report API
export const reportAPI = {
  getFieldReport: (id) => api.get(`/api/reports/field/${id}`).then(unwrap),
}

// Satellite API
export const satelliteAPI = {
  fetch: (data) => api.post('/api/satellite/fetch', data).then(unwrap),
  process: (data) => api.post('/api/satellite/process', data).then(unwrap),
}

// Chatbot API
export const chatbotAPI = {
  sendMessage: (data) => api.post('/api/chatbot/message', data).then(unwrap),
  getHistory: () => api.get('/api/chatbot/history').then(unwrap),
  getRecommendations: (data) => api.post('/api/chatbot/recommendations', data).then(unwrap),
  getAnalytics: () => api.get('/api/chatbot/analytics').then(unwrap),
  clearHistory: () => api.delete('/api/chatbot/history').then(unwrap),
}

// AI API
export const aiAPI = {
  detectCrop: (data) => api.post('/api/ai/detect-crop', data).then(unwrap),
  analyzeSoil: (data) => api.post('/api/ai/analyze-soil', data).then(unwrap),
  predictCarbon: (data) => api.post('/api/ai/predict-carbon', data).then(unwrap),
  predictYield: (data) => api.post('/api/ai/predict-yield', data).then(unwrap),
  analyzeVegetation: (data) => api.post('/api/ai/analyze-vegetation', data).then(unwrap),
  analyzeField: (data) => api.post('/api/ai/analyze-field', data).then(unwrap),
  getModels: () => api.get('/api/ai/models').then(unwrap),
  batchAnalyze: (data) => api.post('/api/ai/batch-analyze', data).then(unwrap),
}

// Health check
export const healthAPI = {
  check: () => api.get('/health').then(unwrap),
}

export default {
  authAPI,
  fieldAPI,
  analysisAPI,
  carbonAPI,
  walletAPI,
  loanAPI,
  paymentAPI,
  subscriptionAPI,
  reportAPI,
  satelliteAPI,
  chatbotAPI,
  aiAPI,
  healthAPI,
}
