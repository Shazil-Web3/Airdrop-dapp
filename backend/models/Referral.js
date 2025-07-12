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
  
  // Status Information
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
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
referralSchema.index({ status: 1 });
referralSchema.index({ createdAt: -1 });

// Pre-save middleware
referralSchema.pre('save', function(next) {
  // Auto-complete if status changes to completed
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  next();
});

// Static method to get referrals by user
referralSchema.statics.getUserReferrals = function(walletAddress) {
  return this.find({ 
    referrerAddress: walletAddress.toLowerCase(),
    status: 'active'
  })
    .populate('referred', 'username email walletAddress claimStatus totalTokensClaimed')
    .sort({ createdAt: -1 });
};

// Static method to get referral by code
referralSchema.statics.findByReferralCode = function(referralCode) {
  return this.findOne({ 
    referralCode: referralCode.toUpperCase(),
    status: 'active'
  });
};

// Method to complete referral
referralSchema.methods.completeReferral = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Referral', referralSchema);
