const axios = require('axios');
const TweetTask = require('../models/TweetTask');
require('dotenv').config();

const predefinedText = 'Check out this awesome AirDrop DApp by MyCompany! Join now at https://mycompany.com';
const campaignStart = new Date('2025-07-01'); // Adjust as needed

exports.verifyTweet = async (req, res) => {
  console.log('--- [verifyTweet] Called ---');
  console.log('Request body:', req.body);
  const { tweetUrl, walletAddress } = req.body;
  if (!tweetUrl || !walletAddress) {
    console.log('Missing tweetUrl or walletAddress');
    return res.status(400).json({ error: 'Missing tweetUrl or walletAddress' });
  }
  const tweetIdMatch = tweetUrl.match(/\/status\/(\d+)/);
  if (!tweetIdMatch) {
    console.log('Invalid tweet URL:', tweetUrl);
    return res.status(400).json({ error: 'Invalid tweet URL' });
  }
  const tweetId = tweetIdMatch[1];
  console.log('Extracted tweetId:', tweetId);
  try {
    const twitterRes = await axios.get(
      `https://api.twitter.com/2/tweets?ids=${tweetId}&tweet.fields=author_id,created_at,text`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
        }
      }
    );
    console.log('Twitter API response:', twitterRes.data);
    if (!twitterRes.data || !twitterRes.data.data || !twitterRes.data.data[0]) {
      console.log('No tweet data returned from Twitter API:', twitterRes.data);
      return res.status(400).json({ error: 'Could not fetch tweet data. The tweet may not exist or is not public.' });
    }
    const tweet = twitterRes.data.data[0];
    if (
      tweet.text.includes(predefinedText) &&
      new Date(tweet.created_at) > campaignStart
    ) {
      await TweetTask.findOneAndUpdate(
        { walletAddress },
        { tweet: { completed: true, tweetId, verifiedAt: new Date() } },
        { upsert: true, new: true }
      );
      console.log('Tweet verified and DB updated for wallet:', walletAddress);
      return res.status(200).json({ message: 'Tweet verified successfully!', tweetId, authorId: tweet.author_id });
    } else {
      console.log('Tweet verification failed: Incorrect content or too old');
      return res.status(400).json({ error: 'Tweet verification failed: Incorrect content or too old' });
    }
  } catch (error) {
    if (error.response) {
      console.error('Twitter API error:', error.response.data);
      return res.status(500).json({ error: 'Twitter API error', details: error.response.data });
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