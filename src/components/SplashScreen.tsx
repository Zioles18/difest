import React, { useEffect, useState } from "react";
import { NXLogo } from "./ui/NXLogo";
import ShinyText from "./ui/ShinyText";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 350);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-950 dark:to-indigo-950 transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="relative z-10 text-center animate-fade-in-up">
        <div className="flex flex-col items-center gap-5">
          <div className="p-2 animate-bounce-in">
            <NXLogo size={85} />
          </div>
          <span className="text-3xl md:text-4xl font-display font-bold tracking-tighter animate-fade-in">
            <ShinyText 
              text="NexBiz" 
              color="#1e293b" 
              shineColor="#60a5fa" 
              speed={3} 
              yoyo={true}
            />
          </span>
        </div>

        <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 rounded-full mx-auto mt-7 animate-expand-width" />
      </div>
    </div>
  );
}