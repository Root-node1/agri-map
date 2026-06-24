const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const logger = require("../utils/logger");

class PaymentService {
  async processPayment(payment, data) {
    try {
      switch (payment.paymentMethod) {
        case "card":
          return await this.processCardPayment(payment, data);
        default:
          throw new Error("Unsupported payment method");
      }
    } catch (error) {
      logger.error("Payment processing error:", error);
      throw error;
    }
  }

  async processCardPayment(payment, data) {
    try {
      const { cardToken } = data;
      const customer = await stripe.customers.create({
        email: payment.userId.email,
        source: cardToken,
      });
      const charge = await stripe.charges.create({
        amount: Math.round(payment.amount * 100),
        currency: "usd",
        customer: customer.id,
        description: `AgriMap payment: ${payment.paymentType}`,
      });
      return { transactionId: charge.id, reference: charge.receipt_url, status: charge.status };
    } catch (error) {
      throw new Error(`Card payment failed: ${error.message}`);
    }
  }
}

const paymentService = new PaymentService();
module.exports = { paymentService };
