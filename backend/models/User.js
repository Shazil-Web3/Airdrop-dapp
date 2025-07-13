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
  
  // Referral Information
  referralCode: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 6,
    maxlength: 10
  },
  
  referrerAddress: {
    type: String,
    lowercase: true,
    trim: true,
    ref: 'User'
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
  
  // Multi-level referral chain (up to 3 levels)
  referralChain: [{
    level: {
      type: Number,
      min: 1,
      max: 3
    },
    walletAddress: {
      type: String,
      lowercase: true,
      trim: true
    },
    referralCode: {
      type: String,
      uppercase: true,
      trim: true
    }
  }],
  
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
  
  // Referral Rewards
  referralRewards: {
    level1: {
      type: Number,
      default: 0,
      min: 0
    },
    level2: {
      type: Number,
      default: 0,
      min: 0
    },
    level3: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      default: 0,
      min: 0
    }
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

// Virtual for total referral rewards
userSchema.virtual('totalReferralRewards').get(function() {
  return this.referralRewards.total;
});

// Pre-save middleware to generate referral code if not exists
userSchema.pre('save', async function(next) {
  // Generate referral code if user doesn't have one (for both new and existing users)
  if (!this.referralCode) {
    console.log('🔄 Backend: Generating referral code for user:', this.walletAddress);
    this.referralCode = await this.generateUniqueReferralCode();
    console.log('✅ Backend: Generated referral code:', this.referralCode);
  }
  
  // Update lastActivity
  this.updatedAt = new Date();
  
  next();
});

// Method to generate unique referral code
userSchema.methods.generateUniqueReferralCode = async function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check if this referral code already exists
    const existingUser = await this.constructor.findOne({ referralCode: result });
    if (!existingUser) {
      return result;
    }
    
    attempts++;
  }
  
  // If we can't generate a unique code after max attempts, throw an error
  throw new Error('Unable to generate unique referral code');
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

// Method to add referral reward
userSchema.methods.addReferralReward = function(level, amount) {
  if (level >= 1 && level <= 3) {
    this.referralRewards[`level${level}`] += amount;
    this.referralRewards.total += amount;
  }
  return this.save();
};

// Method to build referral chain
userSchema.methods.buildReferralChain = function() {
  const chain = [];
  let currentUser = this;
  
  // Build chain up to 3 levels
  for (let level = 1; level <= 3; level++) {
    if (currentUser.referrerAddress) {
      chain.push({
        level,
        walletAddress: currentUser.referrerAddress,
        referralCode: currentUser.referralCode
      });
      // In a real implementation, you'd fetch the referrer user here
      // For now, we'll populate this when creating the referral relationship
    } else {
      break;
    }
  }
  
  this.referralChain = chain;
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