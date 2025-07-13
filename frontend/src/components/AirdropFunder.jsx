import { useState } from 'react';
import { Coins, Wallet, CheckCircle, XCircle, Loader } from 'lucide-react';
import { fundAirdropContract, checkAirdropBalance } from '../scripts/fundAirdrop.js';

export const AirdropFunder = () => {
  const [isFunding, setIsFunding] = useState(false);
  const [balances, setBalances] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFundAirdrop = async () => {
    setIsFunding(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await fundAirdropContract();
      setBalances(result);
      setSuccess(true);
    } catch (err) {
      console.error('Funding failed:', err);
      setError(err.message);
    } finally {
      setIsFunding(false);
    }
  };

  const handleCheckBalance = async () => {
    try {
      const result = await checkAirdropBalance();
      setBalances(result);
    } catch (err) {
      console.error('Balance check failed:', err);
      setError(err.message);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
          <Coins className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Fund Airdrop Contract</h2>
          <p className="text-slate-400 text-sm">Add tokens to the airdrop contract so users can claim</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-400 font-semibold">Error</span>
          </div>
          <p className="text-red-300 text-sm mt-2">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-400 font-semibold">Success!</span>
          </div>
          <p className="text-green-300 text-sm mt-2">Airdrop contract has been funded with tokens.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
          <div className="flex items-center mb-2">
            <Wallet className="h-4 w-4 text-slate-400 mr-2" />
            <span className="text-slate-400 text-sm">Your Balance</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {balances?.userBalance ? `${parseFloat(balances.userBalance).toLocaleString()} HIVOX` : 'Loading...'}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
          <div className="flex items-center mb-2">
            <Coins className="h-4 w-4 text-slate-400 mr-2" />
            <span className="text-slate-400 text-sm">Airdrop Contract</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {balances?.airdropBalance ? `${parseFloat(balances.airdropBalance).toLocaleString()} HIVOX` : 'Loading...'}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleFundAirdrop}
          disabled={isFunding}
          className={`flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center shadow-lg hover:shadow-yellow-500/25 text-base ${
            isFunding ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isFunding ? (
            <>
              <Loader className="h-5 w-5 mr-2 animate-spin" />
              Funding Contract...
            </>
          ) : (
            <>
              <Coins className="h-5 w-5 mr-2" />
              Fund Airdrop Contract
            </>
          )}
        </button>

        <button
          onClick={handleCheckBalance}
          disabled={isFunding}
          className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg"
        >
          <Wallet className="h-5 w-5 mr-2" />
          Check Balance
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h4 className="text-blue-400 font-semibold mb-2">What This Does:</h4>
        <ul className="text-blue-300 text-sm space-y-1">
          <li>• Checks your current HIVOX token balance</li>
          <li>• Checks the airdrop contract's token balance</li>
          <li>• Attempts to mint tokens directly to the airdrop contract</li>
          <li>• If minting fails, transfers tokens from your wallet</li>
          <li>• Ensures the contract has enough tokens for users to claim</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <h4 className="text-yellow-400 font-semibold mb-2">Important Notes:</h4>
        <ul className="text-yellow-300 text-sm space-y-1">
          <li>• You need to be the token contract owner to mint new tokens</li>
          <li>• If you're not the owner, you'll need to transfer existing tokens</li>
          <li>• The airdrop contract needs at least 1000 HIVOX tokens to function</li>
          <li>• This action will cost gas fees for the transaction</li>
        </ul>
      </div>
    </div>
  );
}; 