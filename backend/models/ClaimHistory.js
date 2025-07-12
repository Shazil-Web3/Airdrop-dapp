const mongoose = require('mongoose');

const claimHistorySchema = new mongoose.Schema({
  // User Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  // Claim Details
  claimAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  tokensClaimed: {
    type: Number,
    required: true,
    min: 0
  },
  
  claimType: {
    type: String,
    enum: ['initial', 'partial', 'referral_reward', 'bonus'],
    default: 'initial'
  },
  
  // Transaction Information
  transactionHash: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{64}$/.test(v);
      },
      message: 'Invalid transaction hash format'
    }
  },
  
  blockNumber: {
    type: Number,
    required: true
  },
  
  gasUsed: {
    type: Number
  },
  
  gasPrice: {
    type: String
  },
  
  // Network Information
  network: {
    type: String,
    enum: ['ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism'],
    default: 'ethereum'
  },
  
  chainId: {
    type: Number,
    required: true
  },
  
  // Contract Information
  contractAddress: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  // Validation Status
  validationStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'rejected'],
    default: 'pending'
  },
  
  validationMessage: {
    type: String
  },
  
  validatedAt: {
    type: Date
  },
  
  // Referral Information (if applicable)
  referralCode: {
    type: String,
    uppercase: true,
    trim: true
  },
  
  referrerAddress: {
    type: String,
    lowercase: true,
    trim: true
  },
  
  referralReward: {
    type: Number,
    default: 0,
    min: 0
  },
  
  referralLevel: {
    type: Number,
    min: 1,
    max: 3
  },
  
  // Eligibility Information
  eligibilityCriteria: [{
    criterion: {
      type: String,
      enum: ['wallet_age', 'transaction_count', 'social_verification', 'kyc_verified', 'referral_bonus']
    },
    met: {
      type: Boolean,
      default: false
    },
    details: String
  }],
  
  // Metadata
  metadata: {
    type: Map,
    of: String
  },
  
  // Error Information (if claim failed)
  error: {
    code: String,
    message: String,
    details: String
  },
  
  // Timestamps
  claimedAt: {
    type: Date,
    default: Date.now
  },
  
  confirmedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
claimHistorySchema.index({ user: 1 });
claimHistorySchema.index({ walletAddress: 1 });
claimHistorySchema.index({ transactionHash: 1 });
claimHistorySchema.index({ validationStatus: 1 });
claimHistorySchema.index({ claimedAt: -1 });
claimHistorySchema.index({ network: 1, chainId: 1 });
claimHistorySchema.index({ referrerAddress: 1 });

// Virtual for claim status
claimHistorySchema.virtual('isConfirmed').get(function() {
  return this.validationStatus === 'confirmed';
});

claimHistorySchema.virtual('isFailed').get(function() {
  return this.validationStatus === 'failed' || this.validationStatus === 'rejected';
});

// Virtual for total value in USD (if price data available)
claimHistorySchema.virtual('valueUSD').get(function() {
  // This would be calculated based on token price at claim time
  return this.tokensClaimed * (this.metadata.get('tokenPriceUSD') || 0);
});

// Pre-save middleware
claimHistorySchema.pre('save', function(next) {
  // Auto-confirm if validation status is confirmed
  if (this.validationStatus === 'confirmed' && !this.confirmedAt) {
    this.confirmedAt = new Date();
  }
  
  // Auto-validate if validation status is confirmed
  if (this.validationStatus === 'confirmed' && !this.validatedAt) {
    this.validatedAt = new Date();
  }
  
  next();
});

// Static method to get claim statistics
claimHistorySchema.statics.getClaimStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalClaims: { $sum: 1 },
        totalTokensClaimed: { $sum: '$tokensClaimed' },
        totalReferralRewards: { $sum: '$referralReward' },
        confirmedClaims: {
          $sum: {
            $cond: [{ $eq: ['$validationStatus', 'confirmed'] }, 1, 0]
          }
        },
        failedClaims: {
          $sum: {
            $cond: [{ $in: ['$validationStatus', ['failed', 'rejected']] }, 1, 0]
          }
        },
        pendingClaims: {
          $sum: {
            $cond: [{ $eq: ['$validationStatus', 'pending'] }, 1, 0]
          }
        }
      }
    }
  ]);
};

// Static method to get claims by user
claimHistorySchema.statics.getUserClaims = function(walletAddress) {
  return this.find({ walletAddress: walletAddress.toLowerCase() })
    .sort({ claimedAt: -1 })
    .populate('user', 'username email referralCode');
};

// Static method to get referral rewards by user
claimHistorySchema.statics.getReferralRewards = function(walletAddress) {
  return this.find({ 
    referrerAddress: walletAddress.toLowerCase(),
    claimType: 'referral_reward'
  })
    .sort({ claimedAt: -1 })
    .populate('user', 'username email');
};

// Static method to validate transaction
claimHistorySchema.statics.validateTransaction = async function(transactionHash, network) {
  // This would implement blockchain transaction validation
  // For now, return a mock validation
  return {
    isValid: true,
    blockNumber: Math.floor(Math.random() * 1000000),
    gasUsed: Math.floor(Math.random() * 100000),
    gasPrice: '20000000000'
  };
};

// Method to confirm claim
claimHistorySchema.methods.confirmClaim = function() {
  this.validationStatus = 'confirmed';
  this.validatedAt = new Date();
  this.confirmedAt = new Date();
  return this.save();
};

// Method to reject claim
claimHistorySchema.methods.rejectClaim = function(reason) {
  this.validationStatus = 'rejected';
  this.validationMessage = reason;
  this.error = {
    code: 'CLAIM_REJECTED',
    message: reason,
    details: 'Claim was rejected by the system'
  };
  return this.save();
};

module.exports = mongoose.model('ClaimHistory', claimHistorySchema);
