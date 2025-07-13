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
      referralCode
    } = req.body;

    // Check if user already exists
    let user = await User.findByWalletAddress(walletAddress);

    if (user) {
      // Check if user has a referral code, if not generate one
      if (!user.referralCode) {
        console.log('🔄 Backend: Generating referral code for existing user:', user.walletAddress);
        user.referralCode = await user.generateUniqueReferralCode();
        console.log('✅ Backend: Generated referral code for existing user:', user.referralCode);
        // Save the user to persist the referral code
        await user.save();
      }
      
      // Update existing user's connection
      await user.recordConnection();
      
      // Record activity
      await Activity.create({
        user: user._id,
        walletAddress: walletAddress.toLowerCase(),
        activityType: 'wallet_connected',
        description: 'Wallet reconnected'
      });

      return res.status(200).json({
        success: true,
        message: 'Wallet reconnected successfully',
        data: {
          user: {
            id: user._id,
            walletAddress: user.walletAddress,
            referralCode: user.referralCode,
            referralLink: user.referralLink,
            claimStatus: user.claimStatus,
            totalTokensClaimed: user.totalTokensClaimed,
            lastConnectedAt: user.lastConnectedAt,
            totalConnections: user.totalConnections,
            referralRewards: user.referralRewards
          }
        }
      });
    }

    // Create new user
    const userData = {
      walletAddress: walletAddress.toLowerCase()
    };

    // Handle referral if provided
    if (referralCode) {
      const referrer = await User.findByReferralCode(referralCode);
      if (referrer && referrer.walletAddress !== walletAddress.toLowerCase()) {
        userData.referrerAddress = referrer.walletAddress;
      }
    }

    user = new User(userData);
    await user.recordConnection();
    await user.save();

    // Build referral chain for multi-level tracking
    await user.buildReferralChain();

    // Create referral relationships and distribute rewards if applicable
    if (user.referrerAddress) {
      await createMultiLevelReferrals(user);
    }

    // Record activity
    await Activity.create({
      user: user._id,
      walletAddress: user.walletAddress,
      activityType: 'wallet_connected',
      description: 'New wallet connected'
    });

    res.status(201).json({
      success: true,
      message: 'Wallet connected successfully',
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          referralCode: user.referralCode,
          referralLink: user.referralLink,
          claimStatus: user.claimStatus,
          totalTokensClaimed: user.totalTokensClaimed,
          lastConnectedAt: user.lastConnectedAt,
          totalConnections: user.totalConnections,
          referralRewards: user.referralRewards,
          referralChain: user.referralChain
        }
      }
    });

  } catch (error) {
    console.error('❌ Backend: Error connecting wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to create multi-level referrals
const createMultiLevelReferrals = async (newUser) => {
  try {
    const referralLevels = [
      { level: 1, percentage: 10 }, // Level 1: 10%
      { level: 2, percentage: 5 },  // Level 2: 5%
      { level: 3, percentage: 2 }   // Level 3: 2%
    ];

    let currentReferrer = await User.findByWalletAddress(newUser.referrerAddress);
    
    for (let i = 0; i < referralLevels.length && currentReferrer; i++) {
      const { level, percentage } = referralLevels[i];
      
      // Create referral record
      await Referral.create({
        referrer: currentReferrer._id,
        referrerAddress: currentReferrer.walletAddress,
        referred: newUser._id,
        referredAddress: newUser.walletAddress,
        referralCode: newUser.referralCode,
        referralLevel: level
      });

      // Record activity for referrer
      await Activity.create({
        user: currentReferrer._id,
        walletAddress: currentReferrer.walletAddress,
        activityType: 'referral_created',
        description: `New level ${level} referral: ${newUser.walletAddress}`,
        relatedReferral: newUser._id
      });

      // Move to next level referrer
      if (currentReferrer.referrerAddress) {
        currentReferrer = await User.findByWalletAddress(currentReferrer.referrerAddress);
      } else {
        break;
      }
    }
  } catch (error) {
    console.error('Error creating multi-level referrals:', error);
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

    // Get user's referrals
    const referrals = await Referral.getUserReferrals(walletAddress);
    
    // Get user's recent activities
    const recentActivities = await Activity.getUserActivities(walletAddress, { limit: 10 });

    // Get referral tree
    const referralTree = await User.getReferralTree(walletAddress);

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
          lastConnectedAt: user.lastConnectedAt,
          totalConnections: user.totalConnections,
          referralRewards: user.referralRewards,
          referralChain: user.referralChain,
          createdAt: user.createdAt
        },
        referrals,
        recentActivities,
        referralTree: referralTree[0]?.referralTree || []
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
    const { username, email } = req.body;

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

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          username: user.username,
          email: user.email,
          updatedAt: user.updatedAt
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
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const options = {
      limit: parseInt(limit),
      skip
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

// @desc    Get user referrals
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

    // Get user's referrals
    const referrals = await Referral.getUserReferrals(walletAddress);

    res.status(200).json({
      success: true,
      data: {
        referrals,
        referralRewards: user.referralRewards,
        referralChain: user.referralChain
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

// @desc    Fix users without referral codes (utility function)
// @route   POST /api/users/fix-referral-codes
// @access  Public (Admin only)
const fixReferralCodes = async (req, res) => {
  try {
    console.log('🔧 Backend: Starting referral code fix for all users');
    
    // Find all users without referral codes
    const usersWithoutCodes = await User.find({ 
      $or: [
        { referralCode: { $exists: false } },
        { referralCode: null },
        { referralCode: "" }
      ]
    });
    console.log(`🔍 Backend: Found ${usersWithoutCodes.length} users without referral codes`);
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const user of usersWithoutCodes) {
      try {
        if (!user.referralCode) {
          user.referralCode = await user.generateUniqueReferralCode();
          await user.save();
          console.log(`✅ Backend: Fixed referral code for user ${user.walletAddress}: ${user.referralCode}`);
          fixedCount++;
        }
      } catch (error) {
        console.error(`❌ Backend: Error fixing referral code for user ${user.walletAddress}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`🎉 Backend: Referral code fix completed. Fixed: ${fixedCount}, Errors: ${errorCount}`);
    
    res.status(200).json({
      success: true,
      message: 'Referral codes fixed successfully',
      data: {
        totalUsers: usersWithoutCodes.length,
        fixedCount,
        errorCount
      }
    });
    
  } catch (error) {
    console.error('❌ Backend: Error fixing referral codes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  connectWallet,
  getUserProfile,
  updateUserProfile,
  getUserActivities,
  getUserReferrals,
  fixReferralCodes
}; 