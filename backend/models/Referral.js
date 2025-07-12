const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  // Referrer Information
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  referrerAddress: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  // Referred User Information
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  referredAddress: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  // Referral Details
  referralCode: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  
  referralLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  
  // Referral Chain (for multi-level tracking)
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
  
  // Reward Information
  rewardPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  rewardAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  rewardPaid: {
    type: Boolean,
    default: false
  },
  
  rewardPaidAt: {
    type: Date
  },
  
  rewardTransactionHash: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty
        return /^0x[a-fA-F0-9]{64}$/.test(v);
      },
      message: 'Invalid transaction hash format'
    }
  },
  
  // Status Information
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Eligibility and Verification
  isEligible: {
    type: Boolean,
    default: true
  },
  
  eligibilityCriteria: [{
    criterion: {
      type: String,
      enum: ['wallet_age', 'transaction_count', 'social_verification', 'kyc_verified', 'referral_activity']
    },
    met: {
      type: Boolean,
      default: false
    },
    details: String
  }],
  
  // Activity Tracking
  referredUserClaimed: {
    type: Boolean,
    default: false
  },
  
  referredUserClaimDate: {
    type: Date
  },
  
  referredUserClaimAmount: {
    type: Number,
    default: 0
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
  
  activatedAt: {
    type: Date
  },
  
  completedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
referralSchema.index({ referrer: 1 });
referralSchema.index({ referred: 1 });
referralSchema.index({ referrerAddress: 1 });
referralSchema.index({ referredAddress: 1 });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ referralLevel: 1 });
referralSchema.index({ status: 1 });
referralSchema.index({ isActive: 1 });
referralSchema.index({ createdAt: -1 });

// Compound indexes for common queries
referralSchema.index({ referrerAddress: 1, referralLevel: 1 });
referralSchema.index({ referrerAddress: 1, status: 1 });
referralSchema.index({ referredAddress: 1, status: 1 });

// Virtual for referral duration
referralSchema.virtual('referralDuration').get(function() {
  if (this.activatedAt && this.completedAt) {
    return this.completedAt - this.activatedAt;
  }
  return null;
});

// Virtual for reward value in USD
referralSchema.virtual('rewardValueUSD').get(function() {
  return this.rewardAmount * (this.metadata.get('tokenPriceUSD') || 0);
});

// Pre-save middleware
referralSchema.pre('save', function(next) {
  // Auto-activate if status changes to active
  if (this.status === 'active' && !this.activatedAt) {
    this.activatedAt = new Date();
  }
  
  // Auto-complete if status changes to completed
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Auto-mark reward as paid if transaction hash is provided
  if (this.rewardTransactionHash && !this.rewardPaid) {
    this.rewardPaid = true;
    this.rewardPaidAt = new Date();
  }
  
  next();
});

// Static method to get referral statistics for a user
referralSchema.statics.getReferralStats = function(walletAddress) {
  return this.aggregate([
    {
      $match: { 
        referrerAddress: walletAddress.toLowerCase(),
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        totalReferrals: { $sum: 1 },
        totalRewards: { $sum: '$rewardAmount' },
        totalPaidRewards: { $sum: { $cond: ['$rewardPaid', '$rewardAmount', 0] } },
        pendingRewards: { $sum: { $cond: [{ $eq: ['$rewardPaid', false] }, '$rewardAmount', 0] } },
        level1Referrals: {
          $sum: { $cond: [{ $eq: ['$referralLevel', 1] }, 1, 0] }
        },
        level2Referrals: {
          $sum: { $cond: [{ $eq: ['$referralLevel', 2] }, 1, 0] }
        },
        level3Referrals: {
          $sum: { $cond: [{ $eq: ['$referralLevel', 3] }, 1, 0] }
        },
        activeReferrals: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        completedReferrals: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Static method to get referral tree for a user
referralSchema.statics.getReferralTree = function(walletAddress, maxLevel = 3) {
  return this.aggregate([
    {
      $match: { referrerAddress: walletAddress.toLowerCase() }
    },
    {
      $graphLookup: {
        from: 'referrals',
        startWith: '$referredAddress',
        connectFromField: 'referredAddress',
        connectToField: 'referrerAddress',
        as: 'referralTree',
        maxDepth: maxLevel - 1,
        depthField: 'level'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'referredAddress',
        foreignField: 'walletAddress',
        as: 'referredUser'
      }
    },
    {
      $unwind: '$referredUser'
    }
  ]);
};

// Static method to get direct referrals
referralSchema.statics.getDirectReferrals = function(walletAddress) {
  return this.find({ 
    referrerAddress: walletAddress.toLowerCase(),
    referralLevel: 1,
    isActive: true
  })
    .populate('referred', 'username email walletAddress claimStatus totalTokensClaimed')
    .sort({ createdAt: -1 });
};

// Static method to get referral by code
referralSchema.statics.findByReferralCode = function(referralCode) {
  return this.findOne({ 
    referralCode: referralCode.toUpperCase(),
    isActive: true
  });
};

// Method to activate referral
referralSchema.methods.activateReferral = function() {
  this.status = 'active';
  this.activatedAt = new Date();
  return this.save();
};

// Method to complete referral
referralSchema.methods.completeReferral = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to pay reward
referralSchema.methods.payReward = function(transactionHash) {
  this.rewardPaid = true;
  this.rewardPaidAt = new Date();
  this.rewardTransactionHash = transactionHash;
  return this.save();
};

// Method to update referral chain
referralSchema.methods.updateReferralChain = function(chain) {
  this.referralChain = chain;
  return this.save();
};

module.exports = mongoose.model('Referral', referralSchema);
