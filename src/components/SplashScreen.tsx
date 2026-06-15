import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NXLogo } from "./NXLogo";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 350);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: "easeOut" } }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-slate-950"
        >
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.22, 1, 0.36, 1] 
              }}
              className="flex flex-col items-center gap-5"
            >
              <motion.div
                initial={{ 
                  y: -100, 
                  rotate: -720, 
                  scale: 0.5, 
                  opacity: 0 
                }}
                animate={{ 
                  y: 0, 
                  rotate: 0, 
                  scale: 1, 
                  opacity: 1 
                }}
                transition={{ 
                  duration: 0.9, 
                  delay: 0.1, 
                  type: "spring", 
                  stiffness: 180,
                  damping: 18
                }}
                className="p-2"
              >
                <NXLogo size={85} />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, y: 8, letterSpacing: "0.1em" }}
                animate={{ opacity: 1, y: 0, letterSpacing: "0em" }}
                transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                className="text-3xl md:text-4xl font-display font-bold tracking-tighter text-slate-900 dark:text-white"
              >
                NexBiz
              </motion.span>
            </motion.div>

            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "120px", opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.7, 
                ease: [0.65, 0, 0.35, 1] 
              }}
              className="h-1.5 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 rounded-full mx-auto mt-7"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}