const User = require('../models/User');
const ClaimHistory = require('../models/ClaimHistory');
const Activity = require('../models/Activity');
const { validationResult } = require('express-validator');

// @desc    Submit airdrop claim
// @route   POST /api/claims/submit
// @access  Public
const submitClaim = async (req, res) => {
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
      claimAmount, 
      transactionHash, 
      blockNumber, 
      network, 
      chainId, 
      contractAddress 
    } = req.body;

    // Check if user exists
    const user = await User.findByWalletAddress(walletAddress);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please connect your wallet first.'
      });
    }

    // Check if user has already claimed
    if (user.claimStatus === 'claimed') {
      return res.status(400).json({
        success: false,
        message: 'You have already claimed your airdrop'
      });
    }

    // Check if transaction hash already exists
    const existingClaim = await ClaimHistory.findOne({ transactionHash });
    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: 'This transaction has already been processed'
      });
    }

    // Create claim record
    const claim = new ClaimHistory({
      user: user._id,
      walletAddress: walletAddress.toLowerCase(),
      claimAmount,
      tokensClaimed: claimAmount,
      transactionHash,
      blockNumber,
      network,
      chainId,
      contractAddress,
      referralCode: user.referralCode,
      referrerAddress: user.referrerAddress,
      status: 'pending'
    });

    await claim.save();

    // Update user claim status
    await user.updateClaimStatus(claimAmount);

    // Record activity
    await Activity.create({
      user: user._id,
      walletAddress: user.walletAddress,
      activityType: 'claim_submitted',
      description: `Airdrop claim submitted: ${claimAmount} tokens`,
      relatedClaim: claim._id,
      transactionHash
    });

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully',
      data: {
        claim: {
          id: claim._id,
          transactionHash: claim.transactionHash,
          claimAmount: claim.claimAmount,
          status: claim.status,
          claimedAt: claim.claimedAt
        },
        user: {
          claimStatus: user.claimStatus,
          totalTokensClaimed: user.totalTokensClaimed,
          lastClaimDate: user.lastClaimDate
        }
      }
    });

  } catch (error) {
    console.error('Error submitting claim:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Confirm claim
// @route   PUT /api/claims/:claimId/confirm
// @access  Public
const confirmClaim = async (req, res) => {
  try {
    const { claimId } = req.params;

    const claim = await ClaimHistory.findById(claimId);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    if (claim.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Claim is already confirmed'
      });
    }

    // Confirm the claim
    await claim.confirmClaim();

    // Record activity
    await Activity.create({
      user: claim.user,
      walletAddress: claim.walletAddress,
      activityType: 'claim_confirmed',
      description: `Airdrop claim confirmed: ${claim.claimAmount} tokens`,
      relatedClaim: claim._id,
      transactionHash: claim.transactionHash
    });

    res.status(200).json({
      success: true,
      message: 'Claim confirmed successfully',
      data: {
        claim: {
          id: claim._id,
          transactionHash: claim.transactionHash,
          claimAmount: claim.claimAmount,
          status: claim.status,
          confirmedAt: claim.confirmedAt
        }
      }
    });

  } catch (error) {
    console.error('Error confirming claim:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user claims
// @route   GET /api/claims/:walletAddress
// @access  Public
const getUserClaims = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const user = await User.findByWalletAddress(walletAddress);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const claims = await ClaimHistory.getUserClaims(walletAddress);

    res.status(200).json({
      success: true,
      data: {
        claims,
        user: {
          claimStatus: user.claimStatus,
          totalTokensClaimed: user.totalTokensClaimed,
          lastClaimDate: user.lastClaimDate
        }
      }
    });

  } catch (error) {
    console.error('Error getting user claims:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get claim by transaction hash
// @route   GET /api/claims/transaction/:transactionHash
// @access  Public
const getClaimByTransaction = async (req, res) => {
  try {
    const { transactionHash } = req.params;

    const claim = await ClaimHistory.findOne({ transactionHash })
      .populate('user', 'username email walletAddress');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        claim
      }
    });

  } catch (error) {
    console.error('Error getting claim by transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  submitClaim,
  confirmClaim,
  getUserClaims,
  getClaimByTransaction
}; 