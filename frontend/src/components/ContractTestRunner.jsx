'use client';

import { useState } from 'react';
import { Play, CheckCircle, XCircle, Loader } from 'lucide-react';
import { runSimpleClaimTest } from '../tests/contract.test.js';

export const ContractTestRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const runTests = async () => {
    setIsRunning(true);
    setError(null);
    setResults(null);

    try {
      const testResults = await runSimpleClaimTest();
      setResults(testResults);
    } catch (err) {
      console.error('Test execution failed:', err);
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const getResultsFromStorage = () => {
    try {
      const stored = localStorage.getItem('simpleClaimTestResults');
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      return null;
    }
  };

  const storedResults = getResultsFromStorage();

  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/70 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
          <Play className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Token Claim Test</h2>
          <p className="text-slate-400 text-sm">Test if users can claim their airdrop tokens</p>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={isRunning}
          className={`w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center shadow-lg hover:shadow-green-500/25 text-base ${
            isRunning ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isRunning ? (
            <>
              <Loader className="h-5 w-5 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" />
              Run Token Claim Test
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-400 font-semibold">Test Error</span>
          </div>
          <p className="text-red-300 text-sm mt-2">{error}</p>
        </div>
      )}

      {(results || storedResults) && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
            <h3 className="text-lg font-semibold text-white mb-3">Test Results</h3>
            
            {results && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {results.length}
                  </div>
                  <div className="text-slate-400 text-sm">Total Tests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {results.filter(r => r.passed).length}
                  </div>
                  <div className="text-slate-400 text-sm">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {results.filter(r => !r.passed).length}
                  </div>
                  <div className="text-slate-400 text-sm">Failed</div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {(results || storedResults?.results || []).map((test, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    test.passed
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-red-500/10 border border-red-500/30'
                  }`}
                >
                  <div className="flex items-center">
                    {test.passed ? (
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400 mr-2" />
                    )}
                    <span className="text-white text-sm font-medium">{test.name}</span>
                  </div>
                  <span className={`text-xs ${
                    test.passed ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {test.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              ))}
            </div>

            {results && results.filter(r => !r.passed).length > 0 && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <h4 className="text-yellow-400 font-semibold mb-2">Failed Tests Details:</h4>
                <div className="space-y-2">
                  {results
                    .filter(r => !r.passed)
                    .map((test, index) => (
                      <div key={index} className="text-yellow-300 text-sm">
                        <strong>{test.name}:</strong> {test.message}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h4 className="text-blue-400 font-semibold mb-2">What This Test Does:</h4>
        <ul className="text-blue-300 text-sm space-y-1">
          <li>• Checks if user has already claimed tokens</li>
          <li>• Verifies claim time window is active</li>
          <li>• Ensures contract is not paused</li>
          <li>• Checks contract has sufficient token balance</li>
          <li>• Tests claiming with different ZK proof approaches</li>
          <li>• Verifies successful claims are recorded</li>
        </ul>
      </div>
    </div>
  );
};