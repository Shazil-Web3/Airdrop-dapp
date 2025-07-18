const express = require('express');
const { body } = require('express-validator');
const {
  connectWallet,
  getUserProfile,
  updateUserProfile,
  getUserActivities,
  getUserReferrals,
  fixReferralCodes,
  logGitcoinVerified
} = require('../controllers/userController');

const router = express.Router();

// Validation middleware
const validateWalletAddress = body('walletAddress')
  .isLength({ min: 42, max: 42 })
  .matches(/^0x[a-fA-F0-9]{40}$/)
  .withMessage('Invalid wallet address format');

// @route   POST /api/users/connect-wallet
// @desc    Connect wallet and create/update user profile
// @access  Public
router.post('/connect-wallet', [
  validateWalletAddress
], connectWallet);

// @route   GET /api/users/profile/:walletAddress
// @desc    Get user profile
// @access  Public
router.get('/profile/:walletAddress', getUserProfile);

// @route   PUT /api/users/profile/:walletAddress
// @desc    Update user profile
// @access  Public
router.put('/profile/:walletAddress', updateUserProfile);

// @route   GET /api/users/:walletAddress/activities
// @desc    Get user activities
// @access  Public
router.get('/:walletAddress/activities', getUserActivities);

// @route   GET /api/users/:walletAddress/referrals
// @desc    Get user referrals
// @access  Public
router.get('/:walletAddress/referrals', getUserReferrals);

// @route   POST /api/users/fix-referral-codes
// @desc    Fix referral codes for all users (Admin utility)
// @access  Public (for now, should be protected in production)
router.post('/fix-referral-codes', fixReferralCodes);

// @route   POST /api/users/log-gitcoin-verified
// @desc    Log Gitcoin Passport verification activity
// @access  Public
router.post('/log-gitcoin-verified', logGitcoinVerified);

module.exports = router; 