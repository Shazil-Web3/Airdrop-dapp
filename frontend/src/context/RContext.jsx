// AirdropContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { getContractAddresses, getCurrentNetwork } from '../config/networks.js';

// Import ABIs
import airdropABI from './airdrop.json';
import tokenABI from './token.json';

const AirdropContext = createContext();

export const AirdropProvider = ({ children }) => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [airdropContract, setAirdropContract] = useState(null);
    const [tokenContract, setTokenContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    const [hasClaimed, setHasClaimed] = useState(false);
    const [maxClaimPerUser, setMaxClaimPerUser] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [referralPercentages, setReferralPercentages] = useState([]);
    const [referrer, setReferrer] = useState(null);
    const [contractBalance, setContractBalance] = useState(0);
    const [userTokenBalance, setUserTokenBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [currentNetwork, setCurrentNetwork] = useState(null);
    const [contractAddresses, setContractAddresses] = useState(null);

    // Initialize provider, signer, and contracts
    useEffect(() => {
        const init = async () => {
            if (!window.ethereum) {
                toast.error("Please install MetaMask or another Web3 wallet");
                return;
            }

            try {
                // Get current network and contract addresses
                const network = getCurrentNetwork();
                const addresses = getContractAddresses();
                
                setCurrentNetwork(network);
                setContractAddresses(addresses);

                const provider = new ethers.BrowserProvider(window.ethereum);
                setProvider(provider);

                const signer = await provider.getSigner();
                setSigner(signer);
                const userAddress = await signer.getAddress();
                setAccount(userAddress);

                // Initialize contracts with dynamic addresses
                const airdropInstance = new ethers.Contract(
                    addresses.AIRDROP_CONTRACT,
                    airdropABI.abi,
                    signer
                );
                setAirdropContract(airdropInstance);

                const tokenInstance = new ethers.Contract(
                    addresses.TOKEN_CONTRACT,
                    tokenABI.abi,
                    signer
                );
                setTokenContract(tokenInstance);

                // Fetch contract state
                await loadContractState(airdropInstance, tokenInstance, addresses);
            } catch (error) {
                console.error("Initialization error:", error);
                toast.error("Failed to connect to contract");
            }
        };

        init();

        // Handle account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    init();
                } else {
                    setAccount(null);
                    setSigner(null);
                }
            });

            // Handle chain changes
            window.ethereum.on('chainChanged', (chainId) => {
                console.log('Chain changed to:', chainId);
                init();
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners('accountsChanged');
                window.ethereum.removeAllListeners('chainChanged');
            }
        };
    }, []);

    const loadContractState = async (airdropInstance, tokenInstance, addresses) => {
        try {
            // Always use the currently connected wallet address
            const signer = airdropInstance.runner;
            const userAddress = signer && signer.getAddress ? await signer.getAddress() : account;

            console.log("🔍 Loading contract state for address:", userAddress);

            // Fetch airdrop contract state
            const paused = await airdropInstance.paused();
            const maxClaim = await airdropInstance.maxClaimPerUser();
            const start = await airdropInstance.startTime();
            const end = await airdropInstance.endTime();
            const claimed = await airdropInstance.hasClaimed(userAddress);

            console.log("📊 Contract state loaded:", {
                userAddress,
                paused,
                maxClaim: ethers.formatEther(maxClaim),
                startTime: Number(start),
                endTime: Number(end),
                hasClaimed: claimed
            });

            // Fetch token balances
            const contractBalance = await tokenInstance.balanceOf(addresses.AIRDROP_CONTRACT);
            const userBalance = await tokenInstance.balanceOf(userAddress);

            setIsPaused(paused);
            setMaxClaimPerUser(ethers.formatEther(maxClaim));
            setStartTime(Number(start));
            setEndTime(Number(end));
            setHasClaimed(claimed);
            setContractBalance(ethers.formatEther(contractBalance));
            setUserTokenBalance(ethers.formatEther(userBalance));

            // Fetch referral percentages (if available)
            try {
                const refPercentages = await airdropInstance.getReferralPercentages();
                setReferralPercentages(refPercentages.map(Number));
            } catch (error) {
                // If getter doesn't exist, try to read public array
                try {
                    const refPercentages = [
                        await airdropInstance.referralPercentages(0),
                        await airdropInstance.referralPercentages(1),
                        await airdropInstance.referralPercentages(2)
                    ];
                    setReferralPercentages(refPercentages.map(Number));
                } catch (e) {
                    console.log("Could not fetch referral percentages");
                }
            }
        } catch (error) {
            console.error("Error loading contract state:", error);
        }
    };

    // Force refresh claim status
    const refreshClaimStatus = async () => {
        if (!airdropContract || !signer) {
            toast.error("Please connect your wallet");
            return;
        }

        try {
            const userAddress = await signer.getAddress();
            console.log("🔄 Refreshing claim status for:", userAddress);
            
            // Clear the hasClaimed state first
            setHasClaimed(false);
            
            // Check claim status directly from contract
            const claimed = await airdropContract.hasClaimed(userAddress);
            console.log("✅ Claim status from contract:", claimed);
            
            setHasClaimed(claimed);
            
            if (!claimed) {
                toast.success("Claim status refreshed - you can claim!");
            } else {
                toast.info("Claim status refreshed - you have already claimed");
            }
        } catch (error) {
            console.error("Error refreshing claim status:", error);
            toast.error("Failed to refresh claim status");
        }
    };

    // Define connectWallet function
    const connectWallet = async () => {
        if (!window.ethereum) {
            toast.error("Please install MetaMask or another Web3 wallet");
            return;
        }
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            // Re-initialize provider, signer, and contracts
            const network = getCurrentNetwork();
            const addresses = getContractAddresses();
            setCurrentNetwork(network);
            setContractAddresses(addresses);
            const provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(provider);
            const signer = await provider.getSigner();
            setSigner(signer);
            const userAddress = await signer.getAddress();
            setAccount(userAddress);
            const airdropInstance = new ethers.Contract(
                addresses.AIRDROP_CONTRACT,
                airdropABI.abi,
                signer
            );
            setAirdropContract(airdropInstance);
            const tokenInstance = new ethers.Contract(
                addresses.TOKEN_CONTRACT,
                tokenABI.abi,
                signer
            );
            setTokenContract(tokenInstance);
            await loadContractState(airdropInstance, tokenInstance, addresses);
        } catch (error) {
            console.error("Wallet connection error:", error);
            toast.error("Failed to connect wallet");
        }
    };

    // Claim airdrop
    const claimAirdrop = async (referrerAddress = null) => {
        if (!airdropContract || !signer) {
            toast.error("Please connect your wallet");
            return;
        }

        // Force refresh claim status before attempting to claim
        const userAddress = await signer.getAddress();
        console.log("🎯 Attempting claim for address:", userAddress);
        
        // Check claim status directly from contract
        const alreadyClaimed = await airdropContract.hasClaimed(userAddress);
        console.log("🔍 Direct contract check - hasClaimed:", alreadyClaimed);
        
        if (alreadyClaimed) {
            toast.error("You have already claimed your airdrop");
            setHasClaimed(true);
            return;
        }

        if (hasClaimed) {
            toast.error("You have already claimed your airdrop");
            return;
        }

        if (isPaused) {
            toast.error("Airdrop is currently paused");
            return;
        }

        setIsLoading(true);

        try {
            const claimAmount = 100; // Fixed amount of 100 tokens
            const referrer = referrerAddress || ethers.ZeroAddress;

            console.log("🚀 Preparing to claim airdrop:", {
                userAddress,
                claimAmount,
                referrer,
                network: currentNetwork?.name,
                contractAddress: airdropContract.target
            });

            // Check contract balance
            const contractBalance = await tokenContract.balanceOf(airdropContract.target);
            console.log("💰 Contract balance:", ethers.formatEther(contractBalance));
            if (contractBalance < ethers.parseEther(claimAmount.toString())) {
                toast.error("Airdrop contract has insufficient tokens");
                setIsLoading(false);
                return;
            }

            console.log("📝 Claiming airdrop:", {
                referrer: referrer,
                claimAmount: claimAmount
            });

            // Estimate gas first
            const gasEstimate = await airdropContract.claimAirdrop.estimateGas(referrer);
            console.log("⛽ Gas estimate:", gasEstimate.toString());

            const tx = await airdropContract.claimAirdrop(referrer, {
                gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
            });

            console.log("📡 Transaction sent:", tx.hash);
            await tx.wait();

            toast.success("🎉 Airdrop claimed successfully!");
            setHasClaimed(true);

            // Refresh contract state
            await loadContractState(airdropContract, tokenContract, contractAddresses);
        } catch (error) {
            console.error("❌ Claim error:", error, error?.reason, error?.data);
            if (error.message.includes("Already claimed")) {
                toast.error("You have already claimed your airdrop");
                setHasClaimed(true);
            } else if (error.message.includes("Outside claim period") || error.message.includes("Airdrop has ended")) {
                toast.error("Airdrop is not active at this time");
            } else if (error.message.includes("Insufficient balance")) {
                toast.error("Airdrop contract has insufficient tokens");
            } else if (error.message.includes("Airdrop is paused")) {
                toast.error("Airdrop is currently paused");
            } else if (error.message.includes("missing revert data")) {
                toast.error("Transaction failed. Please check if you have already claimed or if the contract is properly configured.");
            } else {
                toast.error(error.reason || error.message || "Failed to claim airdrop");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Check if user can claim (remove time-based restriction)
    const canClaim = () => {
        return !isPaused && !hasClaimed && parseFloat(contractBalance) >= 100;
    };

    // Get claimable amount (remove time-based restriction)
    const getClaimableAmount = () => {
        if (hasClaimed) return 0;
        if (isPaused) return 0;
        return 100; // Fixed amount of 100 tokens
    };

    // Admin: Pause contract
    const pauseAirdrop = async () => {
        if (!airdropContract || !signer) {
            toast.error("Please connect your wallet");
            return;
        }

        try {
            const tx = await airdropContract.pause();
            await tx.wait();
            setIsPaused(true);
            toast.success("Airdrop paused successfully");
        } catch (error) {
            console.error("Pause error:", error);
            toast.error(error.reason || "Failed to pause airdrop");
        }
    };

    // Admin: Unpause contract
    const unpauseAirdrop = async () => {
        if (!airdropContract || !signer) {
            toast.error("Please connect your wallet");
            return;
        }

        try {
            const tx = await airdropContract.unpause();
            await tx.wait();
            setIsPaused(false);
            toast.success("Airdrop unpaused successfully");
        } catch (error) {
            console.error("Unpause error:", error);
            toast.error(error.reason || "Failed to unpause airdrop");
        }
    };

    // Admin: Withdraw remaining tokens
    const withdrawRemaining = async () => {
        if (!airdropContract || !signer) {
            toast.error("Please connect your wallet");
            return;
        }

        try {
            const tx = await airdropContract.withdrawRemaining();
            await tx.wait();
            toast.success("Remaining tokens withdrawn successfully");
            await loadContractState(airdropContract, tokenContract, contractAddresses);
        } catch (error) {
            console.error("Withdraw error:", error);
            toast.error(error.reason || "Failed to withdraw tokens");
        }
    };

    // Admin: Update verifier
    const updateVerifier = async (newVerifierAddress) => {
        if (!airdropContract || !signer) {
            toast.error("Please connect your wallet");
            return;
        }

        try {
            const tx = await airdropContract.updateVerifier(newVerifierAddress);
            await tx.wait();
            toast.success("Verifier updated successfully");
        } catch (error) {
            console.error("Update verifier error:", error);
            toast.error(error.reason || "Failed to update verifier");
        }
    };

    // Admin: Update referral percentages
    const updateReferralPercentages = async (newPercentages) => {
        if (!airdropContract || !signer) {
            toast.error("Please connect your wallet");
            return;
        }

        try {
            const tx = await airdropContract.updateReferralPercentages(newPercentages);
            await tx.wait();
            setReferralPercentages(newPercentages);
            toast.success("Referral percentages updated successfully");
        } catch (error) {
            console.error("Update percentages error:", error);
            toast.error(error.reason || "Failed to update referral percentages");
        }
    };

    return (
        <AirdropContext.Provider
            value={{
                account,
                isPaused,
                hasClaimed,
                maxClaimPerUser,
                startTime,
                endTime,
                referralPercentages,
                contractBalance,
                userTokenBalance,
                isLoading,
                currentNetwork,
                contractAddresses,
                connectWallet,
                claimAirdrop,
                refreshClaimStatus,
                canClaim,
                getClaimableAmount,
                pauseAirdrop,
                unpauseAirdrop,
                withdrawRemaining,
                updateVerifier,
                updateReferralPercentages,
                loadContractState: () => loadContractState(airdropContract, tokenContract, contractAddresses),
            }}
        >
            {children}
        </AirdropContext.Provider>
    );
};

export const useAirdrop = () => useContext(AirdropContext);