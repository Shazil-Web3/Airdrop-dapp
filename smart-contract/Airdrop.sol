// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract HivoxAirdrop is Ownable {
    IERC20 public hivxToken;

    uint256 public endTime;
    uint256 public maxClaimPerUser;
    bool public paused;

    mapping(address => bool) public hasClaimed;
    mapping(address => address) public referrerOf;
    mapping(address => address[]) public referredUsers;

    uint256[] public referralPercentages = [10, 5, 2]; // 3-level referral system

    event TokensClaimed(address indexed user, address indexed referrer, uint256 amount);
    event ReferralReward(address indexed referrer, uint256 level, uint256 reward);

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

    modifier whenNotPaused() {
        require(!paused, "Airdrop is paused");
        _;
    }

    function claimAirdrop(address _referrer) external whenNotPaused {
        require(block.timestamp <= endTime, "Airdrop has ended");
        require(!hasClaimed[msg.sender], "Already claimed");

        hasClaimed[msg.sender] = true;

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

    // Admin Controls
    function pause() external onlyOwner {
        paused = true;
    }

    function unpause() external onlyOwner {
        paused = false;
    }

    function withdrawRemaining() external onlyOwner {
        uint256 balance = hivxToken.balanceOf(address(this));
        require(hivxToken.transfer(owner(), balance), "Withdraw failed");
    }

    function updateReferralPercentages(uint256[] calldata _percentages) external onlyOwner {
        referralPercentages = _percentages;
    }

    /// ✅ View how many tokens are currently in this airdrop contract
    function getContractTokenBalance() external view onlyOwner returns (uint256) {
        return hivxToken.balanceOf(address(this));
    }
}
