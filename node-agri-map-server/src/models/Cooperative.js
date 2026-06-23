const mongoose = require("mongoose");

const cooperativeSchema = new mongoose.Schema({
  cooperativeId: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  registrationNumber: { type: String, required: true, unique: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    joinedDate: { type: Date, default: Date.now },
    role: { type: String, enum: ["member", "admin"], default: "member" }
  }],
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: { type: [Number], index: "2dsphere" }
  },
  totalFarmers: { type: Number, default: 0 },
  totalLandArea: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  creditScore: { type: Number, min: 0, max: 100, default: 0 },
  status: { type: String, enum: ["active", "suspended", "pending"], default: "pending" },
  carbonCreditsEarned: { type: Number, default: 0 },
  carbonCreditsSold: { type: Number, default: 0 }
}, { timestamps: true });

cooperativeSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastCoop = await this.constructor.findOne().sort({ createdAt: -1 });
    const lastId = lastCoop ? parseInt(lastCoop.cooperativeId.split("_")[1]) : 0;
    this.cooperativeId = `coop_${String(lastId + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Cooperative", cooperativeSchema);
