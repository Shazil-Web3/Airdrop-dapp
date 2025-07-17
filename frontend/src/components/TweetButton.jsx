import React from 'react';
import { Twitter } from 'lucide-react';

const TweetButton = ({ disabled }) => {
  const tweetText = encodeURIComponent('Eth is Bullish..  Good for eth developers fam!');
  const tweetUrl = `https://x.com/intent/tweet?text=${tweetText}`;

  return (
    <a
      href={disabled ? undefined : tweetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 hover:shadow-blue-400/40 transition-all duration-300 font-semibold text-base w-full text-center ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      aria-disabled={disabled}
    >
      <Twitter className="h-5 w-5 mr-1" />
      <span>Tweet About Us</span>
    </a>
  );
};

export default TweetButton; 