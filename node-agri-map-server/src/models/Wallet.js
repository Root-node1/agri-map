const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  walletId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: "Cooperative" },
  balance: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: "USD" },
  isActive: { type: Boolean, default: true },
  blockchainAddress: { type: String, default: null },
  totalCredited: { type: Number, default: 0 },
  totalDebited: { type: Number, default: 0 },
  lastTransactionDate: { type: Date, default: null },
  dailyLimit: { type: Number, default: 10000 },
  monthlyLimit: { type: Number, default: 100000 },
  dailySpent: { type: Number, default: 0 },
  monthlySpent: { type: Number, default: 0 },
  lastDailyReset: { type: Date, default: Date.now },
  lastMonthlyReset: { type: Date, default: Date.now }
}, { timestamps: true });

walletSchema.pre("save", function (next) {
  if (this.isNew) {
    this.walletId = `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
  next();
});

walletSchema.methods.updateBalance = async function (amount, type) {
  if (type === "credit") {
    this.balance += amount;
    this.totalCredited += amount;
  } else if (type === "debit") {
    if (this.balance < amount) throw new Error("Insufficient balance");
    this.balance -= amount;
    this.totalDebited += amount;
  }
  this.lastTransactionDate = new Date();
  await this.save();
  return this;
};

walletSchema.methods.checkLimit = function (amount) {
  const today = new Date();
  if (today.getDate() !== this.lastDailyReset.getDate()) {
    this.dailySpent = 0;
    this.lastDailyReset = today;
  }
  if (today.getMonth() !== this.lastMonthlyReset.getMonth()) {
    this.monthlySpent = 0;
    this.lastMonthlyReset = today;
  }
  if (this.dailySpent + amount > this.dailyLimit) throw new Error("Daily limit exceeded");
  if (this.monthlySpent + amount > this.monthlyLimit) throw new Error("Monthly limit exceeded");
  return true;
};

module.exports = mongoose.model("Wallet", walletSchema);
