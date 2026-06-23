const logger = require('../utils/logger');

class ChatbotService {
  constructor() {
    this.conversations = new Map();
    this.intents = {
      greetings: {
        patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        responses: [
          'Hello! Welcome to AgriMap AI Assistant. How can I help you today? 🌾',
          'Hi there! I\'m your agricultural AI assistant. What can I do for you?',
          'Greetings, farmer! I\'m here to help with your agricultural needs. 🌱'
        ]
      },
      crop: {
        patterns: ['crop', 'plant', 'grow', 'cultivate', 'harvest'],
        responses: [
          'I can help you identify crops, predict yields, and provide growing recommendations. What specific crop information do you need?',
          'Great question! For crop management, I can help with: crop detection, yield prediction, pest control, and harvest optimization. What interests you?',
          'Crops are the heart of farming! I can assist with crop selection, disease detection, and optimal growing conditions.'
        ]
      },
      soil: {
        patterns: ['soil', 'nutrient', 'fertilizer', 'ph', 'organic'],
        responses: [
          'Soil health is crucial! I can analyze soil nutrients (N, P, K), pH levels, moisture content, and provide improvement recommendations.',
          'Let me help you understand your soil better. I can analyze: nitrogen, phosphorus, potassium, pH, organic matter, and moisture levels.',
          'Good soil = good harvest! I can provide detailed soil analysis and recommend fertilizers or amendments for optimal growth.'
        ]
      },
      carbon: {
        patterns: ['carbon', 'credit', 'sequestration', 'climate', 'emission'],
        responses: [
          'Carbon credits are a great way to earn from sustainable farming! I can help you calculate carbon sequestration and tokenize your credits.',
          'Green farming pays! I can calculate your carbon footprint, estimate carbon credits, and help you monetize them.',
          'Let\'s talk carbon! I can help you understand carbon sequestration, verify your credits, and connect you with the carbon marketplace.'
        ]
      },
      loan: {
        patterns: ['loan', 'finance', 'credit', 'fund', 'money', 'capital'],
        responses: [
          'I can help you with agricultural financing! We offer loans for irrigation, equipment, seeds, land acquisition, and more.',
          'Need funding? I can guide you through the loan application process, check your eligibility, and explain repayment options.',
          'Financial support for farmers! I can help with loan applications, carbon credit financing, and equipment funding.'
        ]
      },
      weather: {
        patterns: ['weather', 'rain', 'temperature', 'climate', 'forecast'],
        responses: [
          'Weather plays a crucial role in farming! I can provide weather forecasts, climate trends, and irrigation recommendations.',
          'Let me check the weather patterns for your region. I can help with planting schedules, irrigation planning, and risk management.',
          'Smart farming with weather data! I can analyze weather trends and provide actionable insights for your farm.'
        ]
      },
      help: {
        patterns: ['help', 'support', 'guide', 'tutorial', 'how to'],
        responses: [
          'I\'m here to help! I can assist with: 🌾 Crop Management, 🌱 Soil Analysis, 💰 Farm Financing, 🌿 Carbon Credits, 📊 Yield Predictions, and more!',
          'Need assistance? I can guide you through: crop detection, soil analysis, loan applications, carbon credit management, and AI-powered farming insights.',
          'Welcome to AgriMap! I can help with: crop planning, soil health, financing, carbon credits, and sustainable farming practices.'
        ]
      }
    };
    logger.info('Chatbot service initialized');
  }

  // Process user message
  async processMessage(userId, message, context = {}) {
    try {
      // Get or create conversation
      if (!this.conversations.has(userId)) {
        this.conversations.set(userId, {
          history: [],
          context: {},
          intents: {}
        });
      }

      const conversation = this.conversations.get(userId);
      
      // Detect intent
      const intent = this.detectIntent(message);
      
      // Generate response
      const response = this.generateResponse(intent, message, context);
      
      // Update conversation history
      conversation.history.push({
        user: message,
        bot: response,
        intent: intent,
        timestamp: new Date().toISOString()
      });

      // Keep only last 20 messages
      if (conversation.history.length > 20) {
        conversation.history = conversation.history.slice(-20);
      }

      // Update context
      conversation.context = {
        ...conversation.context,
        ...context,
        lastIntent: intent,
        lastMessage: message
      };

      // Increment intent counter
      conversation.intents[intent] = (conversation.intents[intent] || 0) + 1;

      logger.info(`Chatbot: User ${userId} - Intent: ${intent}`);

      return {
        response,
        intent,
        history: conversation.history,
        confidence: this.getConfidence(message, intent)
      };

    } catch (error) {
      logger.error('Chatbot error:', error);
      return {
        response: "I'm sorry, I encountered an error. Please try again or contact support.",
        intent: 'error',
        history: [],
        confidence: 0
      };
    }
  }

  // Detect intent from message
  detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    for (const [intent, data] of Object.entries(this.intents)) {
      for (const pattern of data.patterns) {
        if (lowerMessage.includes(pattern)) {
          return intent;
        }
      }
    }
    
    // Check for questions
    if (lowerMessage.includes('?')) {
      return 'question';
    }
    
