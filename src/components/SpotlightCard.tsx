import React, { useRef, useState, ReactNode } from "react";
import { motion } from "motion/react";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  allowOverflow?: boolean;
}

export function SpotlightCard({ children, className = "", onClick, allowOverflow = false }: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={divRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
      }}
      className={`bento-card relative group ${!allowOverflow ? "overflow-hidden" : ""} ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {/* Background Spotlight Layer with its own clipping */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit] z-0">
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            opacity,
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(99, 102, 241, 0.15), transparent 40%)`,
          }}
        />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}
