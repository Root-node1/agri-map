import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://agri-map-v81v.onrender.com'

const api = axios.create({
  baseURL: `${API_URL}/api`,
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
        }
      }
    }
    return Promise.reject(error)
  }
)

const unwrap = (res) => res.data?.data ?? res.data

export const authAPI = {
  register: (data) => api.post('/auth/register', data).then(unwrap),
  login: (data) => api.post('/auth/login', data).then(unwrap),
  profile: () => api.get('/auth/profile').then(unwrap),
  logout: () => api.post('/auth/logout').then(unwrap),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }).then(unwrap),
  firebaseRegister: (data) => api.post('/auth/firebase/register', data).then(unwrap),
  firebaseLogin: (data) => api.post('/auth/firebase/login', data).then(unwrap),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then(unwrap),
  resetPassword: (data) => api.post('/auth/reset-password', data).then(unwrap),
  googleLogin: (credential) => api.post('/auth/google', { credential }).then(unwrap),
}

export const aiAPI = {
  detectCrop: (data) => api.post('/ai/detect-crop', data).then(unwrap),
  analyzeSoil: (data) => api.post('/ai/analyze-soil', data).then(unwrap),
  predictCarbon: (data) => api.post('/ai/predict-carbon', data).then(unwrap),
  predictYield: (data) => api.post('/ai/predict-yield', data).then(unwrap),
  analyzeVegetation: (data) => api.post('/ai/analyze-vegetation', data).then(unwrap),
  analyzeField: (data) => api.post('/ai/analyze-field', data).then(unwrap),
  getModels: () => api.get('/ai/models').then(unwrap),
}

export const chatbotAPI = {
  sendMessage: (message, context) => api.post('/chatbot/message', { message, context }).then(unwrap),
  getHistory: () => api.get('/chatbot/history').then(unwrap),
  getRecommendations: () => api.get('/chatbot/recommendations').then(unwrap),
  clearHistory: () => api.delete('/chatbot/history').then(unwrap),
}

export const loanAPI = {
  apply: (data) => api.post('/loans/apply', data).then(unwrap),
  getAll: (params) => api.get('/loans', { params }).then(unwrap),
  getOne: (id) => api.get(`/loans/${id}`).then(unwrap),
  approve: (id, data) => api.post(`/loans/${id}/approve`, data).then(unwrap),
  disburse: (id, data) => api.post(`/loans/${id}/disburse`, data).then(unwrap),
}

export const carbonAPI = {
  getAll: () => api.get('/carbon-credits').then(unwrap),
  getAvailable: () => api.get('/carbon-credits/available').then(unwrap),
  getStats: () => api.get('/carbon-credits/stats').then(unwrap),
  create: (data) => api.post('/carbon-credits', data).then(unwrap),
  tokenize: (id, data) => api.post(`/carbon-credits/${id}/tokenize`, data).then(unwrap),
  sell: (id, data) => api.post(`/carbon-credits/${id}/sell`, data).then(unwrap),
}

export const walletAPI = {
  getBalance: () => api.get('/wallet').then(unwrap),
  getTransactions: (params) => api.get('/wallet/transactions', { params }).then(unwrap),
  deposit: (data) => api.post('/wallet/deposit', data).then(unwrap),
  withdraw: (data) => api.post('/wallet/withdraw', data).then(unwrap),
  transfer: (data) => api.post('/wallet/transfer', data).then(unwrap),
}

export const paymentAPI = {
  initiate: (data) => api.post('/payments/initiate', data).then(unwrap),
  getAll: () => api.get('/payments').then(unwrap),
  refund: (id, data) => api.post(`/payments/${id}/refund`, data).then(unwrap),
}

export const subscriptionAPI = {
  getPlans: () => api.get('/subscriptions/plans').then(unwrap),
  create: (data) => api.post('/subscriptions/create', data).then(unwrap),
  getMySubscription: () => api.get('/subscriptions/my-subscription').then(unwrap),
  generateApiKey: (data) => api.post('/subscriptions/generate-api-key', data).then(unwrap),
  getApiKeys: () => api.get('/subscriptions/api-keys').then(unwrap),
  revokeApiKey: (id) => api.delete(`/subscriptions/api-keys/${id}`).then(unwrap),
  getUsage: () => api.get('/subscriptions/usage').then(unwrap),
  cancel: () => api.post('/subscriptions/cancel').then(unwrap),
}

export const fieldAPI = {
  getAll: () => api.get('/fields').then(unwrap),
  getOne: (id) => api.get(`/fields/${id}`).then(unwrap),
  create: (data) => api.post('/fields', data).then(unwrap),
  update: (id, data) => api.put(`/fields/${id}`, data).then(unwrap),
  delete: (id) => api.delete(`/fields/${id}`).then(unwrap),
}

export const healthAPI = {
  check: () => axios.get(`${API_URL}/health`).then((r) => r.data),
}

export default api
