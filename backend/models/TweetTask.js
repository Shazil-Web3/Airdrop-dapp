const mongoose = require('mongoose');

const TweetTaskSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  tweet: {
    completed: { type: Boolean, default: false },
    tweetId: { type: String },
    verifiedAt: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('TweetTask', TweetTaskSchema); 