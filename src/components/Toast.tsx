import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "./Icons";
import { NEW_NOTIFICATION } from "../utils/store";

interface ToastMessage {
  id: string;
  text: string;
  dot: string;
}

export function Toast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleNewNotif = (e: any) => {
      const notif = e.detail;
      const newMessage = {
        id: notif.id || `t${Date.now()}`,
        text: notif.text,
        dot: notif.dot
      };

      setMessages(prev => [...prev, newMessage]);

      // Auto-remove after 4 seconds
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== newMessage.id));
      }, 4000);
    };

    window.addEventListener(NEW_NOTIFICATION, handleNewNotif);
    return () => window.removeEventListener(NEW_NOTIFICATION, handleNewNotif);
  }, []);

  const getIcon = (dot: string) => {
    if (dot.includes("emerald")) return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (dot.includes("amber")) return <AlertCircle className="w-5 h-5 text-amber-500" />;
    if (dot.includes("rose")) return <AlertCircle className="w-5 h-5 text-rose-500" />;
    return <Info className="w-5 h-5 text-indigo-500" />;
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="animate-fade-in pointer-events-auto min-w-[320px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xl flex items-center gap-4 group transition-all duration-300"
        >
          <div className="flex-shrink-0">
            {getIcon(msg.dot)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
              {msg.text}
            </p>
          </div>
          <button
            onClick={() => setMessages(prev => prev.filter(m => m.id !== msg.id))}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
