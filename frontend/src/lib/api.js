const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // User Management
  async connectWallet(walletData) {
    return this.request('/users/connect-wallet', {
      method: 'POST',
      body: JSON.stringify(walletData),
    });
  }

  async getUserProfile(walletAddress) {
    return this.request(`/users/profile/${walletAddress}`);
  }

  async updateUserProfile(walletAddress, profileData) {
    return this.request(`/users/profile/${walletAddress}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserActivities(walletAddress, page = 1, limit = 20) {
    return this.request(`/users/${walletAddress}/activities?page=${page}&limit=${limit}`);
  }

  async getUserReferrals(walletAddress) {
    return this.request(`/users/${walletAddress}/referrals`);
  }

  // Claim Management
  async submitClaim(claimData) {
    return this.request('/claims/submit', {
      method: 'POST',
      body: JSON.stringify(claimData),
    });
  }

  async confirmClaim(claimId) {
    return this.request(`/claims/${claimId}/confirm`, {
      method: 'PUT',
    });
  }

  async getUserClaims(walletAddress) {
    return this.request(`/claims/${walletAddress}`);
  }

  async getClaimByTransaction(transactionHash) {
    return this.request(`/claims/transaction/${transactionHash}`);
  }

  // Utility functions
  async fixReferralCodes() {
    return this.request('/users/fix-referral-codes', {
      method: 'POST',
    });
  }
}

// Create a singleton instance
const apiService = new ApiService();

export default apiService; 