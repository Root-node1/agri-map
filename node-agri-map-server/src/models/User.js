const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  password: { type: String, minlength: 8 },
  role: { type: String, enum: ['farmer', 'cooperative_admin', 'investor', 'admin', 'developer'], required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: null },
  settings: {
    language: { type: String, default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true }
    }
  },
  
  // Firebase specific fields
  firebaseUid: { type: String, unique: true, sparse: true },
  provider: { type: String, enum: ['email', 'firebase', 'google', 'facebook', 'apple'], default: 'email' },
  
  // Profile image
  profilePicture: { type: String, default: null },
  
  // Organization/Company
  organization: {
    name: { type: String },
    role: { type: String },
    industry: { type: String }
  },
  
  // API access
  apiAccess: { type: Boolean, default: false },
  refreshToken: { type: String, default: null }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastUser = await this.constructor.findOne().sort({ createdAt: -1 });
    const lastId = lastUser ? parseInt(lastUser.userId.split('_')[1]) : 0;
    this.userId = `usr_${String(lastId + 1).padStart(4, '0')}`;
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
