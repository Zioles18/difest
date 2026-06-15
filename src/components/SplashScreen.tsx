import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap } from "lucide-react";
import { RetroGrid } from "./RetroGrid";
import { SplitText } from "./SplitText";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 1000); // Increased wait for exit animation
    }, 3200); // Slightly longer for the more complex entrance

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.05, 
            filter: "blur(40px)",
            transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } 
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 overflow-hidden"
        >
          {/* Background effects */}
          <RetroGrid />
          
          <div className="absolute inset-0 z-0">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[150px]" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-center gap-6 mb-12"
            >
              <motion.div 
                initial={{ rotate: -180, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.8, 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 15 
                }}
                className="w-20 h-20 rounded-3xl accent-gradient flex items-center justify-center shadow-[0_0_50px_-12px_rgba(79,70,229,0.5)]"
              >
                <Zap className="w-10 h-10 text-white" />
              </motion.div>
              <div className="flex flex-col items-start translate-y-1">
                <SplitText 
                  text="NexBiz" 
                  className="text-7xl font-display font-bold tracking-tighter text-white"
                  delay={0.8}
                />
              </div>
            </motion.div>

            <div className="h-1 w-64 bg-slate-800/50 rounded-full mx-auto overflow-hidden backdrop-blur-md">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: "100%" }}
                 transition={{ duration: 2.5, ease: [0.65, 0, 0.35, 1] }}
                 className="h-full accent-gradient"
               />
            </div>
            
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, letterSpacing: "0.4em" }}
              transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
              className="mt-8 text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]"
            >
              Intelligence for Business Excellence
            </motion.p>
          </div>
          
          {/* Subtle noise/texture overlay if needed, currently skipping for performance */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
