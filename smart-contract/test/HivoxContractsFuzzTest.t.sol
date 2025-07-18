// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Airdrop.sol";
import "../src/ERC20.sol";

/**
 * @title HivoxContractsFuzzTest
 * @notice Fuzz and property-based tests for HivoxAirdrop and MockToken contracts.
 * @dev Uses Foundry's forge-std/Test for fuzzing and assertions. Covers minting, claiming, referrals, admin, and edge cases.
 */
contract HivoxContractsFuzzTest is Test {
    MockToken public token;
    HivoxAirdrop public airdrop;
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public user3 = address(0x4);
    uint256 public maxClaim = 100 * 10**18; // 100 tokens
    uint256 public endTime;

    /**
     * @notice Sets up the test environment: deploys token, airdrop, and funds contract.
     */
    function setUp() public {
        vm.prank(owner);
        token = new MockToken();

        endTime = block.timestamp + 7 days;

        vm.prank(owner);
        airdrop = new HivoxAirdrop(address(token), endTime, maxClaim, owner);

        vm.prank(owner);
        token.transfer(address(airdrop), 500_000 * 10**18);
    }

    /**
     * @notice Fuzz test for minting tokens to arbitrary addresses and amounts.
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint (bounded)
     */
    function testFuzz_Mint(address to, uint256 amount) public {
        vm.assume(to != address(0));
        amount = bound(amount, 0, 10_000_000 * 10**18);

        uint256 balanceBefore = token.balanceOf(to);
        vm.prank(owner);
        token.mint(to, amount);

        assertEq(token.balanceOf(to), balanceBefore + amount);
        assertEq(token.totalSupply(), 1_000_000 * 10**18 + amount);
    }

    /**
     * @notice Fuzz test for claiming airdrop with various referrers and times.
     * @param referrer The address to use as referrer
     * @param time The timestamp to warp to for the claim
     */
    function testFuzz_ClaimAirdrop(address referrer, uint256 time) public {
        time = bound(time, block.timestamp, endTime + 1 days);
        vm.assume(referrer != address(0));
        vm.assume(referrer != user1);

        vm.warp(time);

        if (time > endTime) {
            vm.expectRevert("Airdrop has ended");
            vm.prank(user1);
            airdrop.claimAirdrop(referrer);
            return;
        }

        uint256 contractBalance = token.balanceOf(address(airdrop));
        vm.assume(contractBalance >= maxClaim);

        vm.prank(user1);
        airdrop.claimAirdrop(referrer);

        assertEq(token.balanceOf(user1), maxClaim);
        assertTrue(airdrop.hasClaimed(user1));
        assertEq(airdrop.referrerOf(user1), referrer);

        vm.expectRevert("Already claimed");
        vm.prank(user1);
        airdrop.claimAirdrop(referrer);
    }

    /**
     * @notice Fuzz test for multi-user referral reward distribution.
     * @param referrer1 The first referrer address
     * @param referrer2 The second referrer address
     * @param time The timestamp to warp to for the claims
     */
    function testFuzz_ReferralRewards(address referrer1, address referrer2, uint256 time) public {
        // Skip invalid addresses
        vm.assume(referrer1 != address(0));
        vm.assume(referrer2 != address(0));
        vm.assume(referrer1 != referrer2);
        vm.assume(referrer1 != user1);
        vm.assume(referrer1 != user2);
        vm.assume(referrer2 != user1);
        vm.assume(referrer2 != user2);

        time = bound(time, block.timestamp, endTime);
        vm.warp(time);

        // Get initial balances
        uint256 initialBalance1 = token.balanceOf(referrer1);
        uint256 initialBalance2 = token.balanceOf(referrer2);

        // Ensure enough tokens in contract
        uint256 contractBalance = token.balanceOf(address(airdrop));
        if (contractBalance < maxClaim * 3) {
            vm.prank(owner);
            token.mint(address(airdrop), maxClaim * 3 - contractBalance);
        }

        // First claim with referrer1
        vm.prank(user1);
        airdrop.claimAirdrop(referrer1);
        
        // Second claim with referrer2
        vm.prank(user2);
        airdrop.claimAirdrop(referrer2);

        // Calculate expected rewards (10% of maxClaim)
        uint256 expectedReward = (maxClaim * 10) / 100;
        
        // Check only the reward amounts
        assertEq(token.balanceOf(referrer1) - initialBalance1, expectedReward);
        assertEq(token.balanceOf(referrer2) - initialBalance2, expectedReward);
    }

    /**
     * @notice Tests updating referral percentages and access control.
     */
    function test_UpdateReferralPercentages() public {
        // Create dynamic array with 3 elements
        uint256[] memory percentages = new uint256[](3);
        percentages[0] = 10;
        percentages[1] = 5;
        percentages[2] = 2;

        vm.prank(owner);
        airdrop.updateReferralPercentages(percentages);

        assertEq(airdrop.referralPercentages(0), 10);
        assertEq(airdrop.referralPercentages(1), 5);
        assertEq(airdrop.referralPercentages(2), 2);

        vm.expectRevert();
        vm.prank(user1);
        airdrop.updateReferralPercentages(percentages);
    }

    /**
     * @notice Fuzz test for withdrawing remaining tokens by owner and non-owner.
     * @param caller The address attempting to withdraw
     */
    function testFuzz_WithdrawRemaining(address caller) public {
        uint256 contractBalance = token.balanceOf(address(airdrop));
        vm.assume(contractBalance > 0);

        if (caller != owner) {
            vm.expectRevert();
            vm.prank(caller);
            airdrop.withdrawRemaining();
            return;
        }

        uint256 ownerBalanceBefore = token.balanceOf(owner);
        vm.prank(owner);
        airdrop.withdrawRemaining();

        assertEq(token.balanceOf(owner), ownerBalanceBefore + contractBalance);
        assertEq(token.balanceOf(address(airdrop)), 0);
    }

    /**
     * @notice Fuzz test for pause/unpause admin controls and access control.
     * @param caller The address attempting to pause/unpause
     */
    function testFuzz_PauseUnpause(address caller) public {
        if (caller != owner) {
            vm.expectRevert();
            vm.prank(caller);
            airdrop.pause();
            return;
        }

        vm.prank(owner);
        airdrop.pause();
        assertTrue(airdrop.paused());

        vm.expectRevert("Airdrop is paused");
        vm.prank(user1);
        airdrop.claimAirdrop(address(0));

        vm.prank(owner);
        airdrop.unpause();
        assertFalse(airdrop.paused());

        if (caller != owner) {
            vm.expectRevert();
            vm.prank(caller);
            airdrop.unpause();
        }
    }

    /**
     * @notice Fuzz test for token/airdrop contract interaction and minting.
     * @param to The address to mint tokens to
     * @param mintAmount The amount of tokens to mint (bounded)
     */
    function testFuzz_TokenAirdropInteraction(address to, uint256 mintAmount) public {
        vm.assume(to != address(0));
        mintAmount = bound(mintAmount, maxClaim, 1_000_000 * 10**18);

        vm.prank(owner);
        token.mint(address(airdrop), mintAmount);

        assertEq(token.balanceOf(address(airdrop)), 500_000 * 10**18 + mintAmount);

        vm.prank(user1);
        airdrop.claimAirdrop(address(0));

        assertEq(token.balanceOf(user1), maxClaim);
    }
}