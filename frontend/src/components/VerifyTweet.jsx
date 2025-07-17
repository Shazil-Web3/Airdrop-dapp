import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle, Loader, AlertTriangle, XCircle, Clock } from 'lucide-react';

const VerifyTweet = ({ walletAddress, onTaskComplete, disabled }) => {
  const [tweetUrl, setTweetUrl] = useState('');
  const [message, setMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidTwitterUrl = (url) => {
    const twitterUrlPatterns = [
      /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/,
      /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+\?/,
      /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+\//
    ];
    return twitterUrlPatterns.some(pattern => pattern.test(url));
  };

  const handleVerify = async () => {
    setLoading(true);
    setMessage('');
    
    // Frontend validation
    if (!isValidTwitterUrl(tweetUrl)) {
      setMessage('Please enter a valid Twitter/X.com status URL');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Sending tweet verification request:', { tweetUrl, walletAddress });
      const response = await axios.post('http://localhost:5000/api/tweet-task/verify', { tweetUrl, walletAddress });
      console.log('Verification response:', response);
      setMessage(response.data.message);
      if (response.status === 200) {
        setIsVerified(true);
        if (onTaskComplete) onTaskComplete();
      }
    } catch (error) {
      console.error('Tweet verification error:', error);
      let errorMessage = 'Verification failed';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        if (error.response.data.details) {
          errorMessage += ': ' + JSON.stringify(error.response.data.details);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/60 rounded-2xl shadow-xl p-6 w-full flex flex-col items-center">
      <h2 className="text-xl font-bold mb-3 text-white flex items-center gap-2">
        Verify Your Tweet
        {isVerified && <CheckCircle className="text-green-400 h-5 w-5" />}
      </h2>
      <label className="w-full text-slate-300 text-sm mb-1 font-medium" htmlFor="tweet-url-input">
        Paste your tweet URL (e.g., <span className="text-slate-400">https://x.com/username/status/123456789</span>)
      </label>
      <input
        id="tweet-url-input"
        type="text"
        value={tweetUrl}
        onChange={(e) => setTweetUrl(e.target.value)}
        placeholder="https://x.com/username/status/123456789"
        className="border border-slate-600 bg-slate-900 text-white p-2 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        disabled={isVerified || disabled}
      />
      <button
        onClick={handleVerify}
        disabled={isVerified || disabled || loading || !tweetUrl}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg w-full font-semibold transition-all duration-300 text-white text-base ${isVerified ? 'bg-green-500 cursor-default' : (disabled || loading || !tweetUrl) ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'}`}
      >
        {isVerified ? <CheckCircle className="h-5 w-5" /> : loading ? <Loader className="h-5 w-5 animate-spin" /> : null}
        {isVerified ? 'Tweet Verified' : loading ? 'Verifying...' : 'Verify Tweet'}
      </button>
      {message && (
        <div className={`mt-3 w-full flex flex-col items-center`}>
          {/* Success */}
          {isVerified && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-400 text-green-400 rounded-lg px-4 py-2 text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              <span>{message}</span>
            </div>
          )}
          {/* Rate limit exceeded */}
          {!isVerified && message.toLowerCase().includes('rate limit') && (
            <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400 text-yellow-500 rounded-lg px-4 py-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              <span>Rate limit exceeded. Please wait a few minutes and try again.</span>
            </div>
          )}
          {/* Tweet not found or similar */}
          {!isVerified && (message.toLowerCase().includes('not found') || message.toLowerCase().includes('no tweet')) && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-400 text-red-400 rounded-lg px-4 py-2 text-sm font-medium">
              <XCircle className="h-4 w-4" />
              <span>Tweet not found. Please check your link and try again.</span>
            </div>
          )}
          {/* Generic error */}
          {!isVerified && !message.toLowerCase().includes('rate limit') && !message.toLowerCase().includes('not found') && !message.toLowerCase().includes('no tweet') && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-400 text-red-400 rounded-lg px-4 py-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4" />
              <span>{message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyTweet; 