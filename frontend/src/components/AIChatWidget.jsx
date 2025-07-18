'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import apiService from '../lib/api';
import ReactMarkdown from 'react-markdown';

const AI_ICON = (
  <div className="bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full p-3 shadow-2xl">
    <Sparkles className="w-10 h-10 text-white drop-shadow-lg" />
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
  const [closing, setClosing] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (open && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleOpen = () => {
    setClosing(false);
    setOpen(true);
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 400); // match animation duration
  };

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
      {!open && !closing && (
        <button
          aria-label="Open AI Chat"
          onClick={handleOpen}
          className="flex items-center gap-2"
        >
           {AI_AVATAR}
           <span className="font-semibold text-base tracking-wide text-white-700 ml-4">AI Assistant</span>
        </button>
      )}
      {/* Chat Drop-up */}
      {(open || closing) && (
        <div className={`w-[420px] max-w-full sm:max-w-lg bg-white/90 backdrop-blur-2xl border border-purple-200/70 rounded-3xl shadow-2xl flex flex-col overflow-hidden ${open && !closing ? 'animate-fade-in-up' : ''} ${closing ? 'animate-fade-out-down' : ''}`}
          style={{ boxShadow: '0 12px 48px 0 rgba(168,85,247,0.22)' }}
        >
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-700/90 to-cyan-700/90 text-white px-6 py-5">
            <div className="flex items-center gap-3">
              {AI_AVATAR}
              <span className="font-semibold text-lg tracking-wide">AI Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-full p-1 hover:bg-purple-500/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M6 6L16 16M16 6L6 16" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div ref={chatRef} className="flex-1 px-6 py-5 overflow-y-auto h-96 max-h-[32rem] bg-gradient-to-b from-purple-50/80 to-cyan-50/90">
            {messages.map((msg, i) => (
              <div key={i} className={`my-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-5 py-3 rounded-2xl text-base max-w-[85%] shadow-lg ${msg.role === 'user' ? 'bg-purple-100 text-purple-900 rounded-br-md' : 'bg-white/95 text-cyan-700 rounded-bl-md border border-purple-100'}`} style={{wordBreak:'break-word'}}>
                  {msg.role === 'ai' ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="my-3 flex justify-start">
                <div className="px-5 py-3 rounded-2xl text-base bg-white/90 text-cyan-700 border border-purple-100 opacity-70 shadow-md">Thinking...</div>
              </div>
            )}
          </div>
          <form onSubmit={sendMessage} className="flex items-center border-t border-purple-100 px-4 py-4 bg-white/90">
            <input
              className="flex-1 px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:border-purple-400 text-base bg-white/80 placeholder-purple-400 text-black shadow-sm"
              type="text"
              placeholder="Ask anything about this project..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              className="ml-3 px-4 py-3 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 text-white hover:from-purple-600 hover:to-cyan-700 shadow-lg transition-colors disabled:opacity-50"
              disabled={loading || !input.trim()}
            >
              <Sparkles className="w-6 h-6" />
            </button>
          </form>
        </div>
      )}
      <style jsx global>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(60px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fade-out-down {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(60px) scale(0.95); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        .animate-fade-out-down {
          animation: fade-out-down 0.4s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
} 