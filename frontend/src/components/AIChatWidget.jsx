'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import apiService from '../lib/api';
import ReactMarkdown from 'react-markdown';

const AI_ICON = (
  <div className="bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full p-2 shadow-lg">
    <Sparkles className="w-8 h-8 text-white drop-shadow-lg" />
  </div>
);

const AI_AVATAR = (
  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center ">
  <Bot className="w-10 h-10 text-white" />
</div>

);

const INITIAL_MESSAGE = {
  role: 'ai',
  text: 'You can get any information regarding this project here, including the airdrop or anything else!'
};

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (open && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, open]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const data = await apiService.request('/ai-chat', {
        method: 'POST',
        body: JSON.stringify({ prompt: input })
      });
      setMessages((msgs) => [...msgs, { role: 'ai', text: data.reply || 'Sorry, I could not get a response.' }]);
    } catch (err) {
      setMessages((msgs) => [...msgs, { role: 'ai', text: 'Error connecting to AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* AI Icon Button */}
      {!open && (
        <button
          aria-label="Open AI Chat"
          
          onClick={() => setOpen(true)}
        >
           {AI_AVATAR}
        </button>
      )}
      {/* Chat Drop-up */}
      {open && (
        <div className="w-80 max-w-xs sm:max-w-sm bg-white/80 backdrop-blur-2xl border border-purple-200/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in" style={{ boxShadow: '0 8px 32px 0 rgba(168,85,247,0.18)' }}>
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-600/90 to-cyan-600/90 text-white px-4 py-3">
            <div className="flex items-center gap-2">
              {AI_AVATAR}
              <span className="font-semibold text-base tracking-wide">AI Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-full p-1 hover:bg-purple-500/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M6 6L16 16M16 6L6 16" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div ref={chatRef} className="flex-1 px-4 py-3 overflow-y-auto h-64 max-h-96 bg-gradient-to-b from-purple-50/60 to-cyan-50/80">
            {messages.map((msg, i) => (
              <div key={i} className={`my-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] shadow-md ${msg.role === 'user' ? 'bg-purple-100 text-purple-900 rounded-br-md' : 'bg-white/90 text-cyan-700 rounded-bl-md border border-purple-100'}`} style={{wordBreak:'break-word'}}>
                  {msg.role === 'ai' ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="my-2 flex justify-start">
                <div className="px-4 py-2 rounded-2xl text-sm bg-white/90 text-cyan-700 border border-purple-100 opacity-70 shadow-md">Thinking...</div>
              </div>
            )}
          </div>
          <form onSubmit={sendMessage} className="flex items-center border-t border-purple-100 px-2 py-3 bg-white/80">
            <input
              className="flex-1 px-3 py-2 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:border-purple-400 text-sm bg-white/70 placeholder-purple-400 text-black"
              type="text"
              placeholder="Ask anything about this project..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              className="ml-2 px-3 py-2 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 text-white hover:from-purple-600 hover:to-cyan-700 shadow-md transition-colors disabled:opacity-50"
              disabled={loading || !input.trim()}
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
} 