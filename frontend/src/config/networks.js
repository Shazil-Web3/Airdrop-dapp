// Network configuration for the Hivox Airdrop project

export const NETWORKS = {
  SEPOLIA: {
    id: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY', // Replace with your Infura key
    explorer: 'https://sepolia.etherscan.io',
    chainId: '0xaa36a7', // 11155111 in hex
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'SEP',
      decimals: 18
    }
  },
  MAINNET: {
    id: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY', // Replace with your Infura key
    explorer: 'https://etherscan.io',
    chainId: '0x1',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  SEPOLIA: {
    AIRDROP_CONTRACT: "0x8235c7Ea3C7C4cfF859F119b450190eE797E1614",
    TOKEN_CONTRACT: "0xC9baEB94eEF9D702291936bfAcFB601A1A6eFcB5",
    VERIFIER_CONTRACT: "0x0000000000000000000000000000000000000000" // Zero address for now
  },
  MAINNET: {
    AIRDROP_CONTRACT: "0x0000000000000000000000000000000000000000", // Not deployed yet
    TOKEN_CONTRACT: "0x0000000000000000000000000000000000000000", // Not deployed yet
    VERIFIER_CONTRACT: "0x0000000000000000000000000000000000000000" // Not deployed yet
  }
};

// ZK Proof configuration
export const ZK_CONFIG = {
  // Mock ZK proof settings for testing
  MOCK_PROOF_ENABLED: true,
  PROOF_CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_PROOF_SIZE: 1024, // bytes
  
  // Real ZK proof settings (for production)
  REAL_PROOF_ENABLED: false,
  PROVER_URL: 'https://your-zk-prover.com',
  CIRCUIT_ID: 'hivox_airdrop_v1'
};

// Airdrop configuration
export const AIRDROP_CONFIG = {
  MAX_CLAIM_PER_USER: 1000, // tokens
  REFERRAL_PERCENTAGES: [10, 5, 2], // 3-level system: 10%, 5%, 2%
  MIN_REFERRAL_REWARD: 1, // minimum tokens for referral reward
  MAX_REFERRAL_DEPTH: 3, // maximum referral levels
  
  // Time settings (in seconds)
  DEFAULT_START_TIME: Math.floor(Date.now() / 1000), // Now
  DEFAULT_END_TIME: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year from now
  
  // Gas settings
  CLAIM_GAS_LIMIT: 300000, // gas limit for claim transaction
  ESTIMATED_GAS_PRICE: 20000000000 // 20 gwei in wei
};

// UI Configuration
export const UI_CONFIG = {
  REFRESH_INTERVAL: 30000, // 30 seconds
  TOAST_DURATION: 5000, // 5 seconds
  MAX_DISPLAY_ACTIVITIES: 10,
  MAX_DISPLAY_REFERRALS: 20
};

// Get current network configuration
export const getCurrentNetwork = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    const chainId = window.ethereum.chainId;
    if (chainId === NETWORKS.SEPOLIA.chainId) {
      return NETWORKS.SEPOLIA;
    } else if (chainId === NETWORKS.MAINNET.chainId) {
      return NETWORKS.MAINNET;
    }
  }
  return NETWORKS.SEPOLIA; // Default to Sepolia
};

// Get contract addresses for current network
export const getContractAddresses = () => {
  const network = getCurrentNetwork();
  return CONTRACT_ADDRESSES[network.name.toUpperCase()] || CONTRACT_ADDRESSES.SEPOLIA;
};

// Check if current network is supported
export const isNetworkSupported = (chainId) => {
  return Object.values(NETWORKS).some(network => network.chainId === chainId);
};

// Get network by chain ID
export const getNetworkByChainId = (chainId) => {
  return Object.values(NETWORKS).find(network => network.chainId === chainId);
}; 