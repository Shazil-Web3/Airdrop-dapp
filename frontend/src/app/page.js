'use client';

import { Navbar } from '../components/Navbar.jsx';
import { Footer } from '../components/Footer.jsx';
import { HeroSection } from '../components/Herosection.jsx';
import { FAQSection } from '../components/Faqsection.jsx';
import { WhyChooseSection } from '../components/Whychooseus.jsx';
import { HowItWorksSection } from '../components/Howitworks.jsx';
import { ReferralSection } from '../components/Referral.jsx';

export default function Home() {
  return (
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
  );
}
