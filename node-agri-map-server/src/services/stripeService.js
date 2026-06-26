const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../utils/logger');

class StripeService {
  constructor() {
    this.stripe = stripe;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    this.currency = process.env.STRIPE_CURRENCY || 'usd';
  }

  // Create a payment intent
  async createPaymentIntent(amount, metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: this.currency,
        metadata: {
          ...metadata,
          environment: process.env.NODE_ENV,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info(`Payment intent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      logger.error('Stripe payment intent error:', error);
      throw error;
    }
  }

  // Confirm a payment intent
  async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        {
          payment_method: paymentMethodId,
        }
      );
      return paymentIntent;
    } catch (error) {
      logger.error('Stripe confirm payment error:', error);
      throw error;
    }
  }

  // Create a customer
  async createCustomer(email, name, metadata = {}) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata,
      });
      logger.info(`Customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      logger.error('Stripe create customer error:', error);
      throw error;
    }
  }

  // Create a subscription
  async createSubscription(customerId, priceId, metadata = {}) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      return subscription;
    } catch (error) {
      logger.error('Stripe create subscription error:', error);
      throw error;
    }
  }

  // Create a charge
  async createCharge(amount, customerId, description, metadata = {}) {
    try {
      const charge = await this.stripe.charges.create({
        amount: Math.round(amount * 100),
        currency: this.currency,
        customer: customerId,
        description,
        metadata,
      });
      return charge;
    } catch (error) {
      logger.error('Stripe create charge error:', error);
      throw error;
    }
  }

  // Create a refund
  async createRefund(chargeId, amount, reason = 'requested_by_customer') {
    try {
      const refund = await this.stripe.refunds.create({
        charge: chargeId,
        amount: Math.round(amount * 100),
        reason,
      });
      logger.info(`Refund created: ${refund.id}`);
      return refund;
    } catch (error) {
      logger.error('Stripe create refund error:', error);
      throw error;
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );
      return event;
    } catch (error) {
      logger.error('Stripe webhook verification error:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  // Get balance
  async getBalance() {
    try {
      const balance = await this.stripe.balance.retrieve();
      return balance;
    } catch (error) {
      logger.error('Stripe get balance error:', error);
      throw error;
    }
  }

  // Create a product
  async createProduct(name, description, metadata = {}) {
    try {
      const product = await this.stripe.products.create({
        name,
        description,
        metadata,
      });
      return product;
    } catch (error) {
      logger.error('Stripe create product error:', error);
      throw error;
    }
  }

  // Create a price
  async createPrice(productId, unitAmount, currency = 'usd') {
    try {
      const price = await this.stripe.prices.create({
        product: productId,
        unit_amount: Math.round(unitAmount * 100),
        currency,
      });
      return price;
    } catch (error) {
      logger.error('Stripe create price error:', error);
      throw error;
    }
  }
}

const stripeService = new StripeService();
module.exports = { stripeService };