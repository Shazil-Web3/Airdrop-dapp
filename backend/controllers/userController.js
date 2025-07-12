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
      username,
      email
    } = req.body;

    // Check if user already exists
    let user = await User.findByWalletAddress(walletAddress);

    if (user) {
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
            username: user.username,
            email: user.email,
            referralCode: user.referralCode,
            referralLink: user.referralLink,
            claimStatus: user.claimStatus,
            totalTokensClaimed: user.totalTokensClaimed,
            lastConnectedAt: user.lastConnectedAt,
            totalConnections: user.totalConnections
          }
        }
      });
    }

    // Create new user
    const userData = {
      walletAddress: walletAddress.toLowerCase(),
      username,
      email
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

    // Create referral relationship if applicable
    if (user.referrerAddress) {
      const referrer = await User.findByWalletAddress(user.referrerAddress);
      if (referrer) {
        await Referral.create({
          referrer: referrer._id,
          referrerAddress: referrer.walletAddress,
          referred: user._id,
          referredAddress: user.walletAddress,
          referralCode: user.referralCode
        });

        // Record referral activity
        await Activity.create({
          user: referrer._id,
          walletAddress: referrer.walletAddress,
          activityType: 'referral_created',
          description: `New referral: ${user.walletAddress}`,
          relatedReferral: user._id
        });
      }
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
          username: user.username,
          email: user.email,
          referralCode: user.referralCode,
          referralLink: user.referralLink,
          claimStatus: user.claimStatus,
          totalTokensClaimed: user.totalTokensClaimed,
          lastConnectedAt: user.lastConnectedAt,
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
          createdAt: user.createdAt
        },
        referrals,
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
        referrals
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

module.exports = {
  connectWallet,
  getUserProfile,
  updateUserProfile,
  getUserActivities,
  getUserReferrals
}; 