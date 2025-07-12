const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'PORT'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  ETHEREUM_RPC_URL: process.env.ETHEREUM_RPC_URL,
  POLYGON_RPC_URL: process.env.POLYGON_RPC_URL,
  BSC_RPC_URL: process.env.BSC_RPC_URL,
  AIRDROP_CONTRACT_ADDRESS: process.env.AIRDROP_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ADDRESS: process.env.TOKEN_CONTRACT_ADDRESS,
  TOTAL_AIRDROP_AMOUNT: process.env.TOTAL_AIRDROP_AMOUNT || 1000000,
  MAX_CLAIM_PER_WALLET: process.env.MAX_CLAIM_PER_WALLET || 1000,
  REFERRAL_REWARD_PERCENTAGE: process.env.REFERRAL_REWARD_PERCENTAGE || 10,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000']
};
