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
  
  // Status Information
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
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
claimHistorySchema.index({ status: 1 });
claimHistorySchema.index({ claimedAt: -1 });
claimHistorySchema.index({ referrerAddress: 1 });

// Virtual for claim status
claimHistorySchema.virtual('isConfirmed').get(function() {
  return this.status === 'confirmed';
});

// Pre-save middleware
claimHistorySchema.pre('save', function(next) {
  // Auto-confirm if status is confirmed
  if (this.status === 'confirmed' && !this.confirmedAt) {
    this.confirmedAt = new Date();
  }
  
  next();
});

// Static method to get claims by user
claimHistorySchema.statics.getUserClaims = function(walletAddress) {
  return this.find({ walletAddress: walletAddress.toLowerCase() })
    .sort({ claimedAt: -1 })
    .populate('user', 'username email referralCode');
};

// Method to confirm claim
claimHistorySchema.methods.confirmClaim = function() {
  this.status = 'confirmed';
  this.confirmedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('ClaimHistory', claimHistorySchema);
