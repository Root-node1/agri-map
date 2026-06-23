const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["credit", "debit"], required: true },
  category: { type: String, enum: ["loan_disbursement", "loan_repayment", "carbon_credit_sale", "carbon_credit_purchase", "payment", "disbursement", "transfer", "fee", "refund", "deposit", "withdrawal"], required: true },
  status: { type: String, enum: ["pending", "completed", "failed", "cancelled"], default: "pending" },
  description: { type: String, trim: true },
  reference: { type: String, default: null },
  metadata: {
    paymentMethod: String,
    transactionReference: String,
    bankReference: String,
    blockchainTxHash: String,
    relatedEntity: String,
    relatedEntityId: String
  },
  errorDetails: { type: String, default: null },
  completedAt: { type: Date, default: null }
}, { timestamps: true });

transactionSchema.pre("save", function (next) {
  if (this.isNew) {
    this.transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }
  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);
