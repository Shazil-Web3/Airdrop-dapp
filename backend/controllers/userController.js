const User = require('../models/User');
const Activity = require('../models/Activity');
const Referral = require('../models/Referral');
const { validationResult } = require('express-validator');

// @desc    Connect wallet and create/update user profile
// @route   POST /api/users/connect-wallet
// @access  Public
const connectWallet = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { 
      walletAddress, 
      referralCode, 
      userAgent, 
      ipAddress,
      username,
      email,
      socialLinks 
    } = req.body;

    // Check if user already exists
    let user = await User.findByWalletAddress(walletAddress);

    if (user) {
      // Update existing user's last activity
      await user.recordConnection(userAgent, ipAddress);
      
      // Record activity
      await Activity.create({
        user: user._id,
        walletAddress: walletAddress.toLowerCase(),
        activityType: 'wallet_connected',
        activityCategory: 'wallet',
        description: 'Wallet reconnected',
        data: {
          userAgent,
          ipAddress,
          connectionNumber: user.totalConnections
        },
        userAgent,
        ipAddress
      });

      return res.status(200).json({
        success: true,
        message: 'Wallet reconnected successfully',
        data: {
          user: {
            id: user._id,
            walletAddress: user.walletAddress,
            username: user.username,
            email: user.email,
            referralCode: user.referralCode,
            referralLink: user.referralLink,
            claimStatus: user.claimStatus,
            totalTokensClaimed: user.totalTokensClaimed,
            isEligible: user.isEligible,
            isVerified: user.isVerified,
            referralStats: user.referralStats,
            lastActivity: user.lastActivity,
            totalConnections: user.totalConnections
          }
        }
      });
    }

    // Create new user
    const userData = {
      walletAddress: walletAddress.toLowerCase(),
      username,
      email,
      socialLinks
    };

    // Handle referral if provided
    if (referralCode) {
      const referrer = await User.findByReferralCode(referralCode);
      if (referrer && referrer.walletAddress !== walletAddress.toLowerCase()) {
        userData.referrerAddress = referrer.walletAddress;
        userData.referralLevel = 1;
      }
    }

    user = new User(userData);
    await user.recordConnection(userAgent, ipAddress);
    await user.save();

    // Create referral relationship if applicable
    if (user.referrerAddress) {
      const referrer = await User.findByWalletAddress(user.referrerAddress);
      if (referrer) {
        await Referral.create({
          referrer: referrer._id,
          referrerAddress: referrer.walletAddress,
          referred: user._id,
          referredAddress: user.walletAddress,
          referralCode: user.referralCode,
          referralLevel: 1,
          rewardPercentage: process.env.REFERRAL_REWARD_PERCENTAGE || 10,
          status: 'active'
        });

        // Update referrer stats
        await referrer.updateReferralStats(1);
      }
    }

    // Record activity
    await Activity.create({
      user: user._id,
      walletAddress: user.walletAddress,
      activityType: 'wallet_connected',
      activityCategory: 'wallet',
      description: 'New wallet connected',
      data: {
        userAgent,
        ipAddress,
        referralCode: user.referralCode,
        referrerAddress: user.referrerAddress
      },
      userAgent,
      ipAddress
    });

    res.status(201).json({
      success: true,
      message: 'Wallet connected successfully',
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          username: user.username,
          email: user.email,
          referralCode: user.referralCode,
          referralLink: user.referralLink,
          claimStatus: user.claimStatus,
          totalTokensClaimed: user.totalTokensClaimed,
          isEligible: user.isEligible,
          isVerified: user.isVerified,
          referralStats: user.referralStats,
          lastActivity: user.lastActivity,
          totalConnections: user.totalConnections
        }
      }
    });

  } catch (error) {
    console.error('Error connecting wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Disconnect wallet
// @route   POST /api/users/disconnect-wallet
// @access  Public
const disconnectWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    const user = await User.findByWalletAddress(walletAddress);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.recordDisconnection();

    // Record activity
    await Activity.create({
      user: user._id,
      walletAddress: user.walletAddress,
      activityType: 'wallet_disconnected',
      activityCategory: 'wallet',
      description: 'Wallet disconnected',
      data: {
        totalConnections: user.totalConnections
      }
    });

    res.status(200).json({
      success: true,
      message: 'Wallet disconnected successfully'
    });

  } catch (error) {
    console.error('Error disconnecting wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile/:walletAddress
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const user = await User.findByWalletAddress(walletAddress);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's referral tree
    const referralTree = await Referral.getReferralTree(walletAddress);
    
    // Get user's recent activities
    const recentActivities = await Activity.getUserActivities(walletAddress, { limit: 10 });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          username: user.username,
          email: user.email,
          referralCode: user.referralCode,
          referralLink: user.referralLink,
          claimStatus: user.claimStatus,
          totalTokensClaimed: user.totalTokensClaimed,
          isEligible: user.isEligible,
          isVerified: user.isVerified,
          referralStats: user.referralStats,
          lastActivity: user.lastActivity,
          totalConnections: user.totalConnections,
          socialLinks: user.socialLinks,
          createdAt: user.createdAt
        },
        referralTree,
        recentActivities
      }
    });

  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile/:walletAddress
