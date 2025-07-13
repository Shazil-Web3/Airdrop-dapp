import { useAccount } from 'wagmi';
import { useEffect, useRef } from 'react';
import apiService from '../lib/api';

export function useSyncWalletWithBackend() {
  const { address, isConnected } = useAccount();
  const hasSynced = useRef();

  useEffect(() => {
    if (isConnected && address && !hasSynced.current) {
      hasSynced.current = true;
      apiService.connectWallet({ walletAddress: address })
        .catch((err) => {
          hasSynced.current = false;
          console.error('Failed to sync wallet with backend:', err);
        });
    }
    if (!isConnected) {
      hasSynced.current = false;
    }
  }, [isConnected, address]);
} 