'use client';

import { useState } from 'react';
import { SismoConnectButton } from "@sismo-core/sismo-connect-react";
import { Shield, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { sismoConfig } from '../lib/sismoConfig.js';

export const SismoConnectButtonComponent = ({ onProofGenerated, onVerificationComplete, disabled = false }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'success', 'error', null

  const handleResponse = async (zkProof) => {
    try {
      setIsVerifying(true);
      setVerificationStatus(null);
      
      console.log("🔐 Sismo proof received:", zkProof);
      
      // Call the callback to handle the proof
      if (onProofGenerated) {
        await onProofGenerated(zkProof);
      }
      
      // Simulate verification (in real app, this would verify on-chain)
      setVerificationStatus('success');
      
      if (onVerificationComplete) {
        onVerificationComplete(zkProof);
      }
      
    } catch (error) {
      console.error("❌ Error handling Sismo proof:", error);
      setVerificationStatus('error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleError = (error) => {
    console.error("❌ Sismo Connect error:", error);
    setVerificationStatus('error');
    setIsVerifying(false);
  };

  return (
    <div className="w-full">
      {verificationStatus === 'success' ? (
        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex items-center justify-center">
          <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
          <span className="text-green-400 font-semibold">ZK Proof Verified Successfully!</span>
        </div>
      ) : verificationStatus === 'error' ? (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center justify-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-400 font-semibold">ZK Proof Verification Failed</span>
        </div>
      ) : (
        <div className="relative">
          <SismoConnectButton
            config={sismoConfig}
            auths={[{ authType: "VAULT" }]}
            claims={[
              {
                groupId: "0x1234567890123456789012345678901234567890", // Replace with your data group
                claimType: "gte",
                value: 1
              }
            ]}
            signature={{
              message: "Claim 1000 HIVOX tokens",
              isSelectableByUser: true
            }}
            onResponse={handleResponse}
            onError={handleError}
            disabled={disabled || isVerifying}
            className="w-full bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-600 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center shadow-lg hover:shadow-purple-500/25 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <Loader className="h-5 w-5 mr-2 animate-spin" />
                Verifying ZK Proof...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-2" />
                Verify with Sismo
              </>
            )}
          </SismoConnectButton>
        </div>
      )}
    </div>
  );
};
