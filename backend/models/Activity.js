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
      'wallet_disconnected',
      'claim_submitted',
      'claim_confirmed',
      'claim_failed',
      'referral_created',
      'referral_reward_paid',
      'profile_updated',
      'social_verified',
      'kyc_submitted',
      'kyc_approved',
      'kyc_rejected',
      'login',
      'logout',
      'page_visited',
      'button_clicked',
      'form_submitted',
      'error_occurred'
    ],
    required: true
  },
  
  activityCategory: {
    type: String,
    enum: ['wallet', 'claim', 'referral', 'profile', 'verification', 'navigation', 'error'],
    required: true
  },
  
  // Activity Description
  description: {
    type: String,
    required: true
  },
  
  // Activity Data
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  
  // Session Information
  sessionId: {
    type: String,
    trim: true
  },
  
  // Request Information
  userAgent: {
    type: String,
    trim: true
  },
  
  ipAddress: {
    type: String,
    trim: true
  },
  
  // Location Information (if available)
  location: {
    country: String,
    city: String,
    timezone: String
  },
  
  // Device Information
  device: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown']
    },
    browser: String,
    os: String,
    screenResolution: String
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
  
  // Error Information (for error activities)
  error: {
    code: String,
    message: String,
    stack: String,
    details: String
  },
  
  // Status Information
  status: {
    type: String,
    enum: ['success', 'pending', 'failed', 'cancelled'],
    default: 'success'
  },
  
  // Priority Level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: String
  },
  
  // Timestamps
  occurredAt: {
    type: Date,
    default: Date.now
  },
  
  processedAt: {
    type: Date
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
activitySchema.index({ activityCategory: 1 });
activitySchema.index({ occurredAt: -1 });
activitySchema.index({ status: 1 });
activitySchema.index({ sessionId: 1 });

// Compound indexes for common queries
activitySchema.index({ walletAddress: 1, activityType: 1 });
activitySchema.index({ walletAddress: 1, occurredAt: -1 });
activitySchema.index({ activityType: 1, occurredAt: -1 });

// Virtual for activity duration (if applicable)
activitySchema.virtual('duration').get(function() {
  if (this.data && this.data.get('startTime') && this.data.get('endTime')) {
    return this.data.get('endTime') - this.data.get('startTime');
  }
  return null;
});

// Virtual for activity age
activitySchema.virtual('age').get(function() {
  return Date.now() - this.occurredAt.getTime();
});

// Pre-save middleware
activitySchema.pre('save', function(next) {
  // Auto-process if status is success
  if (this.status === 'success' && !this.processedAt) {
    this.processedAt = new Date();
  }
  
  // Set priority based on activity type
  if (this.activityType === 'claim_submitted' || this.activityType === 'claim_confirmed') {
    this.priority = 'high';
  } else if (this.activityType === 'error_occurred') {
    this.priority = 'critical';
  }
  
  next();
});

// Static method to get user activity summary
activitySchema.statics.getUserActivitySummary = function(walletAddress, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        walletAddress: walletAddress.toLowerCase(),
        occurredAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$activityType',
        count: { $sum: 1 },
        lastOccurrence: { $max: '$occurredAt' },
        firstOccurrence: { $min: '$occurredAt' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to get activity statistics
activitySchema.statics.getActivityStats = function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        occurredAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          activityType: '$activityType',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$occurredAt' } }
        },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$walletAddress' }
      }
    },
    {
      $group: {
        _id: '$_id.activityType',
        dailyStats: {
          $push: {
            date: '$_id.date',
            count: '$count',
            uniqueUsers: { $size: '$uniqueUsers' }
          }
        },
        totalCount: { $sum: '$count' },
        totalUniqueUsers: { $size: { $setUnion: '$uniqueUsers' } }
      }
    },
    {
      $sort: { totalCount: -1 }
    }
  ]);
};

// Static method to get recent activities
activitySchema.statics.getRecentActivities = function(limit = 50) {
  return this.find()
    .sort({ occurredAt: -1 })
    .limit(limit)
    .populate('user', 'username email')
    .populate('relatedClaim', 'transactionHash claimAmount')
    .populate('relatedReferral', 'referralCode referralLevel');
};

// Static method to get user activities
activitySchema.statics.getUserActivities = function(walletAddress, options = {}) {
  const { limit = 50, skip = 0, activityType, startDate, endDate } = options;
  
  const query = { walletAddress: walletAddress.toLowerCase() };
  
  if (activityType) {
    query.activityType = activityType;
  }
  
  if (startDate || endDate) {
    query.occurredAt = {};
    if (startDate) query.occurredAt.$gte = new Date(startDate);
    if (endDate) query.occurredAt.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .sort({ occurredAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('relatedClaim', 'transactionHash claimAmount')
    .populate('relatedReferral', 'referralCode referralLevel');
};

// Method to mark as processed
activitySchema.methods.markAsProcessed = function() {
  this.processedAt = new Date();
  return this.save();
};

// Method to update status
activitySchema.methods.updateStatus = function(status) {
  this.status = status;
  if (status === 'success' && !this.processedAt) {
    this.processedAt = new Date();
  }
  return this.save();
};

module.exports = mongoose.model('Activity', activitySchema); 