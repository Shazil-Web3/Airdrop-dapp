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
  ExternalLink,
  Loader,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { useAccount } from 'wagmi';
import { CustomConnectButton } from './CustomConnectButton.jsx';
import { useWallet } from '../hooks/useWallet';
import { useAirdrop } from '../context/RContext.jsx';
import apiService from '../lib/api';
import { ContractTestRunner } from './ContractTestRunner.jsx';
import { AirdropFunder } from './AirdropFunder.jsx';
import { fetchPassportScore } from '../lib/gitcoinPassport';
import DashboardTaskRoadmap from './DashboardTaskRoadmap';

export const DashboardContent = () => {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);
  const hasSyncedRef = useRef(false);
  const [allowed, setAllowed] = useState(false);
  const [score, setScore] = useState(0);
  const [threshold, setThreshold] = useState(1);
  const [loadingScore, setLoadingScore] = useState(false);
  const [tweetTaskCompleted, setTweetTaskCompleted] = useState(false);
  const [gitcoinVerified, setGitcoinVerified] = useState(false);
  const [gitcoinVerificationDisabled, setGitcoinVerificationDisabled] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [referralSubmitted, setReferralSubmitted] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Use the new AirdropContext
  const {
    account,
    isPaused,
    hasClaimed,
    maxClaimPerUser,
    startTime,
    endTime,
    contractBalance,
    userTokenBalance,
    isLoading,
    isZKVerified,
    zkVerifying,
    claimAirdrop,
    refreshClaimStatus,
    verifyZKProof,
    canClaim,
    getClaimableAmount,
    loadContractState
  } = useAirdrop();
  
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
    loadUserData,
    submitClaim
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

  useEffect(() => {
    const checkTweetTask = async () => {
      if (!address) return;
      try {
        const res = await apiService.checkTweetTaskStatus(address);
        setTweetTaskCompleted(!!res.tweetTask?.completed);
      } catch (err) {
        setTweetTaskCompleted(false);
      }
    };
    checkTweetTask();
  }, [address]);

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

  async function checkPassportScore() {
    if (!address) return;
    setLoadingScore(true);
    try {
      const result = await fetchPassportScore(address);
      setScore(result.score);
      setAllowed(!!result.passing);
      setThreshold(result.threshold || 1);
    } catch (e) {
      setScore(0);
      setAllowed(false);
      setThreshold(1);
    }
    setLoadingScore(false);
  }

  useEffect(() => {
    if (address) checkPassportScore();
  }, [address]);

  // Show referral modal only once per user (localStorage)
  useEffect(() => {
    if (typeof window !== 'undefined' && isConnected && address) {
      const seen = localStorage.getItem(`seenReferralModal_${address}`);
      if (!seen) {
        setShowReferralModal(true);
      }
    }
  }, [isConnected, address]);

  const handleReferralSubmit = () => {
    if (referralInput.trim()) {
      localStorage.setItem(`userReferralCode_${address}`, referralInput.trim());
      localStorage.setItem(`seenReferralModal_${address}`, '1');
      setShowReferralModal(false);
      setReferralSubmitted(true);
    }
  };
  const handleNoReferral = () => {
    localStorage.setItem(`userReferralCode_${address}`, '');
    localStorage.setItem(`seenReferralModal_${address}`, '1');
    setShowReferralModal(false);
    setReferralSubmitted(true);
  };

  // Handle airdrop claim
  const handleClaimAirdrop = async () => {
    try {
      let referralCode = localStorage.getItem(`userReferralCode_${address}`) || undefined;
      await claimAirdrop(referralCode);
      // Refresh contract state after claiming
      if (loadContractState) {
        await loadContractState();
      }
      // Refresh user data and activities for real-time dashboard update
      if (refreshData) {
        await refreshData();
      }
      if (loadUserData && address) {
        await loadUserData(address);
      }
    } catch (error) {
      console.error('Claim failed:', error);
    }
  };

  // Only allow Gitcoin verification after tweet task
  const [gitcoinLogged, setGitcoinLogged] = useState(false);
  const handleGitcoinVerified = async () => {
    setGitcoinVerificationDisabled(true);
    await checkPassportScore();
    setGitcoinVerified(allowed);
    setGitcoinVerificationDisabled(false);
  };

  // Log Gitcoin verification activity when allowed becomes true
  useEffect(() => {
    if (address && allowed && !gitcoinLogged) {
      apiService.logGitcoinVerified(address).catch(() => {});
      setGitcoinLogged(true);
    }
  }, [address, allowed, gitcoinLogged]);

  // Update tweetTaskCompleted when tweet is verified
  const handleTweetVerified = () => {
    setTweetTaskCompleted(true);
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

  // Get claimable amount from context
  const claimableAmount = getClaimableAmount();

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (initialLoading) {
    return (
      <section className="relative overflow-hidden px-4 sm:px-6 py-16 lg:py-24 min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-black"></div>
        <div className="relative z-10 flex flex-col items-center justify-center gap-6">
          <div className="w-24 h-24 flex items-center justify-center">
            <svg className="animate-spin-slow" width="96" height="96" viewBox="0 0 96 96" fill="none">
              <circle cx="48" cy="48" r="40" stroke="#a855f7" strokeWidth="8" strokeDasharray="60 100" strokeLinecap="round" />
              <circle cx="48" cy="48" r="32" stroke="#06b6d4" strokeWidth="6" strokeDasharray="40 80" strokeLinecap="round" opacity="0.7" />
            </svg>
          </div>
          <p className="text-slate-300 text-lg">Loading your dashboard...</p>
          <style jsx global>{`
            .animate-spin-slow {
              animation: spin 1.5s linear infinite;
            }
          `}</style>
        </div>
      </section>
    );
  }

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
        <div className="relative z-10 flex flex-col items-center justify-center gap-6">
          <div className="w-24 h-24 flex items-center justify-center">
            <svg className="animate-spin-slow" width="96" height="96" viewBox="0 0 96 96" fill="none">
              <circle cx="48" cy="48" r="40" stroke="#a855f7" strokeWidth="8" strokeDasharray="60 100" strokeLinecap="round" />
              <circle cx="48" cy="48" r="32" stroke="#06b6d4" strokeWidth="6" strokeDasharray="40 80" strokeLinecap="round" opacity="0.7" />
            </svg>
          </div>
          <p className="text-slate-300 text-lg">Loading your dashboard...</p>
          <style jsx global>{`
            .animate-spin-slow {
              animation: spin 1.5s linear infinite;
            }
          `}</style>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative overflow-hidden px-4 sm:px-6 py-16 lg:py-24 min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-black"></div>
        <div className="relative z-10 flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 flex items-center justify-center bg-red-500/10 rounded-full shadow-2xl mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <div className="bg-white/10 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-2 flex items-center justify-center gap-2"><XCircle className="h-6 w-6" /> Error loading dashboard</h2>
            <p className="text-slate-400 text-base mb-4">{error}</p>
            <button 
              onClick={refreshData}
              className="bg-gradient-to-r from-purple-500 to-cyan-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-cyan-700 transition-all duration-300 shadow-lg font-semibold"
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

       
        

        {/* Task Roadmap Grid */}
        <DashboardTaskRoadmap
          walletAddress={address}
          tweetTaskCompleted={tweetTaskCompleted}
          onTweetVerified={handleTweetVerified}
        />
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Referral Link Section */}
          <div className="group animate-fade-in bg-gradient-to-br from-slate-900/90 to-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:border-purple-500/30" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <LinkIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Your Referral Code</h2>
                <p className="text-slate-400 text-sm">Share this code to earn rewards and grow your network</p>
              </div>
            </div>
            {/* Only show the referral code, not the link */}
            {user?.referralCode ? (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-600/20 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Your Referral Code</span>
                  <div className="text-white font-mono text-lg font-bold mt-1">{user.referralCode}</div>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-600 hover:to-cyan-700 text-white p-2 rounded-lg transition-all duration-300 hover:scale-110 shadow-lg ml-4"
                  disabled={!user?.referralCode}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            ) : (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-600/20 mb-4">
                <span className="text-slate-400 text-sm">Loading referral code...</span>
              </div>
            )}
            <button
              onClick={shareReferralLink}
              className="w-full bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-600 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center shadow-lg hover:shadow-purple-500/25 text-base mt-2"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Share Referral Code
            </button>
          </div>

          {/* Claim Airdrop Section */}
          <div className="group animate-fade-in bg-gradient-to-br from-slate-900/90 to-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl hover:shadow-green-500/10 transition-all duration-500 hover:border-green-500/30" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Claim Your Airdrop</h2>
                <p className="text-slate-400 text-sm">You can claim the following amount:</p>
              </div>
            </div>
            {/* Removed Contract Balance and Your Balance grids */}
            <div className="flex items-center justify-between bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30 mb-4">
              <span className="text-3xl font-bold text-green-400">{claimableAmount.toLocaleString()} HIVOX</span>
              <span className="text-slate-400 text-sm">Claimable Amount</span>
            </div>
            {/* Status Messages */}
            {/* Improved Gitcoin Passport Verification UI */}
            <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg flex flex-col items-center">
              <div className="text-lg font-bold text-white mb-2">Gitcoin Passport Verification</div>
              <div className="text-slate-300 text-sm mb-2">
                {loadingScore ? "Checking your score..." : `Current Score: ${score} / ${threshold}`}
              </div>
              {!allowed && (
                <div className="flex flex-col items-center gap-2 w-full">
                  <div className="text-red-400 text-xs mb-2 text-center">
                    Your Gitcoin Passport score is too low to claim the airdrop.<br />
                    (Required: {threshold})
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full justify-center">
                    <a
                      href="https://passport.gitcoin.co"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-center shadow-md text-white ${!tweetTaskCompleted ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'}`}
                      tabIndex={!tweetTaskCompleted ? -1 : 0}
                      aria-disabled={!tweetTaskCompleted}
                      onClick={e => { if (!tweetTaskCompleted) e.preventDefault(); }}
                    >
                      Go verify on Gitcoin Passport
                    </a>
                    <button
                      onClick={checkPassportScore}
                      disabled={loadingScore}
                      className="flex-1 bg-gradient-to-r from-gray-700 to-slate-700 hover:from-gray-800 hover:to-slate-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-md"
                    >
                      {loadingScore ? <Loader className="inline h-4 w-4 animate-spin mr-2" /> : null}
                      Refresh Score
                    </button>
                  </div>
                </div>
              )}
              {allowed && (
                <div className="flex gap-2 w-full justify-center">
                  <button
                    onClick={refreshClaimStatus}
                    disabled={loadingScore}
                    className="bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-md"
                  >
                    Refresh Status
                  </button>
                  <button
                    onClick={handleClaimAirdrop}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-md"
                  >
                    Claim Airdrop
                  </button>
                </div>
              )}
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
              {(() => {
                // Filter out duplicate wallet_connected, only show the most recent one
                const filteredActivities = [];
                let walletConnectedShown = false;
                for (const activity of activities) {
                  if (activity.activityType === 'wallet_connected') {
                    if (!walletConnectedShown) {
                      filteredActivities.push(activity);
                      walletConnectedShown = true;
                    }
                  } else {
                    filteredActivities.push(activity);
                  }
                }
                return filteredActivities.slice(0, 5).map((activity, index) => (
                  <div key={activity.id || index} className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] 
                    ${['tweet_verified','gitcoin_verified','claim_submitted'].includes(activity.activityType)
                      ? 'bg-green-100/80 border-green-300 hover:border-green-400'
                      : 'bg-slate-800/50 border-slate-600/30 hover:border-purple-500/30 backdrop-blur-sm'}
                  `}>
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 shadow-lg ${
                        activity.activityType === 'referral_created' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                        activity.activityType === 'claim_submitted' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                        activity.activityType === 'referral_reward' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                        activity.activityType === 'tweet_verified' ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                        activity.activityType === 'gitcoin_verified' ? 'bg-gradient-to-br from-green-400 to-lime-500' :
                        'bg-gradient-to-br from-slate-500 to-gray-500'
                      }`}>
                        {activity.activityType === 'referral_created' ? <Users className="h-5 w-5 text-white" /> :
                         activity.activityType === 'claim_submitted' ? <Coins className="h-5 w-5 text-white" /> :
                         activity.activityType === 'referral_reward' ? <Gift className="h-5 w-5 text-white" /> :
                         activity.activityType === 'tweet_verified' ? <Share2 className="h-5 w-5 text-white" /> :
                         activity.activityType === 'gitcoin_verified' ? <Star className="h-5 w-5 text-white" /> :
                         activity.activityType === 'wallet_connected' ? <Wallet className="h-5 w-5 text-white" /> :
                         <TrendingUp className="h-5 w-5 text-white" />}
                      </div>
                      <div>
                        <div className="text-green-700 font-semibold text-base">
                          {activity.activityType === 'tweet_verified' ? 'Tweet Verified' :
                           activity.activityType === 'gitcoin_verified' ? 'Gitcoin Verified' :
                           activity.activityType === 'claim_submitted' ? 'Airdrop Claimed' :
                           activity.activityType === 'referral_created' ? 'New Referral' :
                           activity.activityType === 'referral_reward' ? 'Referral Reward' :
                           activity.activityType === 'wallet_connected' ? 'Wallet Connected' :
                           'Activity'}
                        </div>
                        <div className="text-slate-600 text-sm">{activity.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-sm">
                        {new Date(activity.occurredAt || activity.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        
          {/*
       <div className="animate-fade-in mt-8" style={{ animationDelay: "0.7s" }}>
  <ContractTestRunner />
</div>

<div className="animate-fade-in mt-8" style={{ animationDelay: "0.8s" }}>
  <AirdropFunder /> 
</div>
*/}

      </div>
    </section>
  );
}; 