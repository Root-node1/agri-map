export const demoFields = [
  { id: 1, name: 'North Valley', location: 'Nairobi, Kenya', size: 12.5, cropType: 'Maize', soilHealth: 'Good', health: 89, ndvi: 0.72, carbon: 2.3, lat: -1.2864, lng: 36.8172 },
  { id: 2, name: 'East Ridge', location: 'Kiambu, Kenya', size: 8.2, cropType: 'Coffee', soilHealth: 'Excellent', health: 94, ndvi: 0.81, carbon: 3.1, lat: -1.1743, lng: 36.8356 },
  { id: 3, name: 'South Plains', location: 'Nakuru, Kenya', size: 15.0, cropType: 'Wheat', soilHealth: 'Fair', health: 72, ndvi: 0.58, carbon: 1.8, lat: -0.3031, lng: 36.0800 },
]

export const demoActivities = [
  { id: 1, type: 'ai', message: 'Crop detection completed for North Valley', time: '2 hours ago', icon: '🤖' },
  { id: 2, type: 'transaction', message: 'Carbon credit sale: KES 12,500', time: '5 hours ago', icon: '💰' },
  { id: 3, type: 'loan', message: 'Loan application under review', time: '1 day ago', icon: '📋' },
  { id: 4, type: 'field', message: 'Soil analysis updated for East Ridge', time: '2 days ago', icon: '🌱' },
]

export const demoWallet = { balance: 45750, currency: 'KES', pending: 3200 }

export const demoTransactions = [
  { id: 1, type: 'deposit', amount: 10000, description: 'Paystack deposit', date: '2026-06-24', status: 'completed' },
  { id: 2, type: 'carbon_sale', amount: 12500, description: 'Carbon credit sale', date: '2026-06-23', status: 'completed' },
  { id: 3, type: 'subscription', amount: -2500, description: 'Professional plan', date: '2026-06-20', status: 'completed' },
  { id: 4, type: 'withdraw', amount: -5000, description: 'Bank withdrawal', date: '2026-06-18', status: 'pending' },
]

export const demoLoans = [
  { id: 1, amount: 250000, purpose: 'Irrigation equipment', status: 'active', interest: 12, term: 24, disbursed: '2026-03-15', nextPayment: '2026-07-15', remaining: 180000 },
  { id: 2, amount: 100000, purpose: 'Seed purchase', status: 'pending', interest: 10, term: 12, applied: '2026-06-20' },
]

export const demoCarbonCredits = [
  { id: 1, field: 'North Valley', amount: 2.3, price: 4500, status: 'available', tokenized: false },
  { id: 2, field: 'East Ridge', amount: 3.1, price: 6200, status: 'tokenized', tokenized: true },
  { id: 3, field: 'South Plains', amount: 1.8, price: 3600, status: 'sold', tokenized: true },
]

export const demoPlans = [
  { id: 'free', name: 'Free', price: 0, period: 'month', features: ['5 API calls/day', '1 field', 'Basic crop detection'], limits: { apiCalls: 5, fields: 1 } },
  { id: 'basic', name: 'Basic', price: 2500, period: 'month', features: ['100 API calls/day', '5 fields', 'Soil analysis', 'Email support'], limits: { apiCalls: 100, fields: 5 } },
  { id: 'professional', name: 'Professional', price: 7500, period: 'month', features: ['1000 API calls/day', '25 fields', 'All AI services', 'Carbon marketplace', 'Priority support'], limits: { apiCalls: 1000, fields: 25 }, popular: true },
  { id: 'enterprise', name: 'Enterprise', price: 25000, period: 'month', features: ['Unlimited API calls', 'Unlimited fields', 'Custom integrations', 'Dedicated support', 'SLA guarantee'], limits: { apiCalls: -1, fields: -1 } },
  { id: 'ngo', name: 'NGO', price: 0, period: 'month', features: ['500 API calls/day', '50 fields', 'Community support', 'Impact reporting'], limits: { apiCalls: 500, fields: 50 } },
]

export const demoSoilData = { nitrogen: 45, phosphorus: 32, potassium: 58, ph: 6.8, moisture: 42, organicMatter: 3.2 }

export const demoNdviTrend = [
  { month: 'Jan', ndvi: 0.45, evi: 0.38 },
  { month: 'Feb', ndvi: 0.52, evi: 0.44 },
  { month: 'Mar', ndvi: 0.61, evi: 0.53 },
  { month: 'Apr', ndvi: 0.68, evi: 0.59 },
  { month: 'May', ndvi: 0.72, evi: 0.64 },
  { month: 'Jun', ndvi: 0.75, evi: 0.67 },
]

export const nutrientHeatmap = (field) => [
  { zone: 'A1', n: 78, p: 45, k: 62, ph: 6.5, moisture: 55 },
  { zone: 'A2', n: 65, p: 38, k: 71, ph: 6.8, moisture: 48 },
  { zone: 'B1', n: 42, p: 55, k: 49, ph: 7.1, moisture: 62 },
  { zone: 'B2', n: 88, p: 72, k: 83, ph: 6.3, moisture: 41 },
  { zone: 'C1', n: 55, p: 61, k: 58, ph: 6.9, moisture: 53 },
  { zone: 'C2', n: 71, p: 44, k: 66, ph: 6.6, moisture: 47 },
]