    return 'general';
  }

  // Generate response based on intent
  generateResponse(intent, message, context) {
    const responses = {
      greetings: () => {
        const greetings = this.intents.greetings.responses;
        return greetings[Math.floor(Math.random() * greetings.length)];
      },
      crop: () => {
        const cropResponses = this.intents.crop.responses;
        const response = cropResponses[Math.floor(Math.random() * cropResponses.length)];
        return `${response} For example, I can detect crops from satellite images with 92% accuracy!`;
      },
      soil: () => {
        const soilResponses = this.intents.soil.responses;
        const response = soilResponses[Math.floor(Math.random() * soilResponses.length)];
        return `${response} I can also track soil degradation risk and provide organic farming recommendations.`;
      },
      carbon: () => {
        const carbonResponses = this.intents.carbon.responses;
        const response = carbonResponses[Math.floor(Math.random() * carbonResponses.length)];
        return `${response} Currently, carbon credits are valued at $50 per ton on our marketplace.`;
      },
      loan: () => {
        const loanResponses = this.intents.loan.responses;
        const response = loanResponses[Math.floor(Math.random() * loanResponses.length)];
        return `${response} Our loans start from $500 with competitive interest rates and flexible repayment terms.`;
      },
      weather: () => {
        const weatherResponses = this.intents.weather.responses;
        const response = weatherResponses[Math.floor(Math.random() * weatherResponses.length)];
        return `${response} I can integrate with weather APIs to provide real-time forecasts for your location.`;
      },
      help: () => {
        const helpResponses = this.intents.help.responses;
        const response = helpResponses[Math.floor(Math.random() * helpResponses.length)];
        return `${response} Just type your question and I'll do my best to assist! 🌾`;
      },
      question: () => {
        return "That's a great question! I'm still learning, but I can help with crop management, soil analysis, financing, and carbon credits. What specific information do you need?";
      },
      general: () => {
        const genericResponses = [
          "I understand you're asking about farming. I can help with crop detection, soil analysis, carbon credits, and farm financing. What would you like to know?",
          "Interesting! Let me help you with that. I specialize in agricultural AI - crop detection, soil analysis, yield prediction, and carbon credit management.",
          "I'm your agricultural AI assistant! I can help with crop management, soil health, farm financing, and sustainability. What's on your mind?",
          "Let me think about that... I can provide insights on crops, soil, financing, and carbon credits. Could you be more specific about what you need?"
        ];
        return genericResponses[Math.floor(Math.random() * genericResponses.length)];
      }
    };

    return responses[intent] ? responses[intent]() : responses.general();
  }

  // Get confidence score for intent detection
  getConfidence(message, intent) {
    if (intent === 'general') return 0.3;
    if (intent === 'question') return 0.4;
    if (intent === 'greetings') return 0.6;
    
    // Check if message contains multiple keywords
    const keywords = ['crop', 'soil', 'carbon', 'loan', 'weather', 'help'];
    let matches = 0;
    const lowerMessage = message.toLowerCase();
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) matches++;
    }
    
    if (matches > 1) return 0.8 + (Math.random() * 0.15);
    if (matches === 1) return 0.6 + (Math.random() * 0.2);
    return 0.5 + (Math.random() * 0.3);
  }

  // Get conversation history
  getHistory(userId) {
    if (!this.conversations.has(userId)) {
      return [];
    }
    return this.conversations.get(userId).history;
  }

  // Clear conversation history
  clearHistory(userId) {
    if (this.conversations.has(userId)) {
      this.conversations.delete(userId);
      return true;
    }
    return false;
  }

  // Get conversation analytics
  getAnalytics(userId) {
    if (!this.conversations.has(userId)) {
      return null;
    }
    const conversation = this.conversations.get(userId);
    return {
      totalMessages: conversation.history.length,
      intents: conversation.intents,
      lastInteraction: conversation.history.length > 0 ? 
        conversation.history[conversation.history.length - 1].timestamp : null,
      context: conversation.context
    };
  }

  // Generate farm recommendation
  async getFarmRecommendation(userId, farmData) {
    const recommendations = [];
    
    // Soil recommendations
    if (farmData.soil) {
      if (farmData.soil.nitrogen < 0.4) {
        recommendations.push('🌱 Apply nitrogen-rich fertilizer to improve soil fertility');
      }
      if (farmData.soil.moisture < 0.3) {
        recommendations.push('💧 Increase irrigation or consider drought-resistant crops');
      }
      if (farmData.soil.ph < 5.5) {
        recommendations.push('🧪 Add lime to balance soil pH levels');
      }
    }

    // Crop recommendations
    if (farmData.crop) {
      if (farmData.crop.healthScore < 0.5) {
        recommendations.push('🌿 Monitor for pests and diseases, consider organic treatment');
      }
      recommendations.push(`📊 Expected yield: ${farmData.crop.expectedYield || 'unknown'} tons/hectare`);
    }

    // Carbon recommendations
    if (farmData.carbon) {
      recommendations.push(`🌍 Carbon sequestration potential: ${farmData.carbon.tons || 0} tons CO2/hectare`);
      recommendations.push('💰 Carbon credit value: $' + ((farmData.carbon.tons || 0) * 50).toFixed(2));
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Your farm is in good condition! Continue sustainable practices.');
      recommendations.push('📈 Consider adding more data for personalized recommendations.');
    }

    return recommendations;
  }
}

module.exports = new ChatbotService();
