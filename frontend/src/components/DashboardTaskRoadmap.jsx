import React from 'react';
import TweetButton from './TweetButton';
import VerifyTweet from './VerifyTweet';

const DashboardTaskRoadmap = ({ walletAddress, tweetTaskCompleted, onTweetVerified }) => {
  return (
    <div className="group animate-fade-in bg-gradient-to-br from-slate-900/90 to-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl flex flex-col md:flex-row items-center gap-8 mb-8">
      {/* Left: Steps Description */}
      <div className="flex-1 mb-4 md:mb-0">
        <h2 className="text-2xl font-bold text-white mb-2">How to Claim Your Airdrop</h2>
        <ol className="list-decimal list-inside text-slate-300 text-base space-y-2">
          <li>Step 1: <span className="font-semibold text-white">Tweet about Hivox Airdrop</span> using the button on the right.</li>
          <li>Step 2: <span className="font-semibold text-white">Verify your tweet</span> by pasting the tweet URL below.</li>
          <li>Step 3: <span className="font-semibold text-white">Proceed to claim your airdrop</span> after completing the above steps.</li>
        </ol>
      </div>
      {/* Right: Actions */}
      <div className="flex flex-col gap-4 w-full md:w-80">
        <TweetButton disabled={tweetTaskCompleted} />
        <VerifyTweet walletAddress={walletAddress} onTaskComplete={onTweetVerified} disabled={tweetTaskCompleted} />
      </div>
    </div>
  );
};

export default DashboardTaskRoadmap; 