// @access  Public
const updateUserProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { walletAddress } = req.params;
    const { username, email, socialLinks } = req.body;

    const user = await User.findByWalletAddress(walletAddress);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };

    await user.save();

    // Record activity
    await Activity.create({
      user: user._id,
      walletAddress: user.walletAddress,
      activityType: 'profile_updated',
      activityCategory: 'profile',
      description: 'User profile updated',
      data: {
        updatedFields: Object.keys(req.body)
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          username: user.username,
          email: user.email,
          socialLinks: user.socialLinks,
          lastActivity: user.lastActivity
        }
      }
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user activities
// @route   GET /api/users/:walletAddress/activities
// @access  Public
const getUserActivities = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { page = 1, limit = 20, activityType, startDate, endDate } = req.query;

    const skip = (page - 1) * limit;
    const options = {
      limit: parseInt(limit),
      skip,
      activityType,
      startDate,
      endDate
    };

    const activities = await Activity.getUserActivities(walletAddress, options);
    const total = await Activity.countDocuments({ walletAddress: walletAddress.toLowerCase() });

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting user activities:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user referral statistics
// @route   GET /api/users/:walletAddress/referrals
// @access  Public
const getUserReferrals = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const user = await User.findByWalletAddress(walletAddress);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get referral statistics
    const referralStats = await Referral.getReferralStats(walletAddress);
    
    // Get direct referrals
    const directReferrals = await Referral.getDirectReferrals(walletAddress);
    
    // Get referral tree
    const referralTree = await Referral.getReferralTree(walletAddress);

    res.status(200).json({
      success: true,
      data: {
        referralStats: referralStats[0] || {
          totalReferrals: 0,
          totalRewards: 0,
          totalPaidRewards: 0,
          pendingRewards: 0,
          level1Referrals: 0,
          level2Referrals: 0,
          level3Referrals: 0,
          activeReferrals: 0,
          completedReferrals: 0
        },
        directReferrals,
        referralTree
      }
    });

  } catch (error) {
    console.error('Error getting user referrals:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all users (for admin dashboard)
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, claimStatus, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { walletAddress: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { referralCode: { $regex: search, $options: 'i' } }
      ];
    }

    // Claim status filter
    if (claimStatus) {
      query.claimStatus = claimStatus;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user statistics (for admin dashboard)
// @route   GET /api/users/stats
// @access  Private (Admin)
const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalEligibleUsers: { $sum: { $cond: ['$isEligible', 1, 0] } },
          totalVerifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } },
          totalClaimedUsers: { $sum: { $cond: [{ $eq: ['$claimStatus', 'claimed'] }, 1, 0] } },
          totalPartiallyClaimedUsers: { $sum: { $cond: [{ $eq: ['$claimStatus', 'partially_claimed'] }, 1, 0] } },
          totalNotClaimedUsers: { $sum: { $cond: [{ $eq: ['$claimStatus', 'not_claimed'] }, 1, 0] } },
          totalTokensClaimed: { $sum: '$totalTokensClaimed' },
          totalReferralRewards: { $sum: '$referralStats.totalReferralRewards' }
        }
      }
    ]);

    // Get daily user registrations for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: stats[0] || {
          totalUsers: 0,
          totalEligibleUsers: 0,
          totalVerifiedUsers: 0,
          totalClaimedUsers: 0,
          totalPartiallyClaimedUsers: 0,
          totalNotClaimedUsers: 0,
          totalTokensClaimed: 0,
          totalReferralRewards: 0
        },
        dailyRegistrations
      }
    });

  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  connectWallet,
  disconnectWallet,
  getUserProfile,
  updateUserProfile,
  getUserActivities,
  getUserReferrals,
  getAllUsers,
  getUserStats
}; 