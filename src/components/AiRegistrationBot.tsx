import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  GraduationCap,
  HelpCircle,
  FileCheck,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { api } from '../utils/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

interface AiRegistrationBotProps {
  onNavigateToEnrollment?: () => void;
  onNavigateToFees?: () => void;
}

export const AiRegistrationBot: React.FC<AiRegistrationBotProps> = ({
  onNavigateToEnrollment,
  onNavigateToFees,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Assalam-o-Alaikum! Welcome to Oxfored Educational House Digital School Management System. I am your 24/7 AI Admission & Guidance Assistant powered by Gemini 3.8 Flash. How can I help you regarding student registration, automatic roll numbers, or 2026 fee structures?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (userText?: string) => {
    const query = (userText || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.askRegistrationSupport(query);
      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: response.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I encountered a temporary connection issue. You can visit our school office at Brewery Road Quetta near SBK University or call / WhatsApp 03327185311 for immediate assistance.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'Required Documents', query: 'What documents are required for admission at Oxfored Educational House?' },
    { label: '2026 Fee Structure', query: 'What is the fee structure for academic session 2026?' },
    { label: 'Automatic Roll Numbers', query: 'How does the automatic roll number generation work?' },
    { label: 'School Location', query: 'Where is Oxfored Educational House located in Quetta?' },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Trigger Button in Yellow & Green */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white rounded-full shadow-xl hover:shadow-2xl border-2 border-yellow-400 hover:scale-105 transition-all duration-200 cursor-pointer"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-yellow-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-black text-yellow-300 leading-tight">AI Admission Bot</p>
            <p className="text-[10px] text-emerald-200">24/7 Registration Guide</p>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[340px] sm:w-[400px] h-[520px] bg-white rounded-3xl shadow-2xl border-2 border-yellow-400 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white p-3.5 flex items-center justify-between border-b-2 border-yellow-400">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-900 border border-yellow-400 flex items-center justify-center text-yellow-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  AI Registration Support
                  <span className="text-[9px] bg-yellow-400 text-emerald-950 px-1.5 py-0.2 rounded font-black uppercase">
                    Smart
                  </span>
                </h3>
                <p className="text-[10px] text-emerald-200">Oxfored Educational House Quetta</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-300 hover:text-white rounded-md hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-emerald-50/20 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-900 text-yellow-300 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold border border-yellow-400/50">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-emerald-900 text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-800 rounded-bl-none border border-emerald-100 shadow-sm'
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-yellow-400 text-emerald-950 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    U
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2 bg-white rounded-xl border border-slate-200 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-spin" />
                <span>AI Admissions Advisor is formulating guidance...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Preset Buttons */}
          <div className="p-2 bg-emerald-50/60 border-t border-slate-200 flex gap-1.5 overflow-x-auto scrollbar-none">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q.query)}
                disabled={loading}
                className="text-[10px] bg-white hover:bg-yellow-50 text-emerald-950 border border-emerald-200 rounded-full px-2.5 py-1 font-semibold whitespace-nowrap shadow-2xs hover:border-yellow-400 transition-colors cursor-pointer"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about admissions, fees, roll numbers..."
              className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-800"
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2 bg-emerald-900 hover:bg-emerald-950 disabled:bg-slate-300 text-yellow-300 rounded-xl transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
