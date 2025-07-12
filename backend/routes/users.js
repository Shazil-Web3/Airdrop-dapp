const express = require('express');
const { body } = require('express-validator');
const {
  connectWallet,
  getUserProfile,
  updateUserProfile,
  getUserActivities,
  getUserReferrals
} = require('../controllers/userController');

const router = express.Router();

// Validation middleware
const validateWalletAddress = body('walletAddress')
  .isLength({ min: 42, max: 42 })
  .matches(/^0x[a-fA-F0-9]{40}$/)
  .withMessage('Invalid wallet address format');

const validateEmail = body('email')
  .optional()
  .isEmail()
  .withMessage('Invalid email format');

const validateUsername = body('username')
  .optional()
  .isLength({ min: 2, max: 50 })
  .withMessage('Username must be between 2 and 50 characters');

// @route   POST /api/users/connect-wallet
// @desc    Connect wallet and create/update user profile
// @access  Public
router.post('/connect-wallet', [
  validateWalletAddress,
  validateEmail,
  validateUsername
], connectWallet);

// @route   GET /api/users/profile/:walletAddress
// @desc    Get user profile
// @access  Public
router.get('/profile/:walletAddress', getUserProfile);

// @route   PUT /api/users/profile/:walletAddress
// @desc    Update user profile
// @access  Public
router.put('/profile/:walletAddress', [
  validateEmail,
  validateUsername
], updateUserProfile);

// @route   GET /api/users/:walletAddress/activities
// @desc    Get user activities
// @access  Public
router.get('/:walletAddress/activities', getUserActivities);

// @route   GET /api/users/:walletAddress/referrals
// @desc    Get user referrals
// @access  Public
router.get('/:walletAddress/referrals', getUserReferrals);

module.exports = router; 