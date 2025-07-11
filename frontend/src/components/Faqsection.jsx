"use client";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import MetallicPaint, { parseLogoImage } from "./MetallicPaint";

export const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [imageData, setImageData] = useState(null);

  const faqs = [
    {
      question: "What is the Hivox Airdrop?",
      answer: "Hivox Airdrop is a multi-level referral program that rewards users for participating in our ecosystem and building their network. Participants can earn HIVOX tokens through direct participation and referral bonuses."
    },
    {
      question: "How does the multi-level referral system work?",
      answer: "Our referral system has 3 levels: Direct referrals (15%), second level (8%), and third level (3%). You earn a percentage of rewards from each level of your referral network."
    },
    {
      question: "When will tokens be distributed?",
      answer: "Token distribution will begin after the airdrop campaign ends. Tokens are subject to a vesting schedule to ensure long-term ecosystem stability."
    },
    {
      question: "How are rewards calculated?",
      answer: "Rewards are calculated based on your participation level, completed tasks, and your referral network performance. All calculations are transparent and verifiable on-chain."
    },
    {
      question: "Is there a limit to referrals?",
      answer: "There's no limit to the number of people you can refer. The more you refer, the more you earn through our multi-level system."
    }
  ];

  useEffect(() => {
    // Create a simple SVG for the metallic effect
    const svgString = `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="black"/>
        <text x="50" y="55" text-anchor="middle" fill="white" font-size="24" font-weight="bold">H</text>
      </svg>
    `;
    
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const file = new File([blob], "logo.svg", { type: 'image/svg+xml' });

    async function loadDefaultImage() {
      try {
        const parsedData = await parseLogoImage(file);
        setImageData(parsedData?.imageData ?? null);
      } catch (err) {
        console.error("Error loading default image:", err);
      }
    }

    loadDefaultImage();
  }, []);

  return (
    <section id="faq" className="px-6 py-20 bg-slate-900 relative overflow-hidden">
      {/* Metallic Paint Icon in Upper Right Corner */}
      <div className="absolute top-4 right-4 w-48 h-48 z-10">
        <MetallicPaint 
          imageData={imageData ?? new ImageData(1, 1)} 
          params={{ 
            edge: 2, 
            patternBlur: 0.005, 
            patternScale: 2, 
            refraction: 0.015, 
            speed: 0.3, 
            liquid: 0.07 
          }} 
        />
      </div>
      
      <div className="mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 lg:text-5xl text-white">
            Frequently Asked <span className="text-purple-400">Questions</span>
          </h2>
          <p className="text-xl text-gray-400">
            Everything you need to know about the Hivox Airdrop
          </p>
        </div>
        <div className="absolute inset-0 pointer-events-none z-0">
  {/* Top Left Orb */}
  <div className="absolute -top-12 -left-52 w-[22rem] h-[22rem] bg-[radial-gradient(circle,_rgba(99,102,241,0.18)_0%,_transparent_70%)]" />

  {/* Middle Right Orb */}
  <div className="absolute top-1/2 right-[-14rem] w-[24rem] h-[24rem] bg-[radial-gradient(circle,_rgba(236,72,153,0.17)_0%,_transparent_70%)] -translate-y-1/2" />

  {/* Bottom Left Orb */}
  <div className="absolute -bottom-10 -left-48 w-[26rem] h-[26rem] bg-[radial-gradient(circle,_rgba(16,185,129,0.15)_0%,_transparent_70%)]" />
</div>


        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div 
                className="p-6 cursor-pointer flex items-center justify-between"
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              >
                <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                <ChevronDown 
                  className={`h-5 w-5 text-purple-400 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`}
                />
              </div>
              {openFAQ === index && (
                <div className="px-6 pb-6 pt-0">
                  <p className="text-gray-400">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
