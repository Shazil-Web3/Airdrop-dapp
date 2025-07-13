"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { CustomConnectButton } from './CustomConnectButton.jsx';
import { useSyncWalletWithBackend } from '../hooks/useSyncWalletWithBackend';

export const Navbar = () => {
  useSyncWalletWithBackend();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigation = (sectionId) => {
    if (pathname === '/') {
      // If on homepage, scroll to section
      scrollToSection(sectionId);
    } else {
      // If on other pages, navigate to homepage and then scroll
      router.push(`/#${sectionId}`);
    }
  };

  return (
    <nav className="relative z-50 bg-gradient-to-b from-indigo-900 to-purple-900/80 backdrop-blur-sm shadow-lg">
            <div className="mx-auto max-w-7xl px-6">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo - Clickable to go to homepage */}
                    <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-cyan-600">
                            <span className="text-lg font-bold text-white">H</span>
                        </div>
                        <span className="text-xl font-bold text-white">HIVOX</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                            About
                        </Link>
                        <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                            Dashboard
                        </Link>
                        <button 
                          onClick={() => handleNavigation('features')} 
                          className="text-gray-300 hover:text-white transition-colors"
                        >
                            Features
                        </button>
                        
                        <button 
                          onClick={() => handleNavigation('faq')} 
                          className="text-gray-300 hover:text-white transition-colors"
                        >
                            FAQ
                        </button>
                        <CustomConnectButton />
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            className="text-gray-300 hover:text-white"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                <div className="md:hidden py-4 border-t border-gray-700">
                    <div className="flex flex-col space-y-4">
                        <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                            About
                        </Link>
                        <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                            Dashboard
                        </Link>
                        <button 
                          onClick={() => {
                            handleNavigation('features');
                            setIsMenuOpen(false);
                          }} 
                          className="text-gray-300 hover:text-white transition-colors text-left"
                        >
                            Features
                        </button>
                        <button 
                          onClick={() => {
                            handleNavigation('how-it-works');
                            setIsMenuOpen(false);
                          }} 
                          className="text-gray-300 hover:text-white transition-colors text-left"
                        >
                            How It Works
                        </button>
                        <button 
                          onClick={() => {
                            handleNavigation('faq');
                            setIsMenuOpen(false);
                          }} 
                          className="text-gray-300 hover:text-white transition-colors text-left"
                        >
                            FAQ
                        </button>
                        <CustomConnectButton className="w-full" />
                    </div>
                </div>
                )}
            </div>
        </nav>
  );
};
