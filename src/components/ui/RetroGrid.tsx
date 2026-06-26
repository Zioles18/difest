import React from "react";

export function RetroGrid() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-20">
      {/* Grid */}
      <div 
        className="absolute inset-0 [perspective:200px]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          color: 'rgba(99, 102, 241, 0.15)',
          backgroundSize: '40px 40px',
          height: '200%',
          width: '150%',
          left: '-25%',
          top: '-50%',
          transform: 'rotateX(25deg)',
          maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
        }}
      />

      {/* Animation Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-transparent to-slate-50 dark:to-slate-950" />
      
      {/* Moving lines or particles could go here for extra "React Bits" flair */}
      <div className="absolute inset-0 overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent animate-scanline" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanline {
          from { transform: translateY(-100%); }
          to { transform: translateY(1000%); }
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
      `}} />
    </div>
  );
}
