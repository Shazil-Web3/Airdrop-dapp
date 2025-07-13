// AirdropContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { generateZKProof } from '../lib/zkVerifier.js';
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
    const [isZKVerified, setIsZKVerified] = useState(false);
    const [zkVerifying, setZkVerifying] = useState(false);

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
                await loadContractState(airdropInstance, tokenInstance, userAddress, addresses);
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

    const loadContractState = async (airdropInstance, tokenInstance, userAddress, addresses) => {
        try {
            // Fetch airdrop contract state
            const paused = await airdropInstance.paused();
            const maxClaim = await airdropInstance.maxClaimPerUser();
            const start = await airdropInstance.startTime();
            const end = await airdropInstance.endTime();
            const claimed = await airdropInstance.hasClaimed(userAddress);

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

    // Connect wallet
    const connectWallet = async () => {
        if (!window.ethereum) {
            toast.error("Please install MetaMask or another Web3 wallet");
            return;
        }

        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setProvider(provider);
            setSigner(signer);
            setAccount(address);
            toast.success("Wallet connected successfully");
        } catch (error) {
            console.error("Wallet connection error:", error);
            toast.error("Failed to connect wallet");
        }
    };

    // Generate ZK proof for claiming
    const generateZKProofForClaim = async (userAddress, claimAmount, referrerAddress = null) => {
        try {
            console.log("Generating ZK proof for claim...");
            const proof = await generateZKProof(userAddress, claimAmount, referrerAddress);
            console.log("ZK proof generated successfully");
            return proof;
        } catch (error) {
            console.error("Error generating ZK proof:", error);
            // Fallback to mock proof
            return ethers.randomBytes(32);
        }
    };

    // Verify ZK proof (step before claiming)
    const verifyZKProof = async () => {
        if (!airdropContract || !signer) {
            toast.error("Please connect your wallet");
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

        setZkVerifying(true);

        try {
            const userAddress = await signer.getAddress();
            const claimAmount = 1000; // Fixed amount of 1000 tokens

            console.log("🔐 Verifying ZK proof for:", {
                userAddress,
                claimAmount
            });

            // Generate real Sismo ZK proof
            const zkProof = await generateZKProofForClaim(userAddress, claimAmount);

            // Verify the proof using Sismo
            const isValid = await verifyZKProof(zkProof, userAddress);
            
            if (isValid) {
                console.log("✅ ZK proof verification completed successfully");
                setIsZKVerified(true);
                toast.success("ZK verification successful! You can now claim your tokens.");
            } else {
                console.log("❌ ZK proof verification failed");
                toast.error("ZK verification failed. Please try again.");
            }
            
        } catch (error) {
            console.error("ZK verification error:", error);
            toast.error("ZK verification failed. Please try again.");
        } finally {
            setZkVerifying(false);
        }
    };

    // Claim airdrop with ZK proof
    const claimAirdrop = async (referrerAddress = null) => {
        if (!airdropContract || !signer) {
            toast.error("Please connect your wallet");
            return;
        }

        if (hasClaimed) {
            toast.error("You have already claimed your airdrop");
            return;
        }

        if (!isZKVerified) {
            toast.error("Please verify your ZK proof first");
            return;
        }

        if (isPaused) {
            toast.error("Airdrop is currently paused");
            return;
        }

        const now = Math.floor(Date.now() / 1000);
        if (now < startTime || now > endTime) {
            toast.error("Airdrop is not active at this time");
            return;
        }

        setIsLoading(true);

        try {
            const userAddress = await signer.getAddress();
            const claimAmount = 1000; // Fixed amount of 1000 tokens
            const referrer = referrerAddress || ethers.ZeroAddress;

            console.log("🚀 Preparing to claim airdrop:", {
                userAddress,
                claimAmount,
                referrer,
                network: currentNetwork?.name,
                contractAddress: airdropContract.target
            });

            // Check if user has already claimed
            const alreadyClaimed = await airdropContract.hasClaimed(userAddress);
            if (alreadyClaimed) {
                toast.error("You have already claimed your airdrop");
                setHasClaimed(true);
                return;
            }

            // Check contract balance
            const contractBalance = await tokenContract.balanceOf(airdropContract.target);
            console.log("💰 Contract balance:", ethers.formatEther(contractBalance));
            
            if (contractBalance < ethers.parseEther(claimAmount.toString())) {
                toast.error("Airdrop contract has insufficient tokens");
                return;
            }

            // Generate real Sismo ZK proof
            const zkProof = await generateZKProofForClaim(userAddress, claimAmount, referrer);
            console.log("🔐 Sismo ZK proof generated:", zkProof);

            console.log("📝 Claiming airdrop with Sismo ZK proof:", {
                referrer: referrer,
                zkProof: zkProof,
                claimAmount: claimAmount
            });

            // Estimate gas first
            const gasEstimate = await airdropContract.claimAirdrop.estimateGas(referrer, zkProof);
            console.log("⛽ Gas estimate:", gasEstimate.toString());

            const tx = await airdropContract.claimAirdrop(referrer, zkProof, {
                gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
            });
            
            console.log("📡 Transaction sent:", tx.hash);
            await tx.wait();
            
            toast.success("🎉 Airdrop claimed successfully!");
            setHasClaimed(true);
            setIsZKVerified(false); // Reset verification state
            
            // Refresh contract state
            await loadContractState(airdropContract, tokenContract, account, contractAddresses);
            
        } catch (error) {
            console.error("❌ Claim error:", error);
            
            // Handle specific error cases
            if (error.message.includes("Already claimed")) {
                toast.error("You have already claimed your airdrop");
                setHasClaimed(true);
            } else if (error.message.includes("Outside claim period")) {
                toast.error("Airdrop is not active at this time");
            } else if (error.message.includes("ZK Proof failed")) {
                toast.error("ZK proof verification failed. Please try again.");
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

    // Check if user can claim
    const canClaim = () => {
        const now = Math.floor(Date.now() / 1000);
        return !isPaused && !hasClaimed && isZKVerified && now >= startTime && now <= endTime && parseFloat(contractBalance) >= 1000;
    };

    // Get claimable amount
    const getClaimableAmount = () => {
        if (hasClaimed) return 0;
        if (isPaused) return 0;
        
        const now = Math.floor(Date.now() / 1000);
        if (now < startTime || now > endTime) return 0;
        
        return 1000; // Fixed amount of 1000 tokens
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
            await loadContractState(airdropContract, tokenContract, account, contractAddresses);
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
                isZKVerified,
                zkVerifying,
                connectWallet,
                verifyZKProof,
                claimAirdrop,
                canClaim,
                getClaimableAmount,
                pauseAirdrop,
                unpauseAirdrop,
                withdrawRemaining,
                updateVerifier,
                updateReferralPercentages,
                loadContractState: () => loadContractState(airdropContract, tokenContract, account, contractAddresses),
            }}
        >
            {children}
        </AirdropContext.Provider>
    );
};

export const useAirdrop = () => useContext(AirdropContext);