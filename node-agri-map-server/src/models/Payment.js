const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: "Cooperative" },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "USD" },
  paymentMethod: { type: String, enum: ["card", "bank_transfer", "mpesa", "blockchain", "wallet"], required: true },
  paymentType: { type: String, enum: ["loan_disbursement", "loan_repayment", "carbon_credit_purchase", "carbon_credit_payout", "deposit", "withdrawal", "fee"], required: true },
  status: { type: String, enum: ["pending", "processing", "completed", "failed", "cancelled", "refunded"], default: "pending" },
  gatewayResponse: {
    transactionId: String,
    reference: String,
    status: String,
    raw: Object
  },
  failureReason: { type: String, default: null },
  paidAt: { type: Date, default: null },
  refundDetails: {
    amount: Number,
    reason: String,
    date: Date,
    transactionId: String
  },
  metadata: {
    ip: String,
    userAgent: String,
    device: String,
    description: String
  },
  webhookReceived: { type: Boolean, default: false }
}, { timestamps: true });

paymentSchema.pre("save", function (next) {
  if (this.isNew) {
    this.paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);
