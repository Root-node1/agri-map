const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    unique: true,
    sparse: true,
    // Remove required validation
    default: null
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
    required: true,
    default: 'farmer'
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
    ref: 'Cooperative',
    default: null
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
  },
  settings: {
    language: { type: String, default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true }
    }
  }
}, { timestamps: true });

// Generate userId BEFORE validation
userSchema.pre('validate', async function (next) {
  if (this.isNew && !this.userId) {
    try {
      const lastUser = await this.constructor.findOne().sort({ createdAt: -1 });
      let lastId = 0;
      if (lastUser && lastUser.userId) {
        const match = lastUser.userId.match(/usr_(\d+)/);
        if (match) {
          lastId = parseInt(match[1]) || 0;
        }
      }
      this.userId = `usr_${String(lastId + 1).padStart(4, '0')}`;
      console.log('✅ Generated userId:', this.userId);
    } catch (error) {
      console.error('❌ Error generating userId:', error);
      // Fallback
      this.userId = `usr_${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove userId from required validation
userSchema.path('userId').required(false);

module.exports = mongoose.model('User', userSchema);
