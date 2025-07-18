// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title HivoxAirdrop
 * @notice This contract manages the Hivox token airdrop with multi-level referral rewards.
 * @dev The contract allows users to claim a fixed amount of tokens, supports up to 3 levels of referral rewards,
 *      and provides admin controls for pausing, unpausing, and withdrawing remaining tokens.
 *      Referral relationships are tracked on-chain, and rewards are distributed automatically.
 */
contract HivoxAirdrop is Ownable {
    /// @notice The ERC20 token being airdropped
    IERC20 public hivxToken;

    /// @notice The timestamp after which claiming is no longer allowed
    uint256 public endTime;
    /// @notice The maximum amount of tokens a user can claim
    uint256 public maxClaimPerUser;
    /// @notice Whether the airdrop is currently paused
    bool public paused;

    /// @notice Tracks whether an address has already claimed the airdrop
    mapping(address => bool) public hasClaimed;
    /// @notice Maps a user to their referrer (if any)
    mapping(address => address) public referrerOf;
    /// @notice Maps a referrer to the list of users they have referred
    mapping(address => address[]) public referredUsers;

    /// @notice Referral reward percentages for each level (e.g., [10, 5, 2] for 10%, 5%, 2%)
    uint256[] public referralPercentages = [10, 5, 2]; // 3-level referral system

    /// @notice Emitted when a user claims tokens
    /// @param user The address of the user who claimed
    /// @param referrer The address of the user's referrer (if any)
    /// @param amount The amount of tokens claimed
    event TokensClaimed(address indexed user, address indexed referrer, uint256 amount);
    /// @notice Emitted when a referral reward is distributed
    /// @param referrer The address receiving the reward
    /// @param level The referral level (1, 2, or 3)
    /// @param reward The amount of tokens rewarded
    event ReferralReward(address indexed referrer, uint256 level, uint256 reward);

    /**
     * @notice Deploy the HivoxAirdrop contract
     * @param _token The address of the ERC20 token to airdrop
     * @param _endTime The timestamp after which claiming is not allowed
     * @param _maxClaimPerUser The maximum amount of tokens a user can claim
     * @param _owner The address that will be the contract owner
     */
    constructor(
        address _token,
        uint256 _endTime,
        uint256 _maxClaimPerUser,
        address _owner
    ) Ownable(_owner) {
        hivxToken = IERC20(_token);
        endTime = _endTime;
        maxClaimPerUser = _maxClaimPerUser;
    }

    /**
     * @notice Modifier to restrict actions when the contract is paused
     */
    modifier whenNotPaused() {
        require(!paused, "Airdrop is paused");
        _;
    }

    /**
     * @notice Claim the airdrop tokens, optionally specifying a referrer
     * @dev Distributes multi-level referral rewards if applicable. Each user can only claim once.
     * @param _referrer The address of the referrer (can be address(0) if none)
     *
     * Requirements:
     * - The airdrop must not be paused.
     * - The current time must be before endTime.
     * - The caller must not have already claimed.
     * - The contract must have enough tokens to fulfill the claim and rewards.
     */
    function claimAirdrop(address _referrer) external whenNotPaused {
        require(block.timestamp <= endTime, "Airdrop has ended");
        require(!hasClaimed[msg.sender], "Already claimed");

        hasClaimed[msg.sender] = true;

        // Set referrer if provided and valid
        if (
            _referrer != address(0) &&
            _referrer != msg.sender &&
            referrerOf[msg.sender] == address(0)
        ) {
            referrerOf[msg.sender] = _referrer;
            referredUsers[_referrer].push(msg.sender);
        }

        uint256 amount = maxClaimPerUser;
        require(hivxToken.transfer(msg.sender, amount), "Token transfer failed");

        emit TokensClaimed(msg.sender, _referrer, amount);

        // Multi-level referral reward distribution
        address current = referrerOf[msg.sender];
        for (uint256 i = 0; i < referralPercentages.length && current != address(0); i++) {
            uint256 reward = (amount * referralPercentages[i]) / 100;
            require(hivxToken.transfer(current, reward), "Referral transfer failed");
            emit ReferralReward(current, i + 1, reward);
            current = referrerOf[current]; // Move up one referral level
        }
    }

    // =====================
    // Admin Controls
    // =====================

    /**
     * @notice Pause the airdrop (admin only)
     * @dev Prevents users from claiming until unpaused
     */
    function pause() external onlyOwner {
        paused = true;
    }

    /**
     * @notice Unpause the airdrop (admin only)
     * @dev Allows users to claim again
     */
    function unpause() external onlyOwner {
        paused = false;
    }

    /**
     * @notice Withdraw all remaining tokens from the contract (admin only)
     * @dev Transfers the remaining token balance to the owner
     */
    function withdrawRemaining() external onlyOwner {
        uint256 balance = hivxToken.balanceOf(address(this));
        require(hivxToken.transfer(owner(), balance), "Withdraw failed");
    }

    /**
     * @notice Update the referral reward percentages (admin only)
     * @dev Allows the owner to change the multi-level referral reward structure
     * @param _percentages The new percentages for each referral level
     */
    function updateReferralPercentages(uint256[] calldata _percentages) external onlyOwner {
        referralPercentages = _percentages;
    }

    /**
     * @notice Get the current token balance of the airdrop contract (admin only)
     * @dev Only callable by the owner
     * @return The token balance of the contract
     */
    function getContractTokenBalance() external view onlyOwner returns (uint256) {
        return hivxToken.balanceOf(address(this));
    }
}
