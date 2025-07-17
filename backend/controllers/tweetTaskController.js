const axios = require('axios');
const TweetTask = require('../models/TweetTask');
const Activity = require('../models/Activity');
const User = require('../models/User');
require('dotenv').config();


const predefinedText = 'Eth is Bullish..  Good for eth developers fam!';
const campaignStart = new Date('2024-01-01'); // Adjust as needed

exports.verifyTweet = async (req, res) => {
  console.log('--- [verifyTweet] Called ---');
  console.log('Request body:', req.body);
  const { tweetUrl, walletAddress } = req.body;
  if (!tweetUrl || !walletAddress) {
    console.log('Missing tweetUrl or walletAddress');
    return res.status(400).json({ error: 'Missing tweetUrl or walletAddress' });
  }
  // Extract tweet ID from various URL formats
  const extractTweetId = (url) => {
    const patterns = [
      /\/status\/(\d+)/,         // Standard format
      /\/status\/(\d+)\?/,      // With query parameters
      /\/status\/(\d+)\//,      // With trailing slash
      /\/.*\/(\d+)/,            // Fallback for other patterns
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };
  
  const tweetId = extractTweetId(tweetUrl);
  if (!tweetId) {
    console.log('Invalid tweet URL:', tweetUrl);
    return res.status(400).json({ error: 'Invalid tweet URL. Please make sure you\'re using a valid Twitter/X.com status URL.' });
  }
  console.log('Extracted tweetId:', tweetId);
  
  // Check if we have the required environment variables
  if (!process.env.TWITTER_BEARER_TOKEN) {
    console.error('Missing TWITTER_BEARER_TOKEN environment variable');
    return res.status(500).json({ error: 'Twitter API configuration error' });
  }
  
  console.log('Making Twitter API call...');
  try {
    // Use the correct Twitter API v2 endpoint for single tweet lookup
    const twitterRes = await axios.get(
      `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=author_id,created_at,text`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
        }
      }
    );
    console.log('Twitter API response:', twitterRes.data);
    if (!twitterRes.data || !twitterRes.data.data) {
      console.log('No tweet data returned from Twitter API:', twitterRes.data);
      return res.status(400).json({ error: 'Could not fetch tweet data. The tweet may not exist or is not public.' });
    }
    const tweet = twitterRes.data.data;
    if (
      tweet.text.includes(predefinedText) &&
      new Date(tweet.created_at) > campaignStart
    ) {
      await TweetTask.findOneAndUpdate(
        { walletAddress },
        { tweet: { completed: true, tweetId, verifiedAt: new Date() } },
        { upsert: true, new: true }
      );
      // Log activity for tweet verification
      const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (user) {
        await Activity.create({
          user: user._id,
          walletAddress: user.walletAddress,
          activityType: 'tweet_verified',
          description: `Tweet verified for airdrop: https://x.com/i/web/status/${tweetId}`
        });
      }
      console.log('Tweet verified and DB updated for wallet:', walletAddress);
      return res.status(200).json({ message: 'Tweet verified successfully!', tweetId, authorId: tweet.author_id });
    } else {
      console.log('Tweet verification failed: Incorrect content or too old');
      return res.status(400).json({ error: 'Tweet verification failed: Incorrect content or too old' });
    }
  } catch (error) {
    if (error.response) {
      console.error('Twitter API error:', error.response.data);
      
      // Handle specific error types
      if (error.response.status === 429) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded. Please wait a few minutes and try again.',
          details: error.response.data 
        });
      } else if (error.response.status === 401) {
        return res.status(401).json({ 
          error: 'Twitter API authentication failed. Please check API credentials.',
          details: error.response.data 
        });
      } else if (error.response.status === 404) {
        return res.status(404).json({ 
          error: 'Tweet not found. Please check the tweet URL and make sure the tweet is public.',
          details: error.response.data 
        });
      } else {
        return res.status(500).json({ 
          error: 'Twitter API error', 
          details: error.response.data 
        });
      }
    }
    console.error('Error verifying tweet:', error);
    return res.status(500).json({ error: 'Failed to verify tweet: ' + error.message });
  }
};

exports.checkTweetTask = async (req, res) => {
  const { walletAddress } = req.query;
  if (!walletAddress) return res.status(400).json({ error: 'Missing walletAddress' });
  const task = await TweetTask.findOne({ walletAddress });
  res.json({ tweetTask: task?.tweet || { completed: false } });
};

