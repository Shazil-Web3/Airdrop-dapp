// AirdropContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x8235c7Ea3C7C4cfF859F119b450190eE797E1614"; // Update with actual address

// Import your ABI from a separate file
import contractABI from './RContext.jsx'; // Adjust path to your ABI file

const AirdropContext = createContext();

export const AirdropProvider = ({ children }) => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    const [hasClaimed, setHasClaimed] = useState(false);
    const [maxClaimPerUser, setMaxClaimPerUser] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [referralPercentages, setReferralPercentages] = useState([]);
    const [referrer, setReferrer] = useState(null);

    // Initialize provider, signer, and contract
    useEffect(() => {
        const init = async () => {
            if (!window.ethereum) {
                toast.error("Please install MetaMask or another Web3 wallet");
                return;
            }

            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                setProvider(provider);

                const signer = await provider.getSigner();
                setSigner(signer);
                const userAddress = await signer.getAddress();
                setAccount(userAddress);

                const contractInstance = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    contractABI,
                    signer
                );
                setContract(contractInstance);

                // Fetch contract state
                const paused = await contractInstance.paused();
                const maxClaim = await contractInstance.maxClaimPerUser();
                const start = await contractInstance.startTime();
                const end = await contractInstance.endTime();
                const claimed = await contractInstance.hasClaimed(userAddress);
                const refPercentages = await contractInstance.getReferralPercentages(); // Assuming a getter exists or array is public

                setIsPaused(paused);
                setMaxClaimPerUser(ethers.formatEther(maxClaim)); // Convert from wei
                setStartTime(Number(start));
                setEndTime(Number(end));
                setHasClaimed(claimed);
                setReferralPercentages(refPercentages.map(Number));
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
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners('accountsChanged');
            }
        };
    }, []);

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

    // Claim airdrop
    const claimAirdrop = async (referrerAddress, zkProof) => {
        if (!contract || !signer) {
            toast.error("Please connect your wallet");
            return;
        }

        try {
            const tx = await contract.claimAirdrop(referrerAddress || ethers.ZeroAddress, zkProof);
            await tx.wait();
            toast.success("Airdrop claimed successfully!");
            setHasClaimed(true);
        } catch (error) {
            console.error("Claim error:", error);
            toast.error(error.reason || "Failed to claim airdrop");
        }
    };

    // Check if user can claim
    const canClaim = () => {
        const now = Math.floor(Date.now() / 1000);
        return !isPaused && !hasClaimed && now >= startTime && now <= endTime;
    };

    // Admin: Pause contract
    const pauseAirdrop = async () => {
        if (!contract || !signer) {
            toast.error("Please connect your wallet");
            return;
        }

        try {
            const tx = await contract.pause();
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
        if (!contract || !signer) {
            toast.error("Please connect your wallet");
            return;
        }

        try {
            const tx = await contract.unpause();
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
        if (!contract || !signer) {
            toast.error("Please connect your wallet");
            return;
        }

        try {
            const tx = await contract.withdrawRemaining();
            await tx.wait();
            toast.success("Remaining tokens withdrawn successfully");
        } catch (error) {
            console.error("Withdraw error:", error);
            toast.error(error.reason || "Failed to withdraw tokens");
        }
    };

    // Admin: Update verifier
    const updateVerifier = async (newVerifierAddress) => {
        if (!contract || !signer) {
            toast.error("Please connect your wallet");
            return;
        }

        try {
            const tx = await contract.updateVerifier(newVerifierAddress);
            await tx.wait();
            toast.success("Verifier updated successfully");
        } catch (error) {
            console.error("Update verifier error:", error);
            toast.error(error.reason || "Failed to update verifier");
        }
    };

    // Admin: Update referral percentages
    const updateReferralPercentages = async (newPercentages) => {
        if (!contract || !signer) {
            toast.error("Please connect your wallet");
            return;
        }

        try {
            const tx = await contract.updateReferralPercentages(newPercentages);
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
                connectWallet,
                claimAirdrop,
                canClaim,
                pauseAirdrop,
                unpauseAirdrop,
                withdrawRemaining,
                updateVerifier,
                updateReferralPercentages,
            }}
        >
            {children}
        </AirdropContext.Provider>
    );
};

export const useAirdrop = () => useContext(AirdropContext);