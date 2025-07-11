import { Navbar } from '../../components/Navbar.jsx';
import { Footer } from '../../components/Footer.jsx';
import { 
  TrendingUp, 
  Globe, 
  Award, 
  Rocket,
  Lock,
  Coins
} from "lucide-react";

export default function About() {
  const milestones = [
    {
      year: "2024",
      title: "Platform Launch",
      description: "Hivox airdrop platform goes live with advanced security features",
      icon: Rocket,
      color: "from-purple-500 to-blue-500",
      
    },
    {
      year: "2024",
      title: "Community Growth",
      description: "Reached 100K+ active participants in the ecosystem",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      
    },
    {
      year: "2024",
      title: "Security Milestone",
      description: "Implemented advanced anti-bot and sybil resistance systems",
      icon: Lock,
      color: "from-blue-500 to-cyan-500",
      
    },
    {
      year: "2024",
      title: "Token Launch",
      description: "HIVOX token launch with innovative vesting mechanisms",
      icon: Coins,
      color: "from-yellow-500 to-orange-500",
      
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="">
        {/* Hero Section with Gradient Background */}
        <section className="relative overflow-hidden px-6 py-20 lg:py-32 min-h-[60vh] flex items-center justify-center">
          {/* Enhanced Background Gradient matching hero section */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-black"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-transparent opacity-70"></div>

          {/* Professional Gradient Circles and Glows */}
         

          <div className="relative mx-auto max-w-4xl text-center z-10">
            <h1 className="text-4xl font-bold mb-6 lg:text-6xl text-white leading-tight animate-fade-in">
              About <span className="gradient-text animate-pulse">Hivox</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Revolutionizing the future of decentralized finance through innovative airdrop mechanisms, 
              advanced security protocols, and community-driven development that puts users first.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="relative px-6 py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        
          <div className="mx-auto max-w-6xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-xl flex items-center justify-center ">
                      <Rocket className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-br from-purple-500/30 to-cyan-500/30 rounded-xl "></div>
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    Our <span className="gradient-text">Mission</span>
                  </h2>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Hivox is dedicated to creating a fair, transparent, and inclusive ecosystem where every participant 
                  has the opportunity to benefit from the growth of decentralized finance. We believe in the power 
                  of community-driven innovation and the potential of blockchain technology to democratize access 
                  to financial opportunities.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Our multi-level referral system ensures that early adopters and community builders are rewarded 
                  for their contributions, while our advanced security measures protect against manipulation and 
                  ensure genuine participation.
                </p>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/30  rounded-2xl p-8 border border-purple-400/30 shadow-2xl">
                  <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl "></div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                      <Award className="h-5 w-5 text-purple-400 mr-2" />
                      Key Principles
                    </h3>
                    <ul className="space-y-4">
                      {[
                        "Fair and transparent reward distribution",
                        "Community-driven development",
                        "Advanced security and anti-bot protection",
                        "Long-term value creation through vesting"
                      ].map((principle, index) => (
                        <li key={index} className="flex items-center text-gray-300">
                          <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full mr-3"></span>
                          {principle}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Journey Section - Enhanced with Beautiful Gradient Background */}
        <section className="relative px-6 py-20 overflow-hidden">
          {/* Beautiful Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950"></div>
<div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-transparent opacity-90"></div>
<div className="absolute inset-0 bg-gradient-to-tl from-black/70 via-transparent to-transparent opacity-70"></div>

          
          <div className="mx-auto max-w-4xl relative z-10">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-br from-purple-500/30 to-cyan-500/30 rounded-xl blur-lg"></div>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-6 text-white lg:text-4xl">
                Our <span className="gradient-text">Journey</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Key milestones that have shaped Hivox into the platform it is today.
              </p>
            </div>
            
            {/* Vertical Timeline */}
            <div className="relative">
              {/* Timeline Line with Enhanced Glow */}
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-cyan-500 to-green-500 shadow-lg"></div>
              <div className="absolute left-8 top-0 bottom-0 w-2 bg-gradient-to-b from-purple-500/30 via-cyan-500/30 to-green-500/30 blur-sm"></div>
              
              {milestones.map((milestone, index) => {
                const IconComponent = milestone.icon;
                
                return (
                  <div key={milestone.title} className="relative mb-12 last:mb-0">
                    {/* Timeline Dot with Enhanced Glow */}
                    <div className="absolute left-6 top-8 w-5 h-5 bg-white rounded-full border-4 border-slate-800 shadow-lg z-10"></div>
                    <div className={`absolute left-6 top-8 w-5 h-5 rounded-full bg-gradient-to-br ${milestone.color} blur-md opacity-80`}></div>
                    
                    <div className="ml-30">
                      <div className="relative">
                        <div className="bg-gradient-to-br from-slate-800/80 via-slate-700/80 to-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 shadow-xl hover:border-purple-400/50 transition-all duration-500 hover:scale-105 max-w-md">
                          {/* Card Glow Effect */}
                          <div className={`absolute -inset-1 bg-gradient-to-br ${milestone.color} rounded-2xl blur-lg opacity-10`}></div>
                          
                          <div className="relative z-10">
                            {/* Icon with Enhanced Glow */}
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${milestone.color} shadow-lg mb-4`}>
                              <IconComponent className="h-6 w-6 text-white" />
                            </div>
                            <div className={`absolute top-0 left-0 w-12 h-12 rounded-xl bg-gradient-to-br ${milestone.color} blur-md opacity-60`}></div>
                            
                            {/* Year Badge */}
                            <div className="inline-block bg-purple-800/80 backdrop-blur-sm text-purple-300 px-3 py-1 rounded-full text-sm font-medium mb-3 border border-purple-400/30">
                              {milestone.year}
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-white text-lg font-semibold mb-3">
                              {milestone.title}
                            </h3>
                            
                            {/* Description */}
                            <p className="text-gray-300 text-sm leading-relaxed">
                              {milestone.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 