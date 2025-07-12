'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function CustomConnectButton({ className = '', variant = 'default', showBalance = false, chainStatus = "icon" }) {
  const getButtonClasses = (isConnected = false) => {
    if (variant === 'hero') {
      return `w-full sm:w-auto border-2 border-purple-400/50 bg-white/5 backdrop-blur-sm hover:bg-purple-500/10 hover:border-purple-400 text-white px-6 py-3 text-base hover-scale font-semibold shadow-lg rounded-lg flex items-center justify-center transition-all duration-200 ${className}`;
    }
    
    if (isConnected) {
      return `bg-gradient-to-r from-purple-500 to-cyan-600 text-white font-semibold px-4 py-2 rounded-md hover:from-purple-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${className}`;
    }
    
    return `bg-gradient-to-r from-purple-500 to-cyan-600 text-white font-semibold px-4 py-2 rounded-md hover:from-purple-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${className}`;
  };

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className={getButtonClasses(false)}
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold px-4 py-2 rounded-md hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={openChainModal}
                    style={{ display: 'flex', alignItems: 'center' }}
                    type="button"
                    className="bg-gradient-to-r from-purple-500 to-cyan-600 text-white font-semibold px-3 py-2 rounded-md hover:from-purple-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="bg-gradient-to-r from-purple-500 to-cyan-600 text-white font-semibold px-4 py-2 rounded-md hover:from-purple-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
} 