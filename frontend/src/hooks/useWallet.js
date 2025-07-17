'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import apiService from '../lib/api';

export const useWallet = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [claims, setClaims] = useState([]);

  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Connect wallet and sync with backend
  const connectWallet = useCallback(async (connector, referralCode = null) => {
    try {
      setLoading(true);
      setError(null);

      // Connect to wallet
      await connect({ connector });

      // Wait for address to be available
      if (!address) {
        throw new Error('Failed to get wallet address');
      }

      // Connect to backend
      const response = await apiService.connectWallet({
        walletAddress: address,
        ...(referralCode && { referralCode })
      });

      setUser(response.data.user);
      
      // Load user data
      await loadUserData(address);

      return response.data.user;
    } catch (err) {
      console.error('Wallet connection failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connect, address]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    disconnect();
    setUser(null);
    setActivities([]);
    setReferrals([]);
    setClaims([]);
    setError(null);
  }, [disconnect]);

  // Load user data from backend
  const loadUserData = useCallback(async (walletAddress) => {
    if (!walletAddress) {
      return;
    }

    try {
      setLoading(true);

      // Load user profile
      const profileResponse = await apiService.getUserProfile(walletAddress);
      setUser(profileResponse.data.user);

      // Load activities
      const activitiesResponse = await apiService.getUserActivities(walletAddress, 1, 10);
      setActivities(activitiesResponse.data.activities);

      // Load referrals
      const referralsResponse = await apiService.getUserReferrals(walletAddress);
      setReferrals(referralsResponse.data.referrals);

      // Load claims
      const claimsResponse = await apiService.getUserClaims(walletAddress);
      setClaims(claimsResponse.data.claims);

    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit airdrop claim
  const submitClaim = useCallback(async (claimData) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.submitClaim({
        ...claimData,
        walletAddress: address
      });

      // Update user data
      setUser(prev => ({
        ...prev,
        claimStatus: response.data.user.claimStatus,
        totalTokensClaimed: response.data.user.totalTokensClaimed,
        lastClaimDate: response.data.user.lastClaimDate
      }));

      // Add new claim to claims list
      setClaims(prev => [response.data.claim, ...prev]);

      // Add activity
      setActivities(prev => [{
        id: Date.now(),
        activityType: 'claim_submitted',
        description: `Airdrop claim submitted: ${claimData.claimAmount} tokens`,
        occurredAt: new Date().toISOString(),
        transactionHash: claimData.transactionHash
      }, ...prev]);

      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Update user profile
  const updateProfile = useCallback(async (profileData) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.updateUserProfile(address, profileData);
      
      setUser(prev => ({
        ...prev,
        ...response.data.user
      }));

      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Refresh user data
  const refreshData = useCallback(() => {
    if (address) {
      loadUserData(address);
    }
  }, [address, loadUserData]);

  // Auto-load user data when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      loadUserData(address);
    }
  }, [isConnected, address, loadUserData]);

  // Get referral link
  const lastLogTimeRef = useRef(0);
  const getReferralLink = useCallback(() => {
    const now = Date.now();
    if (now - lastLogTimeRef.current > 10000) { // 10 seconds
      console.log('🔗 Frontend: Getting referral link for user:', user);
      lastLogTimeRef.current = now;
    }
    if (!user?.referralCode) {
      if (now - lastLogTimeRef.current > 10000) {
        console.log('❌ Frontend: No referral code found for user');
        lastLogTimeRef.current = now;
      }
      return null;
    }
    const link = `${window.location.origin}?ref=${user.referralCode}`;
    if (now - lastLogTimeRef.current > 10000) {
      console.log('✅ Frontend: Generated referral link:', link);
      lastLogTimeRef.current = now;
    }
    return link;
  }, [user]);

  // Copy referral link to clipboard
  const copyReferralLink = useCallback(async () => {
    const link = getReferralLink();
    const textToCopy = link || user?.referralCode || '';
    
    if (!textToCopy) return false;

    try {
      await navigator.clipboard.writeText(textToCopy);
      return true;
    } catch (err) {
      console.error('Failed to copy referral link:', err);
      return false;
    }
  }, [getReferralLink, user?.referralCode]);

  // Get referral rewards
  const referralRewards = user?.referralRewards || {
    level1: 0,
    level2: 0,
    level3: 0,
    total: 0
  };

  return {
    // State
    user,
    loading,
    error,
    activities,
    referrals,
    claims,
    isConnected,
    address,
    connectors,

    // Actions
    connectWallet,
    disconnectWallet,
    submitClaim,
    updateProfile,
    refreshData,
    loadUserData,
    getReferralLink,
    copyReferralLink,

    // Computed values
    hasClaimed: user?.claimStatus === 'claimed',
    totalTokensClaimed: user?.totalTokensClaimed || 0,
    referralCode: user?.referralCode,
    referralLink: getReferralLink(),
    totalReferrals: referrals.length,
    recentActivities: activities.slice(0, 5),
    referralRewards,
    referralChain: user?.referralChain || []
  };
}; 