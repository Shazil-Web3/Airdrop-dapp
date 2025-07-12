'use client';

import { useState, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  Users, 
  Coins, 
  TrendingUp, 
  Share2, 
  Wallet,
  ArrowUpRight,
  Star,
  Trophy,
  Gift,
  Link as LinkIcon,
  ExternalLink
} from "lucide-react";
import { useAccount } from 'wagmi';
import { CustomConnectButton } from './CustomConnectButton.jsx';

export const DashboardContent = () => {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  // Mock data - replace with actual data from your backend
  const userStats = {
    claimedAmount: 1250,
    totalReferrals: 47,
    activeReferrals: 23,
    pendingRewards: 340,
    referralLevel: 2,
    totalEarned: 2890
  };

  useEffect(() => {
    if (isConnected && address) {
      // Generate referral link based on user's address
      const baseUrl = window.location.origin;
      const refLink = `${baseUrl}?ref=${address.slice(0, 8)}...${address.slice(-6)}`;
      setReferralLink(refLink);
    }
  }, [isConnected, address]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Hivox Airdrop',
          text: 'Claim your Hivox airdrop and earn rewards!',
          url: referralLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  if (!isConnected) {
    return (
      <section className="relative overflow-hidden px-4 sm:px-6 py-16 lg:py-24 min-h-screen flex items-center justify-center">
        {/* Darker Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-black"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-transparent opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-black"></div>

        {/* Animated Background Circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-purple-500/8 rounded-full blur-2xl lg:blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-36 h-36 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-cyan-500/8 rounded-full blur-2xl lg:blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-blue-500/5 rounded-full blur-2xl lg:blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        </div>

        <div className="relative mx-auto max-w-4xl text-center z-10 px-4">
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
            <p className="text-slate-300 text-base mb-8 max-w-md mx-auto leading-relaxed">
              Connect your wallet to access your Hivox dashboard and track your rewards in real-time.
            </p>
            <CustomConnectButton />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden px-4 sm:px-6 py-16 lg:py-24 min-h-screen">
      {/* Darker Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-black"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-transparent opacity-80"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-black"></div>

      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-purple-500/8 rounded-full blur-2xl lg:blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-36 h-36 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-cyan-500/8 rounded-full blur-2xl lg:blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 w-40 h-40 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-blue-500/5 rounded-full blur-2xl lg:blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/3 left-1/3 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-cyan-500/6 rounded-full blur-2xl lg:blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 bg-purple-500/6 rounded-full blur-2xl lg:blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }}></div>
      </div>

      {/* Dashboard Content */}
      <div className="relative mx-auto max-w-6xl z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-xl mb-4 shadow-lg">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 animate-fade-in leading-tight">
            Welcome to Your <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Track your Hivox airdrop rewards, referrals, and earnings with real-time analytics and insights.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="group animate-fade-in bg-gradient-to-br from-slate-900/90 to-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:scale-105 hover:border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                <Coins className="h-5 w-5 text-white" />
              </div>
              <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-purple-400 transition-colors duration-300" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{userStats.claimedAmount.toLocaleString()}</div>
            <div className="text-slate-400 text-sm font-medium">Claimed Airdrop</div>
          </div>

          <div className="group animate-fade-in bg-gradient-to-br from-slate-900/90 to-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 hover:scale-105 hover:border-cyan-500/30" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/25 transition-all duration-300">
                <Users className="h-5 w-5 text-white" />
              </div>
              <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition-colors duration-300" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{userStats.totalReferrals.toLocaleString()}</div>
            <div className="text-slate-400 text-sm font-medium">Total Referrals</div>
          </div>

          <div className="group animate-fade-in bg-gradient-to-br from-slate-900/90 to-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-105 hover:border-blue-500/30" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors duration-300" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{userStats.activeReferrals.toLocaleString()}</div>
            <div className="text-slate-400 text-sm font-medium">Active Referrals</div>
          </div>

          <div className="group animate-fade-in bg-gradient-to-br from-slate-900/90 to-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl hover:shadow-green-500/10 transition-all duration-500 hover:scale-105 hover:border-green-500/30" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-green-400 transition-colors duration-300" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{userStats.pendingRewards.toLocaleString()}</div>
            <div className="text-slate-400 text-sm font-medium">Pending Rewards</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Referral Link Section */}
          <div className="group animate-fade-in bg-gradient-to-br from-slate-900/90 to-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:border-purple-500/30" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <LinkIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Your Referral Link</h2>
                <p className="text-slate-400 text-sm">Share this link to earn rewards and grow your network</p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm font-mono truncate flex-1 mr-3">
                  {referralLink}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-600 hover:to-cyan-700 text-white p-2 rounded-lg transition-all duration-300 hover:scale-110 shadow-lg"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <button
              onClick={shareReferralLink}
              className="w-full bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-600 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center shadow-lg hover:shadow-purple-500/25 text-base"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Share Referral Link
            </button>
          </div>

          {/* Referral Stats */}
          <div className="group animate-fade-in bg-gradient-to-br from-slate-900/90 to-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 hover:border-cyan-500/30" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Referral Stats</h2>
                <p className="text-slate-400 text-sm">Your referral performance and achievements</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-600/30 hover:border-cyan-500/30 transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-slate-300 text-base font-medium">Referral Level</span>
                </div>
                <span className="text-white font-bold text-lg">Level {userStats.referralLevel}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-600/30 hover:border-green-500/30 transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                    <Coins className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-slate-300 text-base font-medium">Total Earned</span>
                </div>
                <span className="text-white font-bold text-lg">{userStats.totalEarned.toLocaleString()} HIVOX</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-600/30 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-slate-300 text-base font-medium">Conversion Rate</span>
                </div>
                <span className="text-white font-bold text-lg">
                  {Math.round((userStats.activeReferrals / userStats.totalReferrals) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Recent Activity</h2>
                <p className="text-slate-400 text-sm">Your latest transactions and rewards</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { type: 'referral', user: '0x1234...5678', amount: 50, time: '2 hours ago' },
                { type: 'claim', user: 'You', amount: 1250, time: '1 day ago' },
                { type: 'referral', user: '0xabcd...efgh', amount: 50, time: '3 days ago' },
                { type: 'bonus', user: 'You', amount: 100, time: '1 week ago' }
              ].map((activity, index) => (
                <div key={index} className="group flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-600/30 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 shadow-lg ${
                      activity.type === 'referral' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                      activity.type === 'claim' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                      'bg-gradient-to-br from-purple-500 to-pink-500'
                    }`}>
                      {activity.type === 'referral' ? <Users className="h-5 w-5 text-white" /> :
                       activity.type === 'claim' ? <Coins className="h-5 w-5 text-white" /> :
                       <Gift className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                      <div className="text-white font-semibold text-base">
                        {activity.type === 'referral' ? 'New Referral' :
                         activity.type === 'claim' ? 'Airdrop Claimed' :
                         'Bonus Earned'}
                      </div>
                      <div className="text-slate-400 text-sm">{activity.user}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-lg">+{activity.amount.toLocaleString()} HIVOX</div>
                    <div className="text-slate-400 text-sm">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 