export const demoFields = [
  { 
    id: 1, 
    name: 'Green Valley', 
    cropType: 'Maize', 
    location: 'Central Kenya', 
    size: '5 ha', 
    health: 85, 
    lat: -1.2864, 
    lng: 36.8172, 
    status: 'active',
    soilHealth: 'Good',
    carbonCredits: 2.5,
    yield: 4.2
  },
  { 
    id: 2, 
    name: 'Sunrise Farm', 
    cropType: 'Wheat', 
    location: 'Rift Valley', 
    size: '3 ha', 
    health: 72, 
    lat: -1.3, 
    lng: 36.8, 
    status: 'active',
    soilHealth: 'Moderate',
    carbonCredits: 1.8,
    yield: 3.5
  },
  { 
    id: 3, 
    name: 'Golden Fields', 
    cropType: 'Soybean', 
    location: 'Eastern Kenya', 
    size: '4 ha', 
    health: 90, 
    lat: -1.25, 
    lng: 36.9, 
    status: 'harvested',
    soilHealth: 'Excellent',
    carbonCredits: 3.2,
    yield: 5.1
  },
  { 
    id: 4, 
    name: 'River Valley Farm', 
    cropType: 'Coffee', 
    location: 'Western Kenya', 
    size: '2 ha', 
    health: 78, 
    lat: -1.2, 
    lng: 36.6, 
    status: 'active',
    soilHealth: 'Good',
    carbonCredits: 4.1,
    yield: 2.8
  },
  { 
    id: 5, 
    name: 'Highland Estate', 
    cropType: 'Tea', 
    location: 'Central Highlands', 
    size: '6 ha', 
    health: 88, 
    lat: -1.35, 
    lng: 36.85, 
    status: 'active',
    soilHealth: 'Excellent',
    carbonCredits: 5.3,
    yield: 3.9
  }
]

export const demoActivities = [
  { id: 1, icon: '🌱', message: 'Planted new maize crop in Green Valley', time: '2 hours ago' },
  { id: 2, icon: '📊', message: 'Harvest data updated for Golden Fields', time: '5 hours ago' },
  { id: 3, icon: '🚜', message: 'Equipment maintenance scheduled for Saturday', time: '1 day ago' },
  { id: 4, icon: '🌾', message: 'Crop detection completed for Green Valley', time: '2 days ago' },
  { id: 5, icon: '💰', message: 'Carbon credits tokenized - 2.5 tCO2 from Sunrise Farm', time: '3 days ago' },
  { id: 6, icon: '🧪', message: 'Soil analysis results for River Valley Farm', time: '4 days ago' },
  { id: 7, icon: '📈', message: 'Yield prediction updated for all fields', time: '5 days ago' }
]

export const demoStats = {
  fields: 5,
  crops: 4,
  carbon: 16.9,
  balance: 45750
}

// Soil data for demonstration - FIXED EXPORT
export const demoSoilData = {
  nitrogen: 0.62,
  phosphorus: 0.48,
  potassium: 0.55,
  ph: 6.5,
  organicMatter: 2.3,
  moisture: 0.4,
  temperature: 25,
  fertility: 'moderate',
  degradationRisk: 'low',
  recommendations: [
    'Add organic compost to improve soil structure',
    'Apply nitrogen-rich fertilizer for better growth',
    'Monitor moisture levels regularly'
  ]
}

// Nutrient heatmap data - FIXED EXPORT
export const nutrientHeatmap = {
  nitrogen: { value: 0.62, status: 'optimal', color: '#10b981' },
  phosphorus: { value: 0.48, status: 'moderate', color: '#f59e0b' },
  potassium: { value: 0.55, status: 'optimal', color: '#10b981' },
  ph: { value: 6.5, status: 'optimal', color: '#10b981' },
  organicMatter: { value: 2.3, status: 'moderate', color: '#f59e0b' },
  moisture: { value: 0.4, status: 'optimal', color: '#10b981' }
}

// Crop predictions
export const demoPredictions = [
  { crop: 'Maize', confidence: 0.92, season: 'Long Rains' },
  { crop: 'Wheat', confidence: 0.78, season: 'Short Rains' },
  { crop: 'Soybean', confidence: 0.65, season: 'Dry Season' }
]

// Carbon credit data
export const demoCarbonData = {
  totalCredits: 12.5,
  totalValue: 625,
  pricePerTon: 50,
  history: [
    { date: '2026-01-01', credits: 2.5, value: 125 },
    { date: '2026-02-01', credits: 3.0, value: 150 },
    { date: '2026-03-01', credits: 2.0, value: 100 },
    { date: '2026-04-01', credits: 2.5, value: 125 },
    { date: '2026-05-01', credits: 2.5, value: 125 }
  ]
}

export default {
  demoFields,
  demoActivities,
  demoStats,
  demoSoilData,
  nutrientHeatmap,
  demoPredictions,
  demoCarbonData
}
