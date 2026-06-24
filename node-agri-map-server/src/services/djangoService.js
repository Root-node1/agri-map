const axios = require("axios");
const logger = require("../utils/logger");

class DjangoService {
  constructor() {
    this.baseURL = process.env.DJANGO_API_URL;
    this.apiKey = process.env.DJANGO_API_KEY;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: { Authorization: `Bearer ${this.apiKey}` },
      timeout: 30000,
    });
  }

  async getFieldInsights(cooperativeId) {
    try {
      const response = await this.client.get(`/analysis/vegetation/${cooperativeId}`);
      return response.data;
    } catch (error) {
      logger.error("Django field insights error:", error.message);
      throw error;
    }
  }
}

const djangoService = new DjangoService();
module.exports = { djangoService };
