const express = require('express');
const { body } = require('express-validator');
const {
  submitClaim,
  confirmClaim,
  getUserClaims,
  getClaimByTransaction
} = require('../controllers/claimController');

const router = express.Router();

// Validation middleware
const validateWalletAddress = body('walletAddress')
  .isLength({ min: 42, max: 42 })
  .matches(/^0x[a-fA-F0-9]{40}$/)
  .withMessage('Invalid wallet address format');

const validateTransactionHash = body('transactionHash')
  .isLength({ min: 66, max: 66 })
  .matches(/^0x[a-fA-F0-9]{64}$/)
  .withMessage('Invalid transaction hash format');

const validateClaimAmount = body('claimAmount')
  .isFloat({ min: 0 })
  .withMessage('Claim amount must be a positive number');

const validateBlockNumber = body('blockNumber')
  .isInt({ min: 0 })
  .withMessage('Block number must be a positive integer');

const validateChainId = body('chainId')
  .isInt({ min: 1 })
  .withMessage('Chain ID must be a positive integer');

const validateContractAddress = body('contractAddress')
  .isLength({ min: 42, max: 42 })
  .matches(/^0x[a-fA-F0-9]{40}$/)
  .withMessage('Invalid contract address format');

// @route   POST /api/claims/submit
// @desc    Submit airdrop claim
// @access  Public
router.post('/submit', [
  validateWalletAddress,
  validateClaimAmount,
  validateTransactionHash,
  validateBlockNumber,
  validateChainId,
  validateContractAddress
], submitClaim);

// @route   PUT /api/claims/:claimId/confirm
// @desc    Confirm claim
// @access  Public
router.put('/:claimId/confirm', confirmClaim);

// @route   GET /api/claims/:walletAddress
// @desc    Get user claims
// @access  Public
router.get('/:walletAddress', getUserClaims);

// @route   GET /api/claims/transaction/:transactionHash
// @desc    Get claim by transaction hash
// @access  Public
router.get('/transaction/:transactionHash', getClaimByTransaction);

module.exports = router; 