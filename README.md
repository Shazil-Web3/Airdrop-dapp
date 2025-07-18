# 🚀 Hivox Airdrop - Full Stack AI Blockchain Web3 Application

A comprehensive, production-ready airdrop platform built with Next.js, Node.js, Solidity smart contracts, AI integration, and advanced Web3 features. This project implements a complete ecosystem for token distribution with multi-level referrals, Sybil resistance, AI assistance, and real-time social media verification.

## 🌟 Key Features

### 🔗 **Multi-Level Referral System**
- **3-Level Referral Rewards**: 10%, 5%, 2% distribution
- **On-chain Referral Tracking**: Immutable referral relationships
- **Automatic Reward Distribution**: Smart contract handles all calculations
- **Referral Link Generation**: Unique links for each user

### 🛡️ **Sybil Resistance & Security**
- **Gitcoin Passport Integration**: Human verification through multiple identity providers
- **Anti-Bot Protection**: Prevents multiple claims from same person
- **Cross-Wallet Protection**: Tasks saved per person, not per wallet
- **Smart Contract Security**: Comprehensive testing with Foundry

### 🤖 **AI Integration**
- **AI Chat Widget**: Real-time assistance powered by Google Gemini
- **Context-Aware Responses**: Project-specific information and guidance
- **Markdown Support**: Rich text formatting for responses
- **Floating UI**: Non-intrusive chat interface

### 🐦 **Twitter/X Integration**
- **Real-time Tweet Verification**: Official Twitter API v2 integration
- **Automatic Content Validation**: Checks for specific campaign text
- **Rate Limit Handling**: Robust error handling for API limits
- **Live Verification Status**: Real-time task completion tracking

### 📱 **Modern Frontend**
- **Next.js 15**: Latest React framework with App Router
- **Tailwind CSS**: Modern, responsive design system
- **Framer Motion**: Smooth animations and transitions
- **Wagmi + RainbowKit**: Professional Web3 wallet integration
- **Real-time Updates**: Live data synchronization

### ⚡ **Robust Backend**
- **Node.js + Express**: High-performance API server
- **MongoDB**: Scalable NoSQL database

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │ Smart Contracts │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (Solidity)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Widget     │    │   Twitter API   │    │   Foundry Tests │
│  (Gemini AI)    │    │   (X2 API)      │    │   (Security)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

### Frontend (`/frontend`)
```
src/
├── components/           # 18 React components
│   ├── DashboardContent.jsx      # Main dashboard with all features
│   ├── AIChatWidget.jsx          # AI assistant interface
│   ├── VerifyTweet.jsx           # Twitter verification component
│   ├── Referral.jsx              # Referral system UI
│   ├── AirdropFunder.jsx         # Contract funding interface
│   ├── ContractTestRunner.jsx    # Smart contract testing UI
│   ├── CustomConnectButton.jsx   # Web3 wallet connection
│   ├── Navbar.jsx                # Navigation component
│   ├── Herosection.jsx           # Landing page hero
│   ├── Footer.jsx                # Footer component
│   ├── Faqsection.jsx            # FAQ section
│   ├── Howitworks.jsx            # How it works guide
│   ├── Whychooseus.jsx           # Value proposition
│   ├── Aurora.jsx                # Background effects
│   ├── MetallicPaint.jsx         # Visual effects
│   ├── Noise.jsx                 # Noise effects
│   ├── EntryAnimation.jsx        # Entry animations
│   ├── LenisProvider.jsx         # Smooth scrolling
│   └── Providers.jsx             # Context providers
├── context/
│   ├── RContext.jsx              # Main app context (568 lines)
│   ├── airdrop.json              # Smart contract ABI
│   └── token.json                # Token contract ABI
├── lib/
│   ├── api.js                    # API service layer
│   └── gitcoinPassport.js        # Gitcoin Passport integration
└── hooks/
    └── useWallet.js              # Wallet management hook
```

### Backend (`/backend`)
```
├── app.js                        # Main Express application (127 lines)
├── server.js                     # Server entry point
├── routes/                       # API route definitions
│   ├── users.js                  # User management routes
│   ├── claims.js                 # Claim processing routes
│   ├── ai.js                     # AI chat routes
│   └── tweetTask.js              # Twitter verification routes
├── controllers/                  # Business logic
│   ├── userController.js         # User management (458 lines)
│   ├── claimController.js        # Claim processing (294 lines)
│   ├── aiController.js           # AI integration (51 lines)
│   └── tweetTaskController.js    # Twitter API (131 lines)
├── models/                       # MongoDB schemas
│   ├── User.js                   # User model (252 lines)
│   ├── Activity.js               # Activity tracking (101 lines)
│   ├── ClaimHistory.js           # Claim records (143 lines)
│   ├── Referral.js               # Referral tracking (107 lines)
│   └── TweetTask.js              # Tweet verification (12 lines)
└── config/
    └── db.js                     # Database configuration
```

