import { Users, Target, Gift } from "lucide-react";

export const ReferralSection = () => {
  const referralTiers = [
    {
      level: 1,
      title: "Direct Referrals",
      percentage: "10%",
      icon: Users,
      description: "Earn 10% of rewards from users you directly refer",
      color: "from-accent to-primary"
    },
    {
      level: 2,
      title: "Second Level",
      percentage: "5%",
      icon: Target,
      description: "Earn 5% from referrals made by your direct referrals",
      color: "from-primary to-purple-500"
    },
    {
      level: 3,
      title: "Third Level",
      percentage: "2%",
      icon: Gift,
      description: "Earn 2% from referrals made by your second level referrals",
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <section className="px-6 py-20 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Middle Right Orb – Cyan, darker */}
        <div className="absolute top-1/2 right-[-12rem] w-[20rem] h-[20rem] bg-[radial-gradient(circle,_rgba(34,211,238,0.12)_0%,_transparent_70%)] -translate-y-1/2" />
        
        {/* Middle Left Orb – Purple, darker */}
        <div className="absolute top-[25%] left-[-12rem] w-[20rem] h-[20rem] bg-[radial-gradient(circle,_rgba(168,85,247,0.12)_0%,_transparent_70%)] -translate-y-1/2" />
      </div>

      <div className="mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 lg:text-5xl text-white">
            <span className="text-purple-400">Referral Rewards</span> System
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Build your network and earn from two levels. The more you grow, the more you earn.
          </p>
        </div>
        
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 justify-center items-stretch">
          {referralTiers.map((tier, index) => {
            const IconComponent = tier.icon;
            return (
              <div 
                key={tier.level}
                className="flex-1 max-w-[420px] min-w-[260px] bg-slate-800 border border-slate-700 rounded-xl p-6 hover:bg-slate-700 transition-all duration-300 hover:scale-105 animate-slide-up shadow-xl flex flex-col mx-auto"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-center pb-4">
                  <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${tier.color} shadow-lg`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <span className="w-fit mx-auto mb-2 bg-purple-800 text-purple-300 px-3 py-1 rounded-full text-sm">
                    Level {tier.level}
                  </span>
                  <h3 className="text-xl font-semibold text-white mb-2">{tier.title}</h3>
                </div>
                <div className="text-center flex-1 flex flex-col justify-center">
                  <div className="text-4xl font-bold text-purple-400 mb-4">
                    {tier.percentage}
                  </div>
                  <p className="text-gray-400">
                    {tier.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual connection lines */}
        <div className="mt-12 flex justify-center">
          <div className="flex items-center space-x-4">
            <div className="h-2 w-2 rounded-full bg-cyan-400"></div>
            <div className="h-px w-16 bg-gradient-to-r from-cyan-400 to-purple-500"></div>
            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
          </div>
        </div>
      </div>
    </section>
  );
};