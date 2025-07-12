// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISysmoVerifier {
    function verifyProof(address user, bytes calldata zkProof) external view returns (bool);
}

contract HivoxAirdrop is Ownable {
    IERC20 public hivxToken;
    ISysmoVerifier public verifier;

    uint256 public startTime;
    uint256 public endTime;
    uint256 public maxClaimPerUser;
    bool public paused;

    mapping(address => bool) public hasClaimed;
    mapping(address => address) public referrerOf;
    mapping(address => address[]) public referredUsers;

    uint256[] public referralPercentages = [10, 5, 2]; // 3-level system

    event TokensClaimed(address indexed user, address indexed referrer, uint256 amount);
    event ReferralReward(address indexed referrer, uint256 level, uint256 reward);

    constructor(
        address _token,
        address _verifier,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxClaimPerUser
    ) {
        hivxToken = IERC20(_token);
        verifier = ISysmoVerifier(_verifier);
        startTime = _startTime;
        endTime = _endTime;
        maxClaimPerUser = _maxClaimPerUser;
    }

    modifier whenNotPaused() {
        require(!paused, "Airdrop is paused");
        _;
    }

    function claimAirdrop(address _referrer, bytes calldata zkProof) external whenNotPaused {
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Outside claim period");
        require(!hasClaimed[msg.sender], "Already claimed");
        require(verifier.verifyProof(msg.sender, zkProof), "ZK Proof failed");

        hasClaimed[msg.sender] = true;

        if (_referrer != address(0) && _referrer != msg.sender && referrerOf[msg.sender] == address(0)) {
            referrerOf[msg.sender] = _referrer;
            referredUsers[_referrer].push(msg.sender);
        }

        uint256 amount = maxClaimPerUser;
        require(hivxToken.transfer(msg.sender, amount), "Token transfer failed");

        emit TokensClaimed(msg.sender, _referrer, amount);

        // Multi-level referral reward
        address current = referrerOf[msg.sender];
        for (uint256 i = 0; i < referralPercentages.length && current != address(0); i++) {
            uint256 reward = (amount * referralPercentages[i]) / 100;
            hivxToken.transfer(current, reward);
            emit ReferralReward(current, i + 1, reward);
            current = referrerOf[current]; // Go up one level
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
        hivxToken.transfer(owner(), balance);
    }

    function updateVerifier(address _verifier) external onlyOwner {
        verifier = ISysmoVerifier(_verifier);
    }

    function updateReferralPercentages(uint256[] calldata _percentages) external onlyOwner {
        referralPercentages = _percentages;
    }
}
