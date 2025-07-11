"use client";

import { Shield, Lock, Bot, Coins } from "lucide-react";
import Aurora from './Aurora';

export const WhyChooseSection = () => {
  const features = [
    {
      title: "Sybil Resistance",
      description:
        "Advanced algorithms prevent fake accounts and ensure fair distribution.",
      icon: Shield,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      iconColor: "text-green-300",
    },
    {
      title: "Vesting Logic",
      description:
        "Smart vesting schedules protect token value and reward long-term holders.",
      icon: Lock,
      color: "bg-gradient-to-br from-blue-500 to-cyan-500",
      iconColor: "text-cyan-300",
    },
    {
      title: "Fair Rewards",
      description:
        "Transparent and equitable reward system for all participants.",
      icon: Coins,
      color: "bg-gradient-to-br from-yellow-400 to-orange-400",
      iconColor: "text-yellow-300",
    },
    {
      title: "Anti-Bot Protection",
      description:
        "Sophisticated bot detection keeps the airdrop genuine and secure.",
      icon: Bot,
      color: "bg-gradient-to-br from-red-500 to-pink-500",
      iconColor: "text-pink-300",
    },
  ];

  return (
    <section id="features" className="px-10 py-24 bg-[#0f0f1a] relative overflow-hidden">
      {/* Aurora Effect */}
      <div className="absolute inset-0 w-full h-full">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={1.7}
        />
      </div>
      
      <div className="mx-auto max-w-6xl relative z-10">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 lg:text-5xl text-white">
            Why Choose <span className="text-purple-500">Hivox</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Built with cutting-edge security and fairness at its core. Your rewards are protected.
          </p>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.title}
                className={`
                  group relative overflow-hidden rounded-3xl p-6
                  bg-gradient-to-br from-[#181825] via-[#11111a] to-[#0a0a15]
                  shadow-[0_0_20px_rgba(0,0,0,0.6)] transition-transform
                  duration-500 hover:scale-[1.04] border border-white/10
                `}
              >
                {/* Glow Background */}
                <div
                  className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-30 z-0 ${feature.color}`}
                ></div>

                {/* Icon Circle */}
                <div
                  className={`
                    relative z-10 mx-auto mb-5 flex items-center justify-center h-16 w-16
                    rounded-xl ${feature.color} shadow-xl
                    group-hover:scale-110 transition-transform duration-300
                  `}
                >
                  <IconComponent className={`h-8 w-8 ${feature.iconColor}`} />
                </div>

                {/* Title */}
                <h3 className="text-white text-lg font-semibold text-center mb-2 z-10 relative">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm text-center leading-relaxed relative z-10">
                  {feature.description}
                </p>

                {/* Neon ring hover border */}
                <div className="absolute inset-0 z-0 rounded-3xl ring-1 ring-white/10 group-hover:ring-purple-500/40 transition duration-500"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
