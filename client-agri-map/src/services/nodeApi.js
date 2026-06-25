import axios from 'axios'

const NODE_API_URL = import.meta.env.VITE_NODE_API_URL || 'http://localhost:5000/api'

const nodeApi = axios.create({
  baseURL: NODE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
nodeApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Loan endpoints
export const loanAPI = {
  apply: (data) => nodeApi.post('/loans/apply', data),
  getStatus: (id) => nodeApi.get(`/loans/${id}`),
  getAll: () => nodeApi.get('/loans'),
  getMyLoans: () => nodeApi.get('/loans/me'),
}

// Carbon credit endpoints
export const carbonCreditAPI = {
  listVerified: () => nodeApi.get('/carbon-credits'),
  tokenize: (data) => nodeApi.post('/carbon-credits/tokenize', data),
  sell: (data) => nodeApi.post('/carbon-credits/sell', data),
  getMyCredits: () => nodeApi.get('/carbon-credits/me'),
}

// Payment endpoints
export const paymentAPI = {
  disburse: (data) => nodeApi.post('/payments/disburse', data),
  repay: (data) => nodeApi.post('/payments/repay', data),
}

// Wallet endpoints
export const walletAPI = {
  getBalance: () => nodeApi.get('/wallet'),
  getTransactions: () => nodeApi.get('/wallet/transactions'),
}

// Health check
export const nodeHealthAPI = {
  check: () => nodeApi.get('/health'),
}

export default nodeApi
