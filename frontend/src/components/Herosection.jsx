import { Zap, ArrowRight, Coins, Sparkles, Star } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden px-6 py-16 lg:py-24 min-h-screen flex items-center justify-center">
      {/* Enhanced Background Gradient with black from bottom left */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-black"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-transparent opacity-70"></div>

      {/* Responsive Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-purple-500/10 rounded-full blur-2xl lg:blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/3 right-1/4 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-cyan-500/10 rounded-full blur-2xl lg:blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-blue-500/5 rounded-full blur-2xl lg:blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Enhanced 3D Floating Coins with Better Positioning */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        {/* Top Left Area - Multiple Coins */}
        <div className="absolute top-20 left-8 lg:left-16 animate-float">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full   flex items-center justify-center transform hover-scale overflow-hidden"
            style={{
              transform: "rotate3d(1, 1, 0, 35deg) rotateZ(15deg)",
            }}
          >
            <img
              src="/1.png"
              alt="Coin"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        <div
          className="absolute top-42 left-20 lg:left-32 animate-float"
          style={{ animationDelay: "0.8s" }}
        >
          <div
            className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full  flex items-center justify-center hover-scale overflow-hidden"
            style={{
              transform: "rotate3d(-1, 1, 0, 45deg) rotateZ(-20deg)",
            }}
          >
            <img
              src="/1.png"
              alt="Coin"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* Top Right Area */}
        <div
          className="absolute top-16 right-12 lg:right-24 animate-float"
          style={{ animationDelay: "0.3s" }}
        >
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full   flex items-center justify-center hover-scale overflow-hidden"
            style={{
              transform: "rotate3d(1, -1, 0, 40deg) rotateZ(-12deg)",
            }}
          >
            <img
              src="/1.png"
              alt="Coin"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* Middle Areas */}
        <div
          className="absolute top-1/2 left-4 lg:left-8 animate-float"
          style={{ animationDelay: "1.2s" }}
        >
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full  flex items-center justify-center hover-scale overflow-hidden"
            style={{
              transform: "rotate3d(0, 1, 1, 25deg) rotateZ(8deg)",
            }}
          >
            <img
              src="/1.png"
              alt="Coin"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        <div
          className="absolute top-1/3 right-8 lg:right-16 animate-float"
          style={{ animationDelay: "1.8s" }}
        >
          <div
            className="w-14 h-14 sm:w-18 sm:h-18 lg:w-22 lg:h-22 rounded-full   flex items-center justify-center hover-scale overflow-hidden"
            style={{
              transform: "rotate3d(1, 0, 1, 50deg) rotateZ(22deg)",
            }}
          >
            <img
              src="/1.png"
              alt="Coin"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* Bottom Areas */}
        <div
          className="absolute bottom-24 right-20 lg:right-40 animate-float"
          style={{ animationDelay: "1.5s" }}
        >
          <div
            className="w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full  flex items-center justify-center hover-scale overflow-hidden"
            style={{
              transform: "rotate3d(1, -1, 0, 30deg) rotateZ(-18deg)",
            }}
          >
            <img
              src="/1.png"
              alt="Coin"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        <div
          className="absolute bottom-40 left-16 lg:left-28 animate-float"
          style={{ animationDelay: "2.2s" }}
        >
          <div
            className="w-18 h-18 sm:w-22 sm:h-22 lg:w-26 lg:h-26 rounded-full  flex items-center justify-center hover-scale overflow-hidden"
            style={{
              transform: "rotate3d(-1, 1, 1, 42deg) rotateZ(25deg)",
            }}
          >
            <img
              src="/1.png"
              alt="Coin"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-4xl text-center z-10 px-4">
        {/* Optimized Headlines with Better Typography */}
        <h1 className="mb-6 sm:mb-8 text-3xl sm:text-4xl font-bold tracking-tight lg:text-5xl xl:text-6xl leading-tight animate-fade-in animate-slide-up">
          <span className="gradient-text">Claim Your </span>
          <span className="text-white">Hivox Airdrop </span>
          <span className="gradient-text">Now</span>
        </h1>

        {/* Enhanced Subtitle */}
        <p className="mx-auto mb-8 sm:mb-10 max-w-2xl text-sm sm:text-base text-gray-300 lg:text-lg leading-relaxed px-4 sm:px-0">
          Join the next generation of DeFi with our revolutionary multi-level
          referral system.
          <span className="text-cyan-400 font-semibold">
            {" "}
            Earn massive rewards
          </span>
          , build your network, and be part of the Hivox ecosystem.
        </p>

        {/* Premium CTA Buttons */}
        <div className="flex flex-row gap-4 justify-center mb-10 px-4">
          <button className="group relative bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 hover:from-purple-700 hover:via-blue-600 hover:to-cyan-500 text-white font-semibold px-6 py-3 text-base neon-glow hover-scale shadow-xl overflow-hidden rounded-lg flex items-center transition-all duration-200">
            <Coins className="mr-2 h-5 w-5 relative z-10" />
            <span className="relative z-10 whitespace-nowrap">
              Claim Your Hivox Airdrop
            </span>
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 relative z-10" />
          </button>

          <button className="border-2 border-purple-400/50 bg-white/5 backdrop-blur-sm hover:bg-purple-500/10 hover:border-purple-400 text-white px-6 py-3 text-base hover-scale font-semibold shadow-lg rounded-lg flex items-center transition-all duration-200">
            Connect Wallet
          </button>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
          <div className="animate-fade-in bg-gradient-to-br from-purple-900/40 to-blue-900/30 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/30 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover-scale">
            <div className="text-3xl lg:text-4xl font-bold gradient-text mb-2">
              $5M
            </div>
            <div className="text-gray-300 font-medium">Total Rewards Pool</div>
          </div>
          <div
            className="animate-fade-in bg-gradient-to-br from-cyan-900/40 to-blue-900/30 backdrop-blur-lg rounded-2xl p-6 border border-cyan-400/30 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover-scale"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="text-3xl lg:text-4xl font-bold gradient-text mb-2">
              100K+
            </div>
            <div className="text-gray-300 font-medium">Active Participants</div>
          </div>
          <div
            className="animate-fade-in bg-gradient-to-br from-blue-900/40 to-purple-900/30 backdrop-blur-lg rounded-2xl p-6 border border-blue-400/30 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover-scale"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="text-3xl lg:text-4xl font-bold gradient-text mb-2">
              3 Levels
            </div>
            <div className="text-gray-300 font-medium">Referral Tiers</div>
          </div>
        </div>
      </div>
    </section>
  );
};
