import { Wallet, Users, Gift, CheckCircle } from "lucide-react";

export const HowItWorksSection = () => {
  const steps = [
    {
      step: 1,
      title: "Connect Wallet",
      description: "Connect your crypto wallet to get started with the Hivox airdrop",
      icon: Wallet,
      color: "from-accent to-primary"
    },
    {
      step: 2,
      title: "Complete Tasks",
      description: "Complete social tasks and verification to qualify for rewards",
      icon: CheckCircle,
      color: "from-primary to-purple-500"
    },
    {
      step: 3,
      title: "Invite Friends",
      description: "Share your referral link and build your network for bonus rewards",
      icon: Users,
      color: "from-purple-500 to-pink-500"
    },
    {
      step: 4,
      title: "Claim Rewards",
      description: "Claim your HIVOX tokens and multi-level referral bonuses",
      icon: Gift,
      color: "from-pink-500 to-accent"
    }
  ];

  return (
<section
  id="how-it-works"
  className="relative overflow-hidden bg-gradient-to-br from-[#000212] via-[#081427] via-25% via-[#0f1e3a] via-50% to-[#16233f]"
>





      <div className="px-8 py-40 relative z-10">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 lg:text-5xl text-white">
              How It <span className="text-purple-400">Works</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Get started in just 4 simple steps and begin earning rewards immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={step.step} className="relative">
                  <div 
                    className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg p-6 hover:bg-slate-700/80 transition-all duration-300 hover:scale-105 animate-slide-up h-full shadow-lg"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <div className="text-center pb-4">
                      <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${step.color} shadow-lg`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <span className="w-fit mx-auto mb-2 bg-purple-800 text-purple-300 px-2 py-1 rounded-full text-sm">
                        Step {step.step}
                      </span>
                      <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Connection arrow for desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <div className="w-8 h-px bg-gradient-to-r from-primary to-accent"></div>
                      <div className="absolute -right-1 -top-1 w-2 h-2 bg-accent rounded-full"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
