// Sismo Configuration
export const sismoConfig = {
  appId: process.env.NEXT_PUBLIC_SISMO_APP_ID || "0x1234567890123456789012345678901234567890",
  devMode: process.env.NODE_ENV === 'development',
  vault: {
    // For testing - remove in production
    impersonate: [
      "github:shazil-dev",
      "telegram:someuser"
    ],
  },
};

// Validate Sismo configuration
export const validateSismoConfig = () => {
  if (!process.env.NEXT_PUBLIC_SISMO_APP_ID) {
    console.warn("⚠️ NEXT_PUBLIC_SISMO_APP_ID not set, using default test app ID");
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log("🔧 Sismo dev mode enabled");
  }
  
  return sismoConfig;
}; 