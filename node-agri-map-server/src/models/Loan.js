const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
  loanId: { type: String, required: true, unique: true },
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: "Cooperative", required: true },
  amount: { type: Number, required: true, min: 0 },
  purpose: { type: String, required: true, enum: ["irrigation_upgrade", "seeds_fertilizers", "farm_equipment", "land_acquisition", "training_extension", "processing_facility", "storage_infrastructure", "renewable_energy", "carbon_credits", "working_capital", "others"] },
  purposeDescription: { type: String, trim: true },
  interestRate: { type: Number, required: true, min: 0 },
  tenureMonths: { type: Number, required: true, min: 1, max: 60 },
  repaymentSchedule: { type: String, enum: ["weekly", "monthly", "quarterly"], default: "monthly" },
  status: { type: String, enum: ["pending", "under_review", "approved", "rejected", "disbursed", "active", "completed", "defaulted"], default: "pending" },
  disbursementDate: { type: Date, default: null },
  dueDate: { type: Date, default: null },
  totalPaid: { type: Number, default: 0 },
  totalAmountDue: { type: Number, default: 0 },
  remainingBalance: { type: Number, default: 0 },
  installments: [{
    installmentNumber: Number,
    amount: Number,
    dueDate: Date,
    paidDate: Date,
    status: { type: String, enum: ["pending", "paid", "overdue"], default: "pending" },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }
  }],
  creditScoreAtApplication: { type: Number },
  collateral: { type: String, default: null },
  coSigner: { name: String, phone: String, email: String },
  reviewNotes: [{
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    note: String,
    date: { type: Date, default: Date.now }
  }],
  fieldInsights: {
    cropType: String,
    soilHealth: Object,
    carbonSequestration: Number,
    vegetationIndex: Number,
    fieldArea: Number
  },
  riskScore: { type: Number, min: 0, max: 100, default: 50 },
  riskFactors: [String],
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rejectionReason: { type: String, default: null }
}, { timestamps: true });

loanSchema.pre("save", function (next) {
  if (this.isNew) {
    this.loanId = `loan_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.totalAmountDue = this.amount + (this.amount * this.interestRate * this.tenureMonths) / 1200;
    this.remainingBalance = this.totalAmountDue;
  }
  next();
});

module.exports = mongoose.model("Loan", loanSchema);
