const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Wallet Information
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid Ethereum wallet address format'
    }
  },
  
  // Basic Profile Information
  username: {
    type: String,
    trim: true,
    maxlength: 50
  },
  
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  
  // Referral Information
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true
  },
  
  referrerAddress: {
    type: String,
    lowercase: true,
    ref: 'User',
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid referrer wallet address format'
    }
  },
  
  // Claim Information
  claimStatus: {
    type: String,
    enum: ['not_claimed', 'claimed'],
    default: 'not_claimed'
  },
  
  totalTokensClaimed: {
    type: Number,
    default: 0,
    min: 0
  },
  
  lastClaimDate: {
    type: Date
  },
  
  // Connection Information
  lastConnectedAt: {
    type: Date,
    default: Date.now
  },
  
  totalConnections: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
userSchema.index({ walletAddress: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ referrerAddress: 1 });
userSchema.index({ claimStatus: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for referral link
userSchema.virtual('referralLink').get(function() {
  if (this.referralCode) {
    return `${process.env.FRONTEND_URL || 'http://localhost:3000'}?ref=${this.referralCode}`;
  }
  return null;
});

// Pre-save middleware to generate referral code if not exists
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.referralCode) {
    this.referralCode = this.generateReferralCode();
  }
  
  // Update lastActivity
  this.updatedAt = new Date();
  
  next();
});

// Method to generate unique referral code
userSchema.methods.generateReferralCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Method to record connection
userSchema.methods.recordConnection = function() {
  this.lastConnectedAt = new Date();
  this.totalConnections += 1;
  this.updatedAt = new Date();
  return this.save();
};

// Method to update claim status
userSchema.methods.updateClaimStatus = function(amount) {
  this.claimStatus = 'claimed';
  this.totalTokensClaimed = amount;
  this.lastClaimDate = new Date();
  this.updatedAt = new Date();
  return this.save();
};

// Static method to find user by wallet address
userSchema.statics.findByWalletAddress = function(walletAddress) {
  return this.findOne({ walletAddress: walletAddress.toLowerCase() });
};

// Static method to find user by referral code
userSchema.statics.findByReferralCode = function(referralCode) {
  return this.findOne({ referralCode: referralCode.toUpperCase() });
};

module.exports = mongoose.model('User', userSchema); 