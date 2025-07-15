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
    const [endTime, setEndTime] = useState(0);
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
            const end = await airdropInstance.endTime();
            const claimed = await airdropInstance.hasClaimed(userAddress);

            console.log("📊 Contract state loaded:", {
                userAddress,
                paused,
                maxClaim: ethers.formatEther(maxClaim),
                endTime: Number(end),
                hasClaimed: claimed
            });

            // Fetch token balances
            const contractBalance = await tokenInstance.balanceOf(addresses.AIRDROP_CONTRACT);
            const userBalance = await tokenInstance.balanceOf(userAddress);

            setIsPaused(paused);
            setMaxClaimPerUser(ethers.formatEther(maxClaim));
            setEndTime(Number(end));
            setHasClaimed(claimed);
            setContractBalance(ethers.formatEther(contractBalance));
            setUserTokenBalance(ethers.formatEther(userBalance));

            // Fetch referral percentages (if available)
            try {
                const refPercentages = await airdropInstance.getReferralPercentages();
                // setReferralPercentages(refPercentages.map(Number)); // Removed as per edit
            } catch (error) {
                // If getter doesn't exist, try to read public array
                try {
                    // const refPercentages = [ // Removed as per edit
                    //     await airdropInstance.referralPercentages(0),
                    //     await airdropInstance.referralPercentages(1),
                    //     await airdropInstance.referralPercentages(2)
                    // ];
                    // setReferralPercentages(refPercentages.map(Number)); // Removed as per edit
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
    const claimAirdrop = async () => {
        console.log("[claimAirdrop] Called");
        if (!window.ethereum) {
            toast.error("No Ethereum provider found. Please install MetaMask or another Web3 wallet.");
            console.error("[claimAirdrop] window.ethereum is not available");
            return;
        }
        if (!airdropContract) {
            toast.error("Airdrop contract is not initialized");
            console.error("[claimAirdrop] airdropContract is null");
            return;
        }
        if (!signer) {
            toast.error("Wallet signer is not initialized");
            console.error("[claimAirdrop] signer is null");
            return;
        }
        if (!tokenContract) {
            toast.error("Token contract is not initialized");
            console.error("[claimAirdrop] tokenContract is null");
            return;
        }
        if (!contractAddresses) {
            toast.error("Contract addresses are not loaded");
            console.error("[claimAirdrop] contractAddresses is null");
            return;
        }

        // Check endTime before attempting to claim
        let endTimeValue;
        try {
            endTimeValue = await airdropContract.endTime();
            const now = Math.floor(Date.now() / 1000);
            if (now > Number(endTimeValue)) {
                toast.error("Airdrop has ended");
                console.error("[claimAirdrop] Airdrop has ended. endTime:", Number(endTimeValue), "now:", now);
                return;
            }
        } catch (err) {
            toast.error("Failed to fetch airdrop end time");
            console.error("[claimAirdrop] Error fetching endTime:", err);
            return;
        }

        // Force refresh claim status before attempting to claim
        let userAddress;
        try {
            userAddress = await signer.getAddress();
            console.log("[claimAirdrop] User address:", userAddress);
        } catch (err) {
            toast.error("Failed to get user address from signer");
            console.error("[claimAirdrop] Error getting user address:", err);
            return;
        }
        
        // Check claim status directly from contract
        let alreadyClaimed;
        try {
            alreadyClaimed = await airdropContract.hasClaimed(userAddress);
            console.log("[claimAirdrop] Direct contract check - hasClaimed:", alreadyClaimed);
        } catch (err) {
            toast.error("Failed to check claim status from contract");
            console.error("[claimAirdrop] Error checking hasClaimed:", err);
            return;
        }
        
        if (alreadyClaimed) {
            toast.error("You have already claimed your airdrop");
            setHasClaimed(true);
            return;
        }

        if (hasClaimed) {
            toast.error("You have already claimed your airdrop (state cache)");
            return;
        }

        if (isPaused) {
            toast.error("Airdrop is currently paused");
            console.error("[claimAirdrop] Contract is paused");
            return;
        }

        setIsLoading(true);

        try {
            const claimAmount = 100; // Fixed amount of 100 tokens
            // No referrer logic, always use zero address
            const referrer = ethers.ZeroAddress;

            console.log("[claimAirdrop] Preparing to claim airdrop:", {
                userAddress,
                claimAmount,
                referrer,
                network: currentNetwork?.name,
                contractAddress: airdropContract.target
            });

            // Check contract balance (no referral rewards)
            let contractBalanceRaw;
            try {
                contractBalanceRaw = await tokenContract.balanceOf(airdropContract.target);
                console.log("[claimAirdrop] Contract balance (raw):", contractBalanceRaw.toString());
            } catch (err) {
                toast.error("Failed to fetch contract token balance");
                console.error("[claimAirdrop] Error fetching contract balance:", err);
                setIsLoading(false);
                return;
            }
            // Only require enough for the claim
            if (contractBalanceRaw < ethers.parseEther(claimAmount.toString())) {
                toast.error("Airdrop contract has insufficient tokens for your claim");
                console.error("[claimAirdrop] Insufficient contract balance for claim only:", contractBalanceRaw.toString());
                setIsLoading(false);
                return;
            }

            // Estimate gas first
            let gasEstimate;
            let tx;
            try {
                gasEstimate = await airdropContract.claimAirdrop.estimateGas(referrer);
                console.log("[claimAirdrop] Gas estimate:", gasEstimate.toString());
                
                // Convert to BigNumber if it's not already (ethers v6 compatibility)
                let gasLimit;
                if (typeof gasEstimate === 'bigint') {
                    // For ethers v6, gasEstimate is a BigInt
                    gasLimit = (gasEstimate * 120n) / 100n; // Add 20% buffer using BigInt arithmetic
                } else {
                    // For ethers v5, gasEstimate is a BigNumber
                    gasLimit = gasEstimate.mul(120).div(100); // Add 20% buffer
                }
                
                tx = await airdropContract.claimAirdrop(referrer, {
                    gasLimit: gasLimit
                });
            } catch (error) {
                // Log all relevant state for debugging
                console.error("[claimAirdrop] Gas estimation failed:", error);
                console.error("[claimAirdrop] Debug info:", {
                    userAddress,
                    referrer,
                    contractAddress: airdropContract.target,
                    contractBalance: contractBalanceRaw.toString(),
                    isPaused,
                    hasClaimed,
                    alreadyClaimed,
                    currentNetwork,
                    contractAddresses
                });
                toast.info("Gas estimation failed, trying to send transaction with fixed gas limit...");
                try {
                    tx = await airdropContract.claimAirdrop(referrer, {
                        gasLimit: 300000
                    });
                } catch (sendError) {
                    console.error("[claimAirdrop] Transaction send failed after fallback:", sendError);
                    toast.error(sendError.reason || sendError.message || "Failed to send claim transaction (fallback)");
                    setIsLoading(false);
                    return;
                }
            }

            try {
                await tx.wait();
                console.log("[claimAirdrop] Transaction confirmed");
            } catch (error) {
                console.error("[claimAirdrop] Transaction wait failed:", error);
                toast.error(error.reason || error.message || "Transaction failed after sending");
                setIsLoading(false);
                return;
            }

            toast.success("🎉 Airdrop claimed successfully!");
            setHasClaimed(true);

            // Refresh contract state
            await loadContractState(airdropContract, tokenContract, contractAddresses);
        } catch (error) {
            console.error("[claimAirdrop] General error:", error, error?.reason, error?.data);
            if (error.message && error.message.includes("Already claimed")) {
                toast.error("You have already claimed your airdrop");
                setHasClaimed(true);
            } else if (error.message && (error.message.includes("Outside claim period") || error.message.includes("Airdrop has ended"))) {
                toast.error("Airdrop is not active at this time");
            } else if (error.message && error.message.includes("Insufficient balance")) {
                toast.error("Airdrop contract has insufficient tokens");
            } else if (error.message && error.message.includes("Airdrop is paused")) {
                toast.error("Airdrop is currently paused");
            } else if (error.message && error.message.includes("missing revert data")) {
                toast.error("Transaction failed with missing revert data. Please check the console for more details.");
            } else if (error.data && error.data.message) {
                toast.error(error.data.message);
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
            // setReferralPercentages(newPercentages); // Removed as per edit
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
                endTime,
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
                // updateReferralPercentages, // Removed as per edit
                loadContractState: () => loadContractState(airdropContract, tokenContract, contractAddresses),
            }}
        >
            {children}
        </AirdropContext.Provider>
    );
};

export const useAirdrop = () => useContext(AirdropContext);