### Smart Contracts (`/smart-contract`)
```
src/
├── Airdrop.sol                   # Main airdrop contract (161 lines)
└── ERC20.sol                     # Token contract (15 lines)
test/
├── HivoxAirdrop.t.sol            # Unit tests (227 lines)
└── HivoxContractsFuzzTest.t.sol  # Fuzz tests (231 lines)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- MongoDB
- MetaMask or Web3 wallet
- Twitter Developer Account
- Google Gemini API key
- Gitcoin Passport API access

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Smart Contract Setup
```bash
cd smart-contract
forge install
forge test
```

## 🔧 Configuration

### Environment Variables

#### Frontend (`.env.local`)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_NETWORK_ID=11155111
NEXT_PUBLIC_AIRDROP_CONTRACT=0x...
NEXT_PUBLIC_TOKEN_CONTRACT=0x...
```

#### Backend (`.env`)
```env
MONGODB_URI=mongodb://localhost:27017/hivox-airdrop
TWITTER_BEARER_TOKEN=your_twitter_api_token
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
```

## 🧪 Testing

### Smart Contract Tests
```bash
cd smart-contract
forge test                    # Run all tests
forge test --match-test testClaimAirdropWithReferral  # Run specific test
forge coverage                # Generate coverage report
```

### Backend Tests
```bash
cd backend
npm test
```

## 🔒 Security Features

### Smart Contract Security
- **Foundry Testing**: Comprehensive unit and fuzz tests
- **Access Control**: Owner-only admin functions
- **Reentrancy Protection**: Safe external calls
- **Input Validation**: Proper parameter checking
- **Emergency Controls**: Pause/unpause functionality

### Backend Security
- **Helmet**: Security headers
- **CORS**: Cross-origin protection
- **XSS Protection**: Input sanitization
- **MongoDB Sanitization**: NoSQL injection prevention

### Frontend Security
- **Input Validation**: Client-side validation
- **Secure API Calls**: Proper error handling
- **Wallet Security**: MetaMask integration
- **Environment Variables**: Secure configuration

## 🤖 AI Integration Details

### AI Chat Widget Features
- **Real-time Responses**: Instant AI assistance
- **Context Awareness**: Project-specific knowledge
- **Markdown Support**: Rich text formatting
- **Error Handling**: Graceful fallbacks
- **Loading States**: User feedback

### AI Controller Implementation
```javascript
// Backend AI integration with Google Gemini
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({});

exports.chatWithAI = async (req, res) => {
  const { prompt } = req.body;
  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: SYSTEM_PROMPT + prompt }] }]
  });
  res.json({ reply: result?.text });
};
```

## 🐦 Twitter Integration Details

### Tweet Verification System
- **Real-time API Calls**: Twitter API v2 integration
- **Content Validation**: Checks for specific campaign text
- **Rate Limit Handling**: Robust error management
- **Status Tracking**: Persistent verification state

