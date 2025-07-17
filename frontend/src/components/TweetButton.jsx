import React from 'react';

const TweetButton = ({ disabled }) => {
  const tweetText = encodeURIComponent('Eth is Bullish..  Good for eth developers fam!');
  const tweetUrl = `https://x.com/intent/tweet?text=${tweetText}`;

  return (
    <a
      href={disabled ? undefined : tweetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-all duration-300 font-semibold text-base w-full text-center ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      aria-disabled={disabled}
    >
      Tweet About Us
    </a>
  );
};

export default TweetButton; 