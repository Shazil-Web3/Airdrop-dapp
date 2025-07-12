const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
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
  
  // Activity Details
  activityType: {
    type: String,
    enum: [
      'wallet_connected',
      'claim_submitted',
      'claim_confirmed',
      'referral_created'
    ],
    required: true
  },
  
  // Activity Description
  description: {
    type: String,
    required: true
  },
  
  // Related Entities
  relatedClaim: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClaimHistory'
  },
  
  relatedReferral: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral'
  },
  
  // Transaction Information (for blockchain activities)
  transactionHash: {
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
  
  // Timestamps
  occurredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
activitySchema.index({ user: 1 });
activitySchema.index({ walletAddress: 1 });
activitySchema.index({ activityType: 1 });
activitySchema.index({ occurredAt: -1 });

// Static method to get user activities
activitySchema.statics.getUserActivities = function(walletAddress, options = {}) {
  const { limit = 50, skip = 0 } = options;
  
  return this.find({ walletAddress: walletAddress.toLowerCase() })
    .sort({ occurredAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('relatedClaim', 'transactionHash claimAmount')
    .populate('relatedReferral', 'referralCode');
};

// Static method to get recent activities
activitySchema.statics.getRecentActivities = function(limit = 50) {
  return this.find()
    .sort({ occurredAt: -1 })
    .limit(limit)
    .populate('user', 'username email')
    .populate('relatedClaim', 'transactionHash claimAmount')
    .populate('relatedReferral', 'referralCode');
};

module.exports = mongoose.model('Activity', activitySchema); 