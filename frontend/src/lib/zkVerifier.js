import { SismoConnect, SismoConnectVerifiedResult } from "@sismo-core/sismo-connect-react";
import { sismoConfig, validateSismoConfig } from './sismoConfig.js';

// Real Sismo ZK Verification
export class ZKVerifier {
    constructor() {
        this.proofCache = new Map();
        // Validate configuration on initialization
        validateSismoConfig();
    }

    // Get Sismo Connect instance with proper config
    getSismoConnect() {
        return SismoConnect(sismoConfig);
    }

    // Generate real Sismo proof for airdrop claim
    async generateSismoProof(userAddress, claimAmount) {
        try {
            console.log("🔐 Generating real Sismo ZK proof for:", userAddress);
            
            const sismoConnect = this.getSismoConnect();
            
            // Request proof from Sismo
            const result = await sismoConnect.request({
                // Define what proof you need (e.g., user has certain credentials)
                auths: [
                    {
                        authType: "evm",
                        userId: userAddress
                    }
                ],
                // Optional: request specific data groups (you can customize this based on your needs)
                claims: [
                    {
                        groupId: "0x1234567890123456789012345678901234567890", // Replace with your data group
                        claimType: "gte",
                        value: 1
                    }
                ],
                // Optional: request specific data
                signature: {
                    message: `Claim ${claimAmount} HIVOX tokens`,
                    isSelectableByUser: true
                }
            });

            console.log("✅ Sismo proof generated successfully");
            return result.proofs[0]; // Return the first proof
            
        } catch (error) {
            console.error("❌ Error generating Sismo proof:", error);
            throw new Error("Failed to generate Sismo proof");
        }
    }

    // Verify Sismo proof
    async verifySismoProof(proof, userAddress) {
        try {
            console.log("🔍 Verifying Sismo proof...");
            
            const sismoConnect = this.getSismoConnect();
            
            // Verify the proof using Sismo's verification
            const verifiedResult = await sismoConnect.verify(proof, {
                auths: [
                    {
                        authType: "evm",
                        userId: userAddress
                    }
                ]
            });

            console.log("✅ Sismo proof verified successfully");
            return verifiedResult.isValid;
            
        } catch (error) {
            console.error("❌ Error verifying Sismo proof:", error);
            return false;
        }
    }

    // Generate proof for airdrop claim (main function)
    async generateClaimProof(userAddress, claimAmount, referrerAddress = null) {
        const cacheKey = `${userAddress}-${claimAmount}`;
        
        // Check cache first
        if (this.proofCache.has(cacheKey)) {
            return this.proofCache.get(cacheKey);
        }

        // Generate new Sismo proof
        const proof = await this.generateSismoProof(userAddress, claimAmount);
        
        // Cache the proof
        this.proofCache.set(cacheKey, proof);
        
        return proof;
    }

    // Clear proof cache
    clearCache() {
        this.proofCache.clear();
    }
}

// Export singleton instance
export const zkVerifier = new ZKVerifier();

// Helper function to generate proof for contract
export const generateZKProof = async (userAddress, claimAmount, referrerAddress = null) => {
    return await zkVerifier.generateClaimProof(userAddress, claimAmount, referrerAddress);
};

// Helper function to verify proof
export const verifyZKProof = async (proof, userAddress) => {
    return await zkVerifier.verifySismoProof(proof, userAddress);
}; 