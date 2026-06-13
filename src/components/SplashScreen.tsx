import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800); // Wait for exit animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900 overflow-hidden"
        >
          {/* Background effects */}
          <div className="absolute inset-0 z-0">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px]" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <div className="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <span className="text-5xl font-display font-bold tracking-tighter text-white">
                Lumina
              </span>
            </motion.div>

            <div className="h-1 w-48 bg-slate-800 rounded-full mx-auto overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: "100%" }}
                 transition={{ duration: 2, ease: "easeInOut" }}
                 className="h-full accent-gradient"
               />
            </div>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-6 text-slate-400 font-medium tracking-widest uppercase text-xs"
            >
              Intelligence for Business Excellence
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
