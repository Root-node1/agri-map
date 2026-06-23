const mongoose = require("mongoose");

const carbonCreditSchema = new mongoose.Schema({
  creditId: { type: String, required: true, unique: true },
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: "Cooperative", required: true },
  fieldId: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  amountInTons: { type: Number, required: true, min: 0 },
  methodology: { type: String, required: true },
  verificationStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
  verificationDate: { type: Date, default: null },
  verificationReport: { type: String, default: null },
  confidenceScore: { type: Number, min: 0, max: 1, required: true },
  tokenized: { type: Boolean, default: false },
  tokenId: { type: String, default: null },
  blockchainTxHash: { type: String, default: null },
  status: { type: String, enum: ["available", "reserved", "sold", "retired"], default: "available" },
  pricePerTon: { type: Number, default: 0 },
  totalValue: { type: Number, default: 0 },
  soldTo: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: Date,
    amount: Number
  },
  metadata: {
    cropType: String,
    soilHealth: Object,
    vegetationIndex: Number,
    period: { start: Date, end: Date }
  },
  buyerDetails: {
    name: String,
    email: String,
    organization: String
  },
  expirationDate: { type: Date, default: null }
}, { timestamps: true });

carbonCreditSchema.pre("save", function (next) {
  if (this.isNew) {
    this.creditId = `cc_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    this.totalValue = this.amountInTons * this.pricePerTon;
  }
  next();
});

module.exports = mongoose.model("CarbonCredit", carbonCreditSchema);
