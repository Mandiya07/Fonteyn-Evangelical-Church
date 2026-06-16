import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: "Ngiyanemukela! Welcome to Fonteyn Evangelical Church digital hub. I can guide you on service times, minister details, our values, donations, or upcoming events. How can I pray for or serve you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMsg = {
      sender: 'user' as const,
      text: userMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: "I apologize, there was a connection error. But you are always welcome! How else can I assist you?",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="church-ai-chat-widget">
      {/* Circle Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-white hover:bg-neutral-800 rounded-full flex items-center justify-center shadow-2xl border-2 border-secondary relative transition-colors duration-300 group"
        title="Ask Church AI"
        id="btn-chat-toggle"
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageSquare className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
          </span>
        )}
      </button>

      {/* Floating Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-3xl border border-gray-100 flex flex-col overflow-hidden"
            id="chat-drawer-container"
          >
            {/* Chat Header */}
            <div className="bg-primary px-4 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary/15 rounded-xl border border-secondary text-secondary">
                  <Bot className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-header text-sm font-semibold text-white tracking-wide">FEC Hope Assistant</h3>
                  <p className="text-[11px] text-gray-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-secondary" /> Powered by Gemini AI (Eswatini Guide)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white transition-colors p-1"
                id="header-close-chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Pane */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4" id="chat-messages-pane">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 max-w-[85%] ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`p-1.5 rounded-lg border text-xs shrink-0 ${m.sender === 'user' ? 'bg-primary text-secondary border-primary/20' : 'bg-secondary text-primary border-secondary/20'}`}>
                      {m.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    </div>
                    <div className="flex flex-col">
                      <div
                        className={`text-xs px-3.5 py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap shadow-sm ${
                          m.sender === 'user'
                            ? 'bg-primary text-white rounded-tr-none'
                            : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className={`text-[9px] text-gray-400 mt-1 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {m.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 max-w-[80%]">
                    <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500 animate-pulse">
                      <Bot className="w-3 h-3" />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm text-xs text-gray-500 flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex flex-nowrap overflow-x-auto gap-1.5 scrollbar-none" id="suggestions-container">
              {[
                { label: '⛪ Service Times', text: 'What are the service hours on Sunday?' },
                { label: '🙏 Submit Prayer', text: 'How do I request a prayer?' },
                { label: '💰 Donation Info', text: 'How can I pay my Tithes or Offering?' },
                { label: '📞 Contact', text: 'What is the church telephone and address?' },
              ].map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(s.text);
                  }}
                  className="text-[10px] whitespace-nowrap px-2.5 py-1 bg-white hover:bg-secondary/10 hover:border-secondary border border-gray-200 rounded-full text-gray-600 transition"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex items-center space-x-2 bg-white" id="chatbot-form">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask our AI assistant..."
                className="flex-1 text-xs border border-gray-200 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary px-3.5 py-2.5 rounded-xl bg-gray-50/50"
                id="chatbot-input"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-primary text-secondary hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-primary transition-colors rounded-xl flex items-center justify-center shrink-0 border border-secondary"
                id="btn-chatbot-send"
              >
                <Send className="w-4 h-4 text-secondary" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
