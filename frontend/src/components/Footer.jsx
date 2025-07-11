import { Twitter, Github, MessageCircle, Zap } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-t from-gray-900 to-black text-gray-300 px-6 py-12">
        <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                {/* Logo and description */}
                <div className="md:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-600">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">Hivox</span>
                    </div>
                    <p className="text-gray-400 mb-6 max-w-md">
                        The next generation of DeFi airdrops with multi-level referral rewards. 
                        Join the revolution and build your crypto network.
                    </p>
                    <div className="flex gap-4">
                        <button 
                            className="bg-indigo-700 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md"
                        >
                            <Twitter className="h-4 w-4 mr-2" />
                            Twitter
                        </button>
                        <button 
                            className="bg-indigo-700 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md"
                        >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Discord
                        </button>
                        <button 
                            className="bg-indigo-700 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md"
                        >
                            <Github className="h-4 w-4 mr-2" />
                            GitHub
                        </button>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="font-semibold text-white mb-4">Quick Links</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Referral Program</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Tokenomics</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h3 className="font-semibold text-white mb-4">Legal</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Disclaimer</a></li>
                    </ul>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-gray-400 text-sm">
                    © 2024 Hivox. All rights reserved.
                </div>
                <div className="flex items-center gap-4 text-white">
                    <span className="p-2 bg-blue-800 rounded-md">
                        🔒 Audited 
                    </span>
                    <span className="p-2 bg-green-800 rounded-md">
                        ✅ Secure
                    </span>
                </div>
            </div>
        </div>
    </footer>
  );
};
