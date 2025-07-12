'use client';

import { Navbar } from '../components/Navbar.jsx';
import { Footer } from '../components/Footer.jsx';
import { HeroSection } from '../components/Herosection.jsx';
import { FAQSection } from '../components/Faqsection.jsx';
import { WhyChooseSection } from '../components/Whychooseus.jsx';
import { HowItWorksSection } from '../components/Howitworks.jsx';
import { ReferralSection } from '../components/Referral.jsx';
import { EntryAnimation } from '../components/EntryAnimation.jsx';

export default function Home() {
  const handleAnimationComplete = () => {
    // Optional: Add any logic to run after animation completes
    console.log('Entry animation completed');
  };

  return (
    <EntryAnimation onAnimationComplete={handleAnimationComplete}>
      <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)]">
        <Navbar />
        <main className="flex-1">
          <HeroSection />
          <WhyChooseSection />
          <HowItWorksSection />
          <ReferralSection />
          <FAQSection />
        </main>
        <Footer />
      </div>
    </EntryAnimation>
  );
}
