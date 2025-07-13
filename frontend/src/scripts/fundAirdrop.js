import { ethers } from 'ethers';
import tokenABI from '../context/token.json';

// Contract addresses
const TOKEN_CONTRACT_ADDRESS = "0xC9baEB94eEF9D702291936bfAcFB601A1A6eFcB5";
const AIRDROP_CONTRACT_ADDRESS = "0x8235c7Ea3C7C4cfF859F119b450190eE797E1614";

// Amount to fund (1000 tokens)
const FUND_AMOUNT = ethers.parseEther("1000"); // 1000 tokens in wei

class AirdropFunder {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.tokenContract = null;
    }

    async initialize() {
        console.log("🚀 Initializing Airdrop Funder...");
        
        // Check if MetaMask is available
        if (!window.ethereum) {
            throw new Error("MetaMask not found. Please install MetaMask.");
        }

        // Connect to provider
        this.provider = new ethers.BrowserProvider(window.ethereum);
        
        // Request accounts
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Get signer
        this.signer = await this.provider.getSigner();
        
        // Initialize token contract
        this.tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, tokenABI.abi, this.signer);
        
        console.log("✅ Token contract initialized successfully");
    }

    async checkBalances() {
        const userAddress = await this.signer.getAddress();
        
        console.log("\n💰 Checking Current Balances...");
        
        // Check user's token balance
        const userBalance = await this.tokenContract.balanceOf(userAddress);
        const userBalanceTokens = ethers.formatEther(userBalance);
        console.log(`👤 Your token balance: ${userBalanceTokens} HIVOX`);
        
        // Check airdrop contract's token balance
        const airdropBalance = await this.tokenContract.balanceOf(AIRDROP_CONTRACT_ADDRESS);
        const airdropBalanceTokens = ethers.formatEther(airdropBalance);
        console.log(`📦 Airdrop contract balance: ${airdropBalanceTokens} HIVOX`);
        
        return {
            userBalance: userBalanceTokens,
            airdropBalance: airdropBalanceTokens
        };
    }

    async fundAirdropContract() {
        console.log("\n🎯 Funding Airdrop Contract...");
        
        try {
            const userAddress = await this.signer.getAddress();
            
            // Check if user has enough tokens to transfer
            const userBalance = await this.tokenContract.balanceOf(userAddress);
            
            if (userBalance < FUND_AMOUNT) {
                console.log("❌ You don't have enough tokens to fund the airdrop contract.");
                console.log(`   You have: ${ethers.formatEther(userBalance)} HIVOX`);
                console.log(`   Need: ${ethers.formatEther(FUND_AMOUNT)} HIVOX`);
                
                // Try to mint tokens to user first
                console.log("\n🔄 Attempting to mint tokens to your address...");
                try {
                    const mintTx = await this.tokenContract.mint(userAddress, FUND_AMOUNT);
                    await mintTx.wait();
                    console.log("✅ Successfully minted tokens to your address!");
                } catch (mintError) {
                    console.log("❌ Failed to mint tokens. You may not have minting permissions.");
                    console.log(`   Error: ${mintError.message}`);
                    return false;
                }
            }
            
            // Transfer tokens to airdrop contract
            console.log(`📤 Transferring ${ethers.formatEther(FUND_AMOUNT)} HIVOX to airdrop contract...`);
            
            const transferTx = await this.tokenContract.transfer(AIRDROP_CONTRACT_ADDRESS, FUND_AMOUNT);
            await transferTx.wait();
            
            console.log("✅ Successfully funded airdrop contract!");
            
            // Check new balances
            await this.checkBalances();
            
            return true;
            
        } catch (error) {
            console.error("❌ Failed to fund airdrop contract:", error);
            return false;
        }
    }

    async mintTokensToAirdrop() {
        console.log("\n🎯 Minting Tokens Directly to Airdrop Contract...");
        
        try {
            console.log(`📤 Minting ${ethers.formatEther(FUND_AMOUNT)} HIVOX directly to airdrop contract...`);
            
            const mintTx = await this.tokenContract.mint(AIRDROP_CONTRACT_ADDRESS, FUND_AMOUNT);
            await mintTx.wait();
            
            console.log("✅ Successfully minted tokens to airdrop contract!");
            
            // Check new balances
            await this.checkBalances();
            
            return true;
            
        } catch (error) {
            console.error("❌ Failed to mint tokens to airdrop contract:", error);
            console.log("   This might be because you don't have minting permissions.");
            return false;
        }
    }
}

// Export functions for use in components
export const fundAirdropContract = async () => {
    const funder = new AirdropFunder();
    await funder.initialize();
    
    const balances = await funder.checkBalances();
    
    // Try minting directly to airdrop contract first
    const mintSuccess = await funder.mintTokensToAirdrop();
    
    if (!mintSuccess) {
        // If minting fails, try transferring from user
        console.log("\n🔄 Trying alternative method: transferring from your wallet...");
        await funder.fundAirdropContract();
    }
    
    return balances;
};

export const checkAirdropBalance = async () => {
    const funder = new AirdropFunder();
    await funder.initialize();
    return await funder.checkBalances();
};

// Auto-run if this file is executed directly
if (typeof window !== 'undefined' && window.location.pathname.includes('fund')) {
    fundAirdropContract().catch(console.error);
} 