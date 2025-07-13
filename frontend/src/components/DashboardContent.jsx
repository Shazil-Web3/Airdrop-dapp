'use client';

import { useState, useEffect, useRef } from 'react';
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
import { useWallet } from '../hooks/useWallet';
import apiService from '../lib/api';

export const DashboardContent = () => {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);
  const hasSyncedRef = useRef(false);
  
  const {
    user,
    loading,
    error,
    activities,
    referrals,
    claims,
    referralRewards,
    referralChain,
    connectWallet,
    getReferralLink,
    copyReferralLink,
    refreshData,
    loadUserData
  } = useWallet();

  const referralLink = getReferralLink();

  // Handle wallet connection
  useEffect(() => {
    if (isConnected && address && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      // Extract referral code from URL if present
      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get('ref');
      
      // Connect wallet to backend directly via API
      const syncWalletWithBackend = async () => {
        try {
          const response = await apiService.connectWallet({
            walletAddress: address,
            ...(referralCode && { referralCode })
          });
          
          // Refresh user data after successful connection
          if (loadUserData) {
            await loadUserData(address);
          }
        } catch (err) {
          console.error('Failed to connect wallet to backend:', err);
          hasSyncedRef.current = false; // Reset on error
          // Even if connection fails, try to load existing user data
          if (!user && loadUserData) {
            try {
              await loadUserData(address);
            } catch (loadErr) {
              console.error('Failed to load user data:', loadErr);
            }
          }
        }
      };

      syncWalletWithBackend();
    }
    
    // Reset sync flag when wallet disconnects
    if (!isConnected) {
      hasSyncedRef.current = false;
    }
  }, [isConnected, address, user, loadUserData]);

  const copyToClipboard = async () => {
    try {
      const success = await copyReferralLink();
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareReferralLink = async () => {
    if (navigator.share && referralLink) {
      try {
        await navigator.share({
          title: 'Join Hivox Airdrop',
          text: 'Claim your Hivox airdrop and earn rewards!',
          url: referralLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  // Calculate user stats from real data
  const userStats = {
    claimedAmount: user?.totalTokensClaimed || 0,
    totalReferrals: referrals.length,
    activeReferrals: referrals.filter(ref => ref.status === 'active').length,
    pendingRewards: referralRewards.total,
    referralLevel: referralChain.length + 1,
    totalEarned: (user?.totalTokensClaimed || 0) + referralRewards.total
  };

  if (!isConnected) {
    return (
      <section className="relative overflow-hidden px-4 sm:px-6 py-16 lg:py-24 min-h-screen flex items-center justify-center">
        {/* Darker Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-purple-800 to-black"></div>
<div className="absolute inset-0 bg-gradient-to-tr from-slate-700 via-transparent to-transparent opacity-40"></div>
<div className="absolute inset-0 bg-gradient-to-b from-slate-700/30 to-black"></div>



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

  if (loading) {
    return (
      <section className="relative overflow-hidden px-4 sm:px-6 py-16 lg:py-24 min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-black"></div>
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading your dashboard...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative overflow-hidden px-4 sm:px-6 py-16 lg:py-24 min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-black"></div>
        <div className="relative z-10 text-center">
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 mb-4">
            <p className="text-red-400 text-lg mb-4">Error loading dashboard</p>
            <p className="text-slate-400 text-sm mb-4">{error}</p>
            <button 
              onClick={refreshData}
              className="bg-gradient-to-r from-purple-500 to-cyan-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-cyan-700 transition-all duration-300"
            >
              Retry
            </button>
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
                  {referralLink || (user?.referralCode ? `Referral Code: ${user.referralCode}` : 'Loading referral code...')}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-600 hover:to-cyan-700 text-white p-2 rounded-lg transition-all duration-300 hover:scale-110 shadow-lg"
                  disabled={!referralLink && !user?.referralCode}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            {/* Referral Code Display */}
            {user?.referralCode && (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-600/20 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Your Referral Code</span>
                    <div className="text-white font-mono text-lg font-bold mt-1">{user.referralCode}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-xs">Share this code</span>
                    <div className="text-slate-300 text-sm mt-1">or use the link above</div>
                  </div>
                </div>
              </div>
            )}
            
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
                  {userStats.totalReferrals > 0 ? Math.round((userStats.activeReferrals / userStats.totalReferrals) * 100) : 0}%
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
              {activities.length > 0 ? (
                activities.slice(0, 5).map((activity, index) => (
                  <div key={activity.id || index} className="group flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-600/30 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 shadow-lg ${
                        activity.activityType === 'referral_created' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                        activity.activityType === 'claim_submitted' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                        activity.activityType === 'referral_reward' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                        'bg-gradient-to-br from-slate-500 to-gray-500'
                      }`}>
                        {activity.activityType === 'referral_created' ? <Users className="h-5 w-5 text-white" /> :
                         activity.activityType === 'claim_submitted' ? <Coins className="h-5 w-5 text-white" /> :
                         activity.activityType === 'referral_reward' ? <Gift className="h-5 w-5 text-white" /> :
                         <TrendingUp className="h-5 w-5 text-white" />}
                      </div>
                      <div>
                        <div className="text-white font-semibold text-base">
                          {activity.activityType === 'referral_created' ? 'New Referral' :
                           activity.activityType === 'claim_submitted' ? 'Airdrop Claimed' :
                           activity.activityType === 'referral_reward' ? 'Referral Reward' :
                           activity.activityType === 'wallet_connected' ? 'Wallet Connected' :
                           'Activity'}
                        </div>
                        <div className="text-slate-400 text-sm">{activity.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-sm">
                        {new Date(activity.occurredAt || activity.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-400 text-lg">No activities yet</p>
                  <p className="text-slate-500 text-sm">Your activities will appear here once you start using the platform</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 