### Implementation
```javascript
// Backend tweet verification
exports.verifyTweet = async (req, res) => {
  const { tweetUrl, walletAddress } = req.body;
  const tweetId = extractTweetId(tweetUrl);
  
  const twitterRes = await axios.get(
    `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=author_id,created_at,text`,
    { headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` } }
  );
  
  if (tweet.text.includes(predefinedText) && new Date(tweet.created_at) > campaignStart) {
    // Mark as verified
    await TweetTask.findOneAndUpdate(
      { walletAddress },
      { tweet: { completed: true, tweetId, verifiedAt: new Date() } },
      { upsert: true }
    );
  }
};
```

## 🛡️ Sybil Resistance Implementation

### Gitcoin Passport Integration
- **Multi-Provider Verification**: Multiple identity sources
- **Score-Based Threshold**: Configurable verification levels
- **Cross-Wallet Protection**: Person-based, not wallet-based
- **Persistent Verification**: Tasks saved per person

### Implementation
```javascript
// Frontend passport verification
const fetchPassportScore = async (address) => {
  const response = await fetch(`https://api.scorer.gitcoin.co/registry/score/${process.env.NEXT_PUBLIC_GITCOIN_SCORER_ID}/${address}`);
  const data = await response.json();
  return {
    score: data.score,
    passing: data.score >= threshold,
    threshold: threshold
  };
};
```

## 📊 Database Schema

### User Model
```javascript
{
  walletAddress: String,
  referralCode: String,
  referrer: ObjectId,
  referralCount: Number,
  totalEarnings: Number,
  isVerified: Boolean,
  passportScore: Number,
  createdAt: Date
}
```

### Activity Model
```javascript
{
  user: ObjectId,
  walletAddress: String,
  activityType: String,
  description: String,
  metadata: Object,
  timestamp: Date
}
```

### Claim History Model
```javascript
{
  user: ObjectId,
  walletAddress: String,
  amount: Number,
  referrer: String,
  referralReward: Number,
  transactionHash: String,
  blockNumber: Number,
  status: String
}
```

## 🔗 Smart Contract Functions

### Main Functions
- `claimAirdrop(address _referrer)`: Claim tokens with optional referral
- `pause()`: Pause airdrop (owner only)
- `unpause()`: Unpause airdrop (owner only)
- `withdrawRemaining()`: Withdraw remaining tokens (owner only)
- `updateReferralPercentages(uint256[] _percentages)`: Update referral rates

### Events
- `TokensClaimed(address user, address referrer, uint256 amount)`
- `ReferralReward(address referrer, uint256 level, uint256 reward)`

## 🎯 Key Components Breakdown

### 18 Frontend Components
1. **DashboardContent.jsx** (623 lines) - Main dashboard with all features
2. **AIChatWidget.jsx** (151 lines) - AI assistant interface
3. **VerifyTweet.jsx** (139 lines) - Twitter verification
4. **Referral.jsx** (93 lines) - Referral system
5. **AirdropFunder.jsx** (145 lines) - Contract funding
6. **ContractTestRunner.jsx** (169 lines) - Smart contract testing
7. **CustomConnectButton.jsx** (124 lines) - Wallet connection
8. **Navbar.jsx** (129 lines) - Navigation
9. **Herosection.jsx** (118 lines) - Landing hero
10. **Footer.jsx** (83 lines) - Footer
11. **Faqsection.jsx** (107 lines) - FAQ
12. **Howitworks.jsx** (97 lines) - How it works
13. **Whychooseus.jsx** (115 lines) - Value prop
14. **Aurora.jsx** (207 lines) - Background effects
15. **MetallicPaint.jsx** (586 lines) - Visual effects
16. **Noise.jsx** (86 lines) - Noise effects
17. **EntryAnimation.jsx** (100 lines) - Animations
18. **LenisProvider.jsx** (44 lines) - Smooth scrolling

### 4 Backend Controllers
1. **userController.js** (458 lines) - User management
2. **claimController.js** (294 lines) - Claim processing
3. **aiController.js** (51 lines) - AI integration
4. **tweetTaskController.js** (131 lines) - Twitter verification

### 5 Database Models
1. **User.js** (252 lines) - User data
2. **Activity.js** (101 lines) - Activity tracking
3. **ClaimHistory.js** (143 lines) - Claim records
4. **Referral.js** (107 lines) - Referral data
5. **TweetTask.js** (12 lines) - Tweet verification

## 🧪 Testing Coverage

### Foundry Tests
- **Unit Tests**: 227 lines covering all contract functions
- **Fuzz Tests**: 231 lines for property-based testing
- **Security Tests**: Comprehensive edge case coverage
- **Integration Tests**: End-to-end workflow testing

### Test Categories
- Contract initialization
- Airdrop claiming (with/without referrals)
- Multi-level referral rewards
- Admin controls (pause/unpause)
- Access control (owner-only functions)
- Edge cases and error conditions
- Fuzz testing for robustness

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
npm start
```

### Backend Deployment
```bash
npm start
```

### Smart Contract Deployment
```bash
forge script script/Deploy.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
```

## 📈 Performance Optimizations

### Frontend
- **Next.js 15**: Latest performance optimizations
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js built-in optimization
- **Caching**: Strategic caching strategies

### Backend
- **Compression**: Gzip compression middleware
- **Rate Limiting**: API abuse prevention
- **Database Indexing**: Optimized MongoDB queries
- **Caching**: Redis integration ready

### Smart Contracts
- **Gas Optimization**: Efficient contract design
- **Batch Operations**: Reduced transaction costs
- **Event Optimization**: Minimal gas usage for events

## 🔮 Future Enhancements

### Planned Features
- **Mobile App**: React Native implementation
- **Advanced Analytics**: Detailed user insights
- **Multi-Chain Support**: Ethereum, Polygon, BSC
- **DAO Governance**: Community-driven decisions
- **Advanced AI**: More sophisticated AI features
- **Social Features**: Community building tools

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request


**Built with ❤️ by the Hivox Team**

*This project represents a complete, production-ready Web3 airdrop platform with advanced features including AI integration, social media verification, Sybil resistance, and comprehensive testing.* 