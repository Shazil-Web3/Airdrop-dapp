'use client';

import { Navbar } from '../../components/Navbar.jsx';
import { Footer } from '../../components/Footer.jsx';
import { DashboardContent } from '../../components/DashboardContent.jsx';

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Navbar />
      <main className="flex-1">
        <DashboardContent />
      </main>
      <Footer />
    </div>
  );
} 