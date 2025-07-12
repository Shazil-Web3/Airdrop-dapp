const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  
  // Connection Information
  connectionTimestamps: [{
    connectedAt: {
      type: Date,
      default: Date.now
    },
    disconnectedAt: {
      type: Date
    },
    userAgent: String,
    ipAddress: String
  }],
  
  // Profile Information
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
  
  referralLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  
  // Claim Information
  claimStatus: {
    type: String,
    enum: ['not_claimed', 'claimed', 'partially_claimed'],
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
  
  // Eligibility and Verification
  isEligible: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verificationMethod: {
    type: String,
    enum: ['none', 'email', 'social', 'kyc'],
    default: 'none'
  },
  
  // Social Information
  socialLinks: {
    twitter: String,
    telegram: String,
    discord: String,
    github: String
  },
  
  // Activity Tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  totalConnections: {
    type: Number,
    default: 0
  },
  
  // Referral Statistics
  referralStats: {
    totalReferrals: {
      type: Number,
      default: 0
    },
    totalReferralRewards: {
      type: Number,
      default: 0
    },
    level1Referrals: {
      type: Number,
      default: 0
    },
    level2Referrals: {
      type: Number,
      default: 0
    },
    level3Referrals: {
      type: Number,
      default: 0
    }
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: String
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
userSchema.index({ lastActivity: -1 });

// Virtual for referral link
userSchema.virtual('referralLink').get(function() {
  if (this.referralCode) {
    return `${process.env.FRONTEND_URL || 'http://localhost:3000'}?ref=${this.referralCode}`;
  }
  return null;
});

// Virtual for total referral rewards earned
userSchema.virtual('totalReferralRewardsEarned').get(function() {
  return this.referralStats.totalReferralRewards;
});

// Pre-save middleware to generate referral code if not exists
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.referralCode) {
    this.referralCode = this.generateReferralCode();
  }
  
  // Update lastActivity
  this.lastActivity = new Date();
  
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
userSchema.methods.recordConnection = function(userAgent, ipAddress) {
  this.connectionTimestamps.push({
    connectedAt: new Date(),
    userAgent,
    ipAddress
  });
  this.totalConnections += 1;
  this.lastActivity = new Date();
  return this.save();
};

// Method to record disconnection
userSchema.methods.recordDisconnection = function() {
  if (this.connectionTimestamps.length > 0) {
    const lastConnection = this.connectionTimestamps[this.connectionTimestamps.length - 1];
    if (!lastConnection.disconnectedAt) {
      lastConnection.disconnectedAt = new Date();
    }
  }
  return this.save();
};

// Method to update referral stats
userSchema.methods.updateReferralStats = function(level, rewardAmount = 0) {
  this.referralStats.totalReferrals += 1;
  this.referralStats.totalReferralRewards += rewardAmount;
  
  switch (level) {
    case 1:
      this.referralStats.level1Referrals += 1;
      break;
    case 2:
      this.referralStats.level2Referrals += 1;
      break;
    case 3:
      this.referralStats.level3Referrals += 1;
      break;
  }
  
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

// Static method to get referral tree
userSchema.statics.getReferralTree = function(walletAddress, maxLevel = 3) {
  return this.aggregate([
    {
      $match: { walletAddress: walletAddress.toLowerCase() }
    },
    {
      $graphLookup: {
        from: 'users',
        startWith: '$walletAddress',
        connectFromField: 'walletAddress',
        connectToField: 'referrerAddress',
        as: 'referralTree',
        maxDepth: maxLevel,
        depthField: 'level'
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema); 