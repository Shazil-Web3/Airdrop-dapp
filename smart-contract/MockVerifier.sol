// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockVerifier {
    // Mock verifier that accepts any proof for testing
    // This bypasses ZK verification for development when Sismo is down
    function verifyProof(bytes memory zkProof) external pure returns (address user) {
        // For testing, always return a mock user address
        // In production, this would verify the actual ZK proof
        return 0x1234567890123456789012345678901234567890;
    }
} 