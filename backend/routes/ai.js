const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/aiController');

// POST /api/ai-chat
router.post('/', chatWithAI);

module.exports = router; 