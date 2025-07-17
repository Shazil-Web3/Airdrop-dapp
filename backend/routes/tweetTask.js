const express = require('express');
const router = express.Router();
const tweetTaskController = require('../controllers/tweetTaskController');

router.post('/verify', tweetTaskController.verifyTweet);
router.get('/status', tweetTaskController.checkTweetTask);

module.exports = router; 