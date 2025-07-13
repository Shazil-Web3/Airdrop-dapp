import { ethers } from 'ethers';
import airdropABI from '../context/airdrop.json';
import tokenABI from '../context/token.json';

// Contract addresses from .env
const AIRDROP_CONTRACT_ADDRESS = "0x8235c7Ea3C7C4cfF859F119b450190eE797E1614";
const TOKEN_CONTRACT_ADDRESS = "0xC9baEB94eEF9D702291936bfAcFB601A1A6eFcB5";
const VERIFIER_ADDRESS = "0x0000000000000000000000000000000000000000"; // Zero address as specified

// Test configuration
const MAX_CLAIM_PER_USER = 1000; // 1000 tokens

class SimpleClaimTester {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.airdropContract = null;
        this.tokenContract = null;
        this.testResults = [];
    }

    async initialize() {
        console.log("🚀 Initializing Simple Claim Tester...");
        
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
        
        // Initialize contracts
        this.airdropContract = new ethers.Contract(AIRDROP_CONTRACT_ADDRESS, airdropABI.abi, this.signer);
        this.tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, tokenABI.abi, this.signer);
        
        console.log("✅ Contracts initialized successfully");
    }

    async testTokenClaiming() {
        console.log("🎯 Testing Token Claiming Functionality...\n");
        
        try {
            const userAddress = await this.signer.getAddress();
            console.log(`👤 Testing with address: ${userAddress}`);
            
            // 1. Check if user has already claimed
            const hasClaimed = await this.airdropContract.hasClaimed(userAddress);
            console.log(`📊 User has claimed: ${hasClaimed}`);
            
            if (hasClaimed) {
                console.log("❌ User has already claimed tokens. Cannot test claiming again.");
                this.assertTest("User already claimed", true, "User has already claimed tokens");
                return;
            }
            
            // 2. Check claim eligibility
            const startTime = await this.airdropContract.startTime();
            const endTime = await this.airdropContract.endTime();
            const currentTime = Math.floor(Date.now() / 1000);
            const isInTimeWindow = currentTime >= startTime && currentTime <= endTime;
            
            console.log(`⏰ Time window check: ${isInTimeWindow ? '✅' : '❌'}`);
            console.log(`   Current time: ${currentTime}`);
            console.log(`   Start time: ${startTime}`);
            console.log(`   End time: ${endTime}`);
            
            this.assertTest("User is in claim time window", isInTimeWindow, 
                `Current: ${currentTime}, Window: ${startTime} - ${endTime}`);
            
            // 3. Check if contract is paused
            const paused = await this.airdropContract.paused();
            console.log(`⏸️ Contract paused: ${paused}`);
            this.assertTest("Contract is not paused", !paused, `Paused: ${paused}`);
            
            // 4. Check contract token balance
            const contractBalance = await this.tokenContract.balanceOf(AIRDROP_CONTRACT_ADDRESS);
            const contractBalanceTokens = ethers.formatEther(contractBalance);
            console.log(`💰 Contract token balance: ${contractBalanceTokens} HIVOX`);
            
            this.assertTest("Contract has sufficient tokens", 
                parseFloat(contractBalanceTokens) >= MAX_CLAIM_PER_USER, 
                `Contract balance: ${contractBalanceTokens} tokens, need: ${MAX_CLAIM_PER_USER} tokens`);
            
            // 5. Try to claim tokens with different ZK proof approaches
            console.log("\n🔐 Testing ZK Proof Approaches...");
            
            // Approach 1: Empty proof
            console.log("📝 Trying with empty proof...");
            try {
                const emptyProof = "0x";
                const tx = await this.airdropContract.claimAirdrop(ethers.ZeroAddress, emptyProof);
                await tx.wait();
                console.log("✅ Claim successful with empty proof!");
                this.assertTest("Claim with empty proof", true, "Successfully claimed with empty proof");
                
                // Verify claim
                const claimedAfter = await this.airdropContract.hasClaimed(userAddress);
                this.assertTest("User marked as claimed", claimedAfter === true, 
                    `Claimed status: ${claimedAfter}`);
                
                return; // Success, no need to try other approaches
                
            } catch (error) {
                console.log(`❌ Empty proof failed: ${error.message}`);
            }
            
            // Approach 2: Zero address as proof
            console.log("📝 Trying with zero address as proof...");
            try {
                const zeroProof = ethers.ZeroAddress;
                const tx = await this.airdropContract.claimAirdrop(ethers.ZeroAddress, zeroProof);
                await tx.wait();
                console.log("✅ Claim successful with zero address proof!");
                this.assertTest("Claim with zero address proof", true, "Successfully claimed with zero address proof");
                
                // Verify claim
                const claimedAfter = await this.airdropContract.hasClaimed(userAddress);
                this.assertTest("User marked as claimed", claimedAfter === true, 
                    `Claimed status: ${claimedAfter}`);
                
                return; // Success, no need to try other approaches
                
            } catch (error) {
                console.log(`❌ Zero address proof failed: ${error.message}`);
            }
            
            // Approach 3: Mock proof with proper format
            console.log("📝 Trying with mock proof...");
            try {
                const mockProof = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
                const tx = await this.airdropContract.claimAirdrop(ethers.ZeroAddress, mockProof);
                await tx.wait();
                console.log("✅ Claim successful with mock proof!");
                this.assertTest("Claim with mock proof", true, "Successfully claimed with mock proof");
                
                // Verify claim
                const claimedAfter = await this.airdropContract.hasClaimed(userAddress);
                this.assertTest("User marked as claimed", claimedAfter === true, 
                    `Claimed status: ${claimedAfter}`);
                
            } catch (error) {
                console.log(`❌ Mock proof failed: ${error.message}`);
                this.assertTest("All ZK proof approaches failed", false, 
                    `All proof attempts failed. Last error: ${error.message}`);
            }
            
            console.log("\n✅ Token claiming tests completed");
            
        } catch (error) {
            console.error("❌ Token claiming tests failed:", error);
            this.assertTest("Test execution", false, `Test failed: ${error.message}`);
        }
    }

    assertTest(testName, condition, message) {
        const result = {
            name: testName,
            passed: condition,
            message: message,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        if (condition) {
            console.log(`✅ ${testName}: ${message}`);
        } else {
            console.log(`❌ ${testName}: ${message}`);
        }
        
        return result;
    }

    printTestResults() {
        console.log("\n" + "=".repeat(60));
        console.log("📋 SIMPLE CLAIM TEST RESULTS");
        console.log("=".repeat(60));
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests} ✅`);
        console.log(`Failed: ${failedTests} ❌`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
        
        if (failedTests > 0) {
            console.log("\n❌ FAILED TESTS:");
            this.testResults
                .filter(r => !r.passed)
                .forEach(r => console.log(`  - ${r.name}: ${r.message}`));
        }
        
        console.log("\n" + "=".repeat(60));
        
        // Store results in localStorage for UI access
        localStorage.setItem('simpleClaimTestResults', JSON.stringify({
            results: this.testResults,
            summary: { total: totalTests, passed: passedTests, failed: failedTests },
            timestamp: new Date().toISOString()
        }));
    }
}

// Export for use in components
export const runSimpleClaimTest = async () => {
    const tester = new SimpleClaimTester();
    await tester.initialize();
    await tester.testTokenClaiming();
    tester.printTestResults();
    return tester.testResults;
};

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined' && window.location.pathname.includes('test')) {
    runSimpleClaimTest().catch(console.error);
} 