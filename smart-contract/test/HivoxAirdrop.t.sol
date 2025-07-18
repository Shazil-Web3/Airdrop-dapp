// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Airdrop.sol";
import "../src/ERC20.sol";

/**
 * @title HivoxAirdropTest
 * @notice Test suite for the HivoxAirdrop contract, covering initialization, claiming, referrals, admin controls, and edge cases.
 * @dev Uses Foundry's forge-std/Test for assertions and test setup.
 */
contract HivoxAirdropTest is Test {
    MockToken public token;
    HivoxAirdrop public airdrop;
    
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public user3 = address(0x4);
    address public referrer1 = address(0x5);
    address public referrer2 = address(0x6);
    
    uint256 public maxClaim = 100 * 10**18;
    uint256 public endTime;

    /**
     * @notice Sets up the test environment: deploys token, airdrop, and funds contract.
     */
    function setUp() public {
        vm.prank(owner);
        token = new MockToken();
        
        endTime = block.timestamp + 7 days;
        
        vm.prank(owner);
        airdrop = new HivoxAirdrop(
            address(token),
            endTime,
            maxClaim,
            owner
        );
        
        // Fund airdrop contract
        vm.prank(owner);
        token.transfer(address(airdrop), 500_000 * 10**18);
    }

    /**
     * @notice Tests contract initialization and state variables.
     */
    function testInitialization() public {
        assertEq(address(airdrop.hivxToken()), address(token));
        assertEq(airdrop.endTime(), endTime);
        assertEq(airdrop.maxClaimPerUser(), maxClaim);
        assertEq(airdrop.owner(), owner);
        assertFalse(airdrop.paused());
        
        // Check referral percentages
        assertEq(airdrop.referralPercentages(0), 10);
        assertEq(airdrop.referralPercentages(1), 5);
        assertEq(airdrop.referralPercentages(2), 2);
    }

    /**
     * @notice Tests claiming airdrop without a referral.
     */
    function testClaimAirdropNoReferral() public {
        uint256 userBalanceBefore = token.balanceOf(user1);
        uint256 contractBalanceBefore = token.balanceOf(address(airdrop));
        
        vm.prank(user1);
        airdrop.claimAirdrop(address(0));
        
        assertTrue(airdrop.hasClaimed(user1));
        assertEq(token.balanceOf(user1), userBalanceBefore + maxClaim);
        assertEq(token.balanceOf(address(airdrop)), contractBalanceBefore - maxClaim);
    }

    /**
     * @notice Tests claiming airdrop with a referral and checks reward distribution.
     */
    function testClaimAirdropWithReferral() public {
        uint256 referrerBalanceBefore = token.balanceOf(referrer1);
        
        vm.prank(user1);
        airdrop.claimAirdrop(referrer1);
        
        // Check referral relationship
        assertEq(airdrop.referrerOf(user1), referrer1);
        
        // Check referral reward (10% of maxClaim)
        uint256 expectedReward = (maxClaim * 10) / 100;
        assertEq(token.balanceOf(referrer1), referrerBalanceBefore + expectedReward);
    }

    /**
     * @notice Tests multi-level referral reward distribution.
     */
    function testMultiLevelReferral() public {
        // Setup referral chain: user1 -> referrer1 -> referrer2
        vm.prank(user1);
        airdrop.claimAirdrop(referrer1);
        
        vm.prank(referrer1);
        airdrop.claimAirdrop(referrer2);
        
        // Claim with user2 referring to user1 to trigger multi-level
        uint256 referrer1Balance = token.balanceOf(referrer1);
        uint256 referrer2Balance = token.balanceOf(referrer2);
        
        vm.prank(user2);
        airdrop.claimAirdrop(user1);
        
        // Check rewards:
        // - user1 (level1) gets 10%
        // - referrer1 (level2) gets 5%
        // - referrer2 (level3) gets 2%
        assertEq(
            token.balanceOf(referrer1),
            referrer1Balance + (maxClaim * 5) / 100
        );
        assertEq(
            token.balanceOf(referrer2),
            referrer2Balance + (maxClaim * 2) / 100
        );
    }

    /**
     * @notice Tests that claiming is not allowed after the end time.
     */
    function testCannotClaimAfterEndTime() public {
        vm.warp(endTime + 1);
        
        vm.expectRevert("Airdrop has ended");
        vm.prank(user1);
        airdrop.claimAirdrop(address(0));
    }

    /**
     * @notice Tests that a user cannot claim more than once.
     */
    function testCannotClaimTwice() public {
        vm.prank(user1);
        airdrop.claimAirdrop(address(0));
        
        vm.expectRevert("Already claimed");
        vm.prank(user1);
        airdrop.claimAirdrop(address(0));
    }

    /**
     * @notice Tests pause and unpause functionality and access control.
     */
    function testPauseUnpause() public {
        vm.prank(owner);
        airdrop.pause();
        assertTrue(airdrop.paused());
        
        vm.expectRevert("Airdrop is paused");
        vm.prank(user1);
        airdrop.claimAirdrop(address(0));
        
        vm.prank(owner);
        airdrop.unpause();
        assertFalse(airdrop.paused());
        
        // Should work after unpause
        vm.prank(user1);
        airdrop.claimAirdrop(address(0));
    }

    /**
     * @notice Tests that only the owner can pause the contract.
     */
    function testOnlyOwnerCanPause() public {
        vm.expectRevert();
        vm.prank(user1);
        airdrop.pause();
    }

    /**
     * @notice Tests withdrawing remaining tokens by the owner.
     */
    function testWithdrawRemaining() public {
        uint256 contractBalance = token.balanceOf(address(airdrop));
        uint256 ownerBalanceBefore = token.balanceOf(owner);
        
        vm.prank(owner);
        airdrop.withdrawRemaining();
        
        assertEq(token.balanceOf(owner), ownerBalanceBefore + contractBalance);
        assertEq(token.balanceOf(address(airdrop)), 0);
    }

    /**
     * @notice Tests updating referral percentages by the owner.
     */
    function testUpdateReferralPercentages() public {
        uint256[] memory newPercentages = new uint256[](3);
        newPercentages[0] = 15;
        newPercentages[1] = 7;
        newPercentages[2] = 3;
        
        vm.prank(owner);
        airdrop.updateReferralPercentages(newPercentages);
        
        assertEq(airdrop.referralPercentages(0), 15);
        assertEq(airdrop.referralPercentages(1), 7);
        assertEq(airdrop.referralPercentages(2), 3);
    }

    /**
     * @notice Tests the getContractTokenBalance view function and access control.
     */
    function testGetContractTokenBalance() public {
        uint256 balance = token.balanceOf(address(airdrop));
        
        vm.prank(owner);
        assertEq(airdrop.getContractTokenBalance(), balance);
        
        // Non-owner shouldn't be able to call
        vm.expectRevert();
        vm.prank(user1);
        airdrop.getContractTokenBalance();
    }
}