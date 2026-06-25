const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  phone: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 8 
  },
  role: { 
    type: String, 
    enum: ['farmer', 'cooperative_admin', 'investor', 'admin', 'developer'], 
    required: true 
  },
  firstName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  lastName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  cooperativeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cooperative' 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLogin: { 
    type: Date, 
    default: null 
  },
  firebaseUid: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  provider: { 
    type: String, 
    enum: ['email', 'firebase', 'google', 'facebook', 'apple'], 
    default: 'email' 
  }
}, { timestamps: true });

// Auto-generate userId BEFORE saving
userSchema.pre('save', async function (next) {
  if (this.isNew) {
    // Generate userId if not provided
    if (!this.userId) {
      const lastUser = await this.constructor.findOne().sort({ createdAt: -1 });
      const lastId = lastUser ? parseInt(lastUser.userId?.split('_')[1] || 0) : 0;
      this.userId = `usr_${String(lastId + 1).padStart(4, '0')}`;
    }
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
