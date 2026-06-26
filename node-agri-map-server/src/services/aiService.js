const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.models = {
      cropDetection: {
        modelPath: path.join(__dirname, '../../ai_models/crop_detection'),
        version: '1.0.0',
      },
      soilAnalysis: {
        modelPath: path.join(__dirname, '../../ai_models/soil_analysis'),
        version: '1.0.0',
      },
      carbonSequestration: {
        modelPath: path.join(__dirname, '../../ai_models/carbon_prediction'),
        version: '1.0.0',
      },
      yieldPrediction: {
        modelPath: path.join(__dirname, '../../ai_models/yield_prediction'),
        version: '1.0.0',
      },
      vegetationHealth: {
        modelPath: path.join(__dirname, '../../ai_models/vegetation_health'),
        version: '1.0.0',
      }
    };
    logger.info('AI Service initialized');
  }

  // ============ CROP DETECTION ============
  
  async detectCrop(imageData, options = {}) {
    logger.info('Detecting crop from image data');
    
    try {
      if (process.env.USE_PYTHON_AI === 'true') {
        return await this.runPythonScript('crop_detection', { imageData, options });
      }
      return this.mockCropDetection(imageData);
    } catch (error) {
      logger.error('Crop detection error:', error);
      return this.fallbackCropDetection();
    }
  }

  mockCropDetection(imageData) {
    const crops = [
      'maize', 'wheat', 'rice', 'soybean', 'sunflower', 
      'cotton', 'sugarcane', 'potato', 'tomato', 'coffee'
    ];
    
    const selectedCrop = crops[Math.floor(Math.random() * crops.length)];
    const confidence = 0.75 + Math.random() * 0.2;
    
    return {
      cropType: selectedCrop,
      confidence: parseFloat(confidence.toFixed(3)),
      healthScore: parseFloat((0.6 + Math.random() * 0.35).toFixed(3)),
      growthStage: this.getGrowthStage(),
      detectedAt: new Date().toISOString(),
      modelVersion: this.models.cropDetection.version,
      isMock: true,
      details: {
        scientificName: this.getScientificName(selectedCrop),
        family: this.getCropFamily(selectedCrop),
        season: this.getCropSeason(selectedCrop),
        expectedYield: parseFloat((2 + Math.random() * 8).toFixed(1)),
      }
    };
  }

  fallbackCropDetection() {
    return {
      cropType: 'unknown',
      confidence: 0.3,
      healthScore: 0.5,
      growthStage: 'unknown',
      detectedAt: new Date().toISOString(),
      isFallback: true,
      message: 'Using fallback detection due to error'
    };
  }

  getGrowthStage() {
    const stages = ['germination', 'vegetative', 'flowering', 'fruit_development', 'maturity'];
    return stages[Math.floor(Math.random() * stages.length)];
  }

  getScientificName(crop) {
    const names = {
      maize: 'Zea mays',
      wheat: 'Triticum aestivum',
      rice: 'Oryza sativa',
      soybean: 'Glycine max',
      sunflower: 'Helianthus annuus',
      cotton: 'Gossypium hirsutum',
      sugarcane: 'Saccharum officinarum',
      potato: 'Solanum tuberosum',
      tomato: 'Solanum lycopersicum',
      coffee: 'Coffea arabica'
    };
    return names[crop] || 'Unknown species';
  }

  getCropFamily(crop) {
    const families = {
      maize: 'Poaceae',
      wheat: 'Poaceae',
      rice: 'Poaceae',
      soybean: 'Fabaceae',
      sunflower: 'Asteraceae',
      cotton: 'Malvaceae',
      sugarcane: 'Poaceae',
      potato: 'Solanaceae',
      tomato: 'Solanaceae',
      coffee: 'Rubiaceae'
    };
    return families[crop] || 'Unknown family';
  }

  getCropSeason(crop) {
    const seasons = {
      maize: ['rainy', 'dry'],
      wheat: ['winter', 'spring'],
      rice: ['rainy', 'irrigated'],
      soybean: ['rainy', 'summer'],
      sunflower: ['summer', 'dry'],
      cotton: ['rainy', 'dry'],
      sugarcane: ['year-round', 'rainy'],
      potato: ['cool', 'temperate'],
      tomato: ['warm', 'temperate'],
      coffee: ['rainy', 'dry']
    };
    const seasonsList = seasons[crop] || ['temperate'];
    return seasonsList[Math.floor(Math.random() * seasonsList.length)];
  }

  // ============ SOIL ANALYSIS ============
  
  async analyzeSoil(data, options = {}) {
    logger.info('Analyzing soil data');
    
    try {
      if (process.env.USE_PYTHON_AI === 'true') {
        return await this.runPythonScript('soil_analysis', { data, options });
      }
      return this.mockSoilAnalysis(data);
    } catch (error) {
      logger.error('Soil analysis error:', error);
      return this.fallbackSoilAnalysis();
    }
  }

  mockSoilAnalysis(data) {
    return {
      nitrogen: parseFloat((0.3 + Math.random() * 0.5).toFixed(2)),
      phosphorus: parseFloat((0.2 + Math.random() * 0.4).toFixed(2)),
      potassium: parseFloat((0.3 + Math.random() * 0.5).toFixed(2)),
      ph: parseFloat((5.5 + Math.random() * 2).toFixed(1)),
      organicMatter: parseFloat((1 + Math.random() * 3).toFixed(1)),
      moisture: parseFloat((0.3 + Math.random() * 0.5).toFixed(2)),
      temperature: parseFloat((20 + Math.random() * 10).toFixed(1)),
      healthIndex: parseFloat((0.5 + Math.random() * 0.4).toFixed(2)),
      fertility: this.getFertilityLevel(),
      degradationRisk: this.getDegradationRisk(),
      recommendations: this.getSoilRecommendations(),
      analyzedAt: new Date().toISOString(),
      isMock: true
    };
  }

  fallbackSoilAnalysis() {
    return {
      nitrogen: 0.5,
      phosphorus: 0.3,
      potassium: 0.4,
      ph: 6.5,
      organicMatter: 2.0,
      moisture: 0.4,
      temperature: 25,
      healthIndex: 0.5,
      fertility: 'moderate',
      degradationRisk: 'low',
      recommendations: ['Add organic matter', 'Monitor moisture levels'],
      isFallback: true
    };
  }

  getFertilityLevel() {
    const levels = ['low', 'moderate', 'high', 'very_high'];
    return levels[Math.floor(Math.random() * levels.length)];
  }

  getDegradationRisk() {
    const risks = ['low', 'moderate', 'high', 'severe'];
    return risks[Math.floor(Math.random() * risks.length)];
  }

  getSoilRecommendations() {
    const recommendations = [
      'Add organic compost',
      'Apply nitrogen-rich fertilizer',
      'Improve drainage',
      'Add lime to adjust pH',
      'Reduce chemical inputs',
      'Implement crop rotation',
      'Use cover crops',
      'Apply phosphorus fertilizer',
      'Monitor soil moisture',
      'Add potassium-rich fertilizer'
    ];
    const count = 2 + Math.floor(Math.random() * 3);
    const shuffled = recommendations.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // ============ CARBON SEQUESTRATION ============
  
  async predictCarbonSequestration(data, options = {}) {
    logger.info('Predicting carbon sequestration');
    
    try {
      if (process.env.USE_PYTHON_AI === 'true') {
        return await this.runPythonScript('carbon_prediction', { data, options });
      }
      return this.mockCarbonPrediction(data);
    } catch (error) {
      logger.error('Carbon prediction error:', error);
      return this.fallbackCarbonPrediction();
    }
  }

  mockCarbonPrediction(data) {
    const tonsPerHectare = 0.5 + Math.random() * 4.5;
    
    return {
      carbonTonsPerHectare: parseFloat(tonsPerHectare.toFixed(2)),
      totalCarbonSequestration: parseFloat((tonsPerHectare * (data.area || 1)).toFixed(2)),
      carbonCredits: parseFloat((tonsPerHectare * (data.area || 1) * 0.8).toFixed(2)),
      confidenceScore: parseFloat((0.7 + Math.random() * 0.25).toFixed(3)),
      methodology: 'NDVI-based estimation with AI',
      verificationStatus: 'pending',
      estimatedValue: parseFloat((tonsPerHectare * (data.area || 1) * 50).toFixed(2)),
      predictedAt: new Date().toISOString(),
      isMock: true,
      factors: {
        vegetationHealth: parseFloat((0.6 + Math.random() * 0.35).toFixed(2)),
        soilQuality: parseFloat((0.5 + Math.random() * 0.4).toFixed(2)),
        landUse: 'agricultural',
        climateZone: 'temperate'
      },
      recommendations: [
        'Increase crop diversity for better carbon storage',
        'Implement no-till farming',
        'Use cover crops during off-season'
      ]
    };
  }

  fallbackCarbonPrediction() {
    return {
      carbonTonsPerHectare: 1.5,
      totalCarbonSequestration: 1.5,
      carbonCredits: 1.2,
      confidenceScore: 0.5,
      methodology: 'Fallback estimation',
      isFallback: true
    };
  }

  // ============ YIELD PREDICTION ============
  
  async predictYield(data, options = {}) {
    logger.info('Predicting crop yield');
    
    try {
      if (process.env.USE_PYTHON_AI === 'true') {
        return await this.runPythonScript('yield_prediction', { data, options });
      }
      return this.mockYieldPrediction(data);
    } catch (error) {
      logger.error('Yield prediction error:', error);
      return this.fallbackYieldPrediction();
    }
  }

  mockYieldPrediction(data) {
    const baseYield = 2 + Math.random() * 8;
    const area = data.area || 1;
    
    return {
      predictedYieldPerHectare: parseFloat(baseYield.toFixed(1)),
      totalPredictedYield: parseFloat((baseYield * area).toFixed(1)),
      unit: 'tons/hectare',
      confidenceInterval: {
        lower: parseFloat((baseYield * 0.8).toFixed(1)),
        upper: parseFloat((baseYield * 1.2).toFixed(1))
      },
      confidenceScore: parseFloat((0.7 + Math.random() * 0.25).toFixed(3)),
      factors: {
        weatherImpact: parseFloat((0.6 + Math.random() * 0.3).toFixed(2)),
        soilQuality: parseFloat((0.5 + Math.random() * 0.4).toFixed(2)),
        cropHealth: parseFloat((0.6 + Math.random() * 0.35).toFixed(2))
      },
      predictedAt: new Date().toISOString(),
      isMock: true,
      recommendations: [
        'Optimize irrigation for better yield',
        'Apply balanced fertilizer',
        'Monitor pest pressure'
      ]
    };
  }

  fallbackYieldPrediction() {
    return {
      predictedYieldPerHectare: 4.0,
      totalPredictedYield: 4.0,
      unit: 'tons/hectare',
      confidenceScore: 0.5,
      isFallback: true
    };
  }

  // ============ VEGETATION HEALTH ============
  
  async analyzeVegetationHealth(data, options = {}) {
    logger.info('Analyzing vegetation health');
    
    try {
      if (process.env.USE_PYTHON_AI === 'true') {
        return await this.runPythonScript('vegetation_health', { data, options });
      }
      return this.mockVegetationHealth(data);
    } catch (error) {
      logger.error('Vegetation health analysis error:', error);
      return this.fallbackVegetationHealth();
    }
  }

  mockVegetationHealth(data) {
    const ndvi = 0.3 + Math.random() * 0.6;
    
    return {
      ndvi: parseFloat(ndvi.toFixed(3)),
      evi: parseFloat((ndvi * 0.8 + 0.1).toFixed(3)),
      healthStatus: this.getHealthStatus(ndvi),
      chlorophyllContent: parseFloat((30 + Math.random() * 40).toFixed(1)),
      canopyCover: parseFloat((40 + Math.random() * 50).toFixed(1)),
      stressIndicators: this.getStressIndicators(ndvi),
      trends: {
        weekly: this.generateTrend(7),
        monthly: this.generateTrend(30)
      },
      analyzedAt: new Date().toISOString(),
      isMock: true,
      recommendations: this.getVegetationRecommendations(ndvi)
    };
  }

  fallbackVegetationHealth() {
    return {
      ndvi: 0.5,
      evi: 0.5,
      healthStatus: 'moderate',
      chlorophyllContent: 50,
      canopyCover: 60,
      stressIndicators: ['unknown'],
      isFallback: true
    };
  }

  getHealthStatus(ndvi) {
    if (ndvi > 0.6) return 'excellent';
    if (ndvi > 0.4) return 'good';
    if (ndvi > 0.2) return 'moderate';
    return 'poor';
  }

  getStressIndicators(ndvi) {
    const indicators = [];
    if (ndvi < 0.3) indicators.push('drought_stress');
    if (ndvi < 0.4) indicators.push('nutrient_deficiency');
    if (ndvi > 0.8) indicators.push('vigorous_growth');
    if (ndvi < 0.2) indicators.push('pest_damage');
    if (indicators.length === 0) indicators.push('healthy');
    return indicators;
  }

  getVegetationRecommendations(ndvi) {
    const recommendations = [];
    if (ndvi < 0.3) {
      recommendations.push('Increase irrigation');
      recommendations.push('Apply nitrogen fertilizer');
    } else if (ndvi < 0.5) {
      recommendations.push('Monitor moisture levels');
      recommendations.push('Consider additional nutrients');
    } else if (ndvi > 0.7) {
      recommendations.push('Maintain current practices');
      recommendations.push('Monitor for pests');
    }
    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring');
    }
    return recommendations;
  }

  generateTrend(days) {
    const trend = [];
    let value = 0.3 + Math.random() * 0.4;
    for (let i = 0; i < days; i++) {
      value = Math.min(1, Math.max(0.1, value + (Math.random() - 0.5) * 0.05));
      trend.push(parseFloat(value.toFixed(3)));
    }
    return trend;
  }

  // ============ PYTHON INTEGRATION ============
  
  async runPythonScript(scriptName, data) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, '../../ai_scripts', `${scriptName}.py`);
      
      if (!fs.existsSync(scriptPath)) {
        logger.warn(`Python script ${scriptPath} not found, using mock`);
        const mockMethod = this[`mock${this.capitalize(scriptName)}`];
        if (mockMethod) {
          return resolve(mockMethod.call(this, data));
        }
        return resolve({ error: 'Script not found', isFallback: true });
      }

      const pythonProcess = spawn('python3', [scriptPath, JSON.stringify(data)]);
      
      let output = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          logger.error(`Python script error: ${error}`);
          return resolve(this.fallbackResponse(scriptName, data));
        }
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (parseError) {
          logger.error('Failed to parse Python output:', parseError);
          resolve(this.fallbackResponse(scriptName, data));
        }
      });
    });
  }

  capitalize(str) {
    const parts = str.split('_');
    return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  }

  fallbackResponse(scriptName, data) {
    const mockMethods = {
      crop_detection: 'mockCropDetection',
      soil_analysis: 'mockSoilAnalysis',
      carbon_prediction: 'mockCarbonPrediction',
      yield_prediction: 'mockYieldPrediction',
      vegetation_health: 'mockVegetationHealth'
    };
    
    const methodName = mockMethods[scriptName];
    if (this[methodName]) {
      return this[methodName](data);
    }
    return { error: 'Fallback response', isFallback: true };
  }

  // ============ COMPREHENSIVE ANALYSIS ============
  
  async analyzeField(fieldData) {
    logger.info('Performing comprehensive field analysis');
    
    try {
      const [crop, soil, carbon, yield_analysis, vegetation] = await Promise.all([
        this.detectCrop(fieldData.imageData),
        this.analyzeSoil(fieldData.soilData),
        this.predictCarbonSequestration(fieldData),
        this.predictYield(fieldData),
        this.analyzeVegetationHealth(fieldData)
      ]);

      return {
        fieldId: fieldData.fieldId,
        crop,
        soil,
        carbon,
        yield: yield_analysis,
        vegetation,
        overallHealth: this.calculateOverallHealth(crop, soil, vegetation),
        riskScore: this.calculateRiskScore(soil, vegetation),
        recommendations: this.generateComprehensiveRecommendations(crop, soil, vegetation),
        analyzedAt: new Date().toISOString(),
        isMock: crop.isMock || soil.isMock || carbon.isMock
      };
    } catch (error) {
      logger.error('Field analysis error:', error);
      return this.fallbackFieldAnalysis(fieldData);
    }
  }

  calculateOverallHealth(crop, soil, vegetation) {
    const scores = [
      crop.healthScore || 0.5,
      soil.healthIndex || 0.5,
      vegetation.healthStatus === 'excellent' ? 0.9 : 
      vegetation.healthStatus === 'good' ? 0.7 :
      vegetation.healthStatus === 'moderate' ? 0.5 : 0.3
    ];
    return parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
  }

  calculateRiskScore(soil, vegetation) {
    let risk = 0;
    
    if (soil.degradationRisk === 'severe') risk += 0.3;
    else if (soil.degradationRisk === 'high') risk += 0.2;
    else if (soil.degradationRisk === 'moderate') risk += 0.1;
    
    if (vegetation.healthStatus === 'poor') risk += 0.3;
    else if (vegetation.healthStatus === 'moderate') risk += 0.15;
    
    return parseFloat(Math.min(risk, 1).toFixed(2));
  }

  generateComprehensiveRecommendations(crop, soil, vegetation) {
    const recommendations = [];
    
    if (crop.healthScore && crop.healthScore < 0.6) {
      recommendations.push('Improve crop health through better management');
    }
    
    if (soil.recommendations) {
      recommendations.push(...soil.recommendations.slice(0, 2));
    }
    
    if (vegetation.recommendations) {
      recommendations.push(...vegetation.recommendations.slice(0, 2));
    }
    
    if (soil.fertility === 'low') {
      recommendations.push('Increase soil fertility through organic amendments');
    }
    
    if (soil.moisture < 0.3) {
      recommendations.push('Improve irrigation management');
    }
    
    return [...new Set(recommendations)].slice(0, 5);
  }

  fallbackFieldAnalysis(fieldData) {
    return {
      fieldId: fieldData.fieldId,
      overallHealth: 0.5,
      riskScore: 0.3,
      recommendations: ['Consult local agricultural extension service'],
      isFallback: true,
      message: 'Analysis failed, using fallback response'
    };
  }
}

module.exports = new AIService();
