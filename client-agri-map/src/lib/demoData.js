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
