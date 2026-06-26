import React, { useState, useRef, useEffect } from 'react';
import { X, Bot, User, Sparkles, Loader2, Minimize2, Maximize2, MessageSquare } from '../Icons';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const QUESTION_RESPONSES = [
  {
    question: "Bagaimana strategi bisnis yang bagus?",
    response: "Untuk strategi bisnis yang efektif, fokus pada: 1) Value Proposition yang jelas, 2) Memahami target pasar, 3) Rencana pemasaran yang terukur, dan 4) Analisis kompetitor secara rutin!"
  },
  {
    question: "Tips pengembangan web?",
    response: "Untuk pengembangan web yang bagus: 1) Prioritaskan user experience, 2) Gunakan desain responsif, 3) Optimalkan kecepatan loading, dan 4) Lakukan testing secara berkala!"
  },
  {
    question: "Cara manajemen keuangan bisnis?",
    response: "Manajemen keuangan yang baik: 1) Catat semua transaksi, 2) Buat anggaran bulanan, 3) Pisahkan rekening pribadi dan bisnis, dan 4) Analisis laporan keuangan setiap bulan!"
  },
  {
    question: "Tips manajemen tim?",
    response: "Untuk manajemen tim yang solid: 1) Komunikasi terbuka, 2) Berikan feedback rutin, 3) Hargai kontribusi setiap anggota, dan 4) Tetapkan tujuan yang jelas!"
  },
  {
    question: "Bagaimana meningkatkan penjualan?",
    response: "Tips meningkatkan penjualan: 1) Kenali kebutuhan pelanggan, 2) Buat promosi menarik, 3) Berikan layanan pelanggan yang baik, dan 4) Manfaatkan media sosial!"
  }
];

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      text: 'Halo! Saya NexBiz AI, asisten bisnis Anda. Silakan pilih pertanyaan di bawah ini!',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleQuestionClick = (question: string, response: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-10 sm:right-10 z-[100]">
        {isOpen && (
          <div
            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col mb-4 animate-fade-in transition-all duration-300 ${
              isExpanded 
                ? 'w-[92vw] h-[70vh] sm:w-[90vw] sm:h-[80vh] max-w-[360px] sm:max-w-[500px] max-h-[700px]' 
                : 'w-[92vw] h-[480px] sm:w-[90vw] sm:h-[550px] max-w-[360px] sm:max-w-[420px]'
            }`}
          >
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">NexBiz AI</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isTyping ? 'Mengetik...' : 'Siap membantu'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  aria-label={isExpanded ? 'Minimize' : 'Expand'}
                >
                  {isExpanded ? (
                    <Minimize2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-slate-50 dark:bg-slate-900/50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 animate-fade-in ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-sm'
                    }`}
                  >
                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-b-2xl">
              <div className="flex flex-wrap gap-2">
                {QUESTION_RESPONSES.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionClick(item.question, item.response)}
                    disabled={isTyping}
                    className="px-2 py-1.5 sm:px-3 sm:py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                  >
                    {item.question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 text-white hover:scale-105 active:scale-95 transition-transform duration-300"
      >
          {isOpen ? (
              <X className="w-4 h-4 animate-fade-in" />
          ) : (
              <Sparkles className="w-4 h-4 animate-fade-in" />
          )}
      </button>
    </div>
  );
}
