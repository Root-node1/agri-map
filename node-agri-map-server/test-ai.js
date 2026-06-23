const aiService = require('./src/services/aiService');
const logger = require('./src/utils/logger');

async function testAI() {
  console.log('🧪 Testing AI Service...\n');

  try {
    // Test 1: Crop Detection
    console.log('📊 Test 1: Crop Detection');
    const cropResult = await aiService.detectCrop({ imageData: 'base64_data_here' });
    console.log('Result:', JSON.stringify(cropResult, null, 2));
    console.log('✅ Crop Detection Passed\n');

    // Test 2: Soil Analysis
    console.log('🌱 Test 2: Soil Analysis');
    const soilResult = await aiService.analyzeSoil({ soilData: 'sample_data' });
    console.log('Result:', JSON.stringify(soilResult, null, 2));
    console.log('✅ Soil Analysis Passed\n');

    // Test 3: Carbon Sequestration
    console.log('🌿 Test 3: Carbon Sequestration');
    const carbonResult = await aiService.predictCarbonSequestration({ fieldId: 'field_123', area: 5 });
    console.log('Result:', JSON.stringify(carbonResult, null, 2));
    console.log('✅ Carbon Sequestration Passed\n');

    // Test 4: Yield Prediction
    console.log('🌾 Test 4: Yield Prediction');
    const yieldResult = await aiService.predictYield({ fieldId: 'field_123', area: 5 });
    console.log('Result:', JSON.stringify(yieldResult, null, 2));
    console.log('✅ Yield Prediction Passed\n');

    // Test 5: Vegetation Health
    console.log('🌳 Test 5: Vegetation Health');
    const vegResult = await aiService.analyzeVegetationHealth({ vegetationData: 'sample_data' });
    console.log('Result:', JSON.stringify(vegResult, null, 2));
    console.log('✅ Vegetation Health Passed\n');

    // Test 6: Comprehensive Field Analysis
    console.log('🏡 Test 6: Comprehensive Field Analysis');
    const fieldResult = await aiService.analyzeField({
      fieldId: 'field_123',
      imageData: 'base64_data',
      soilData: 'sample_data',
      area: 5
    });
    console.log('Result:', JSON.stringify(fieldResult, null, 2));
    console.log('✅ Comprehensive Field Analysis Passed\n');

    console.log('🎉 All AI Tests Passed!');
  } catch (error) {
    console.error('❌ AI Test Failed:', error);
  }
}

testAI();
