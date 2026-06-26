import React, { useRef, useEffect } from 'react';
import './MagicBento.css';

export interface BentoProps {
  enableSpotlight?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}

export const ParticleCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  style?: React.CSSProperties;
}> = ({ children, className = '', enableTilt = true, enableMagnetism = true, style }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      let transformStr = "";
      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;
        transformStr += `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) `;
      }
      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;
        transformStr += `translate(${magnetX}px, ${magnetY}px)`;
      }
      el.style.transform = transformStr;
      el.style.transition = "transform 0.1s ease-out";
    };
    
    const handleMouseLeave = () => {
      el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translate(0px, 0px)";
      el.style.transition = "transform 0.3s ease-out";
    };
    
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enableTilt, enableMagnetism]);

  return (
    <div ref={cardRef} className={className} style={{ ...style, position: 'relative', overflow: 'hidden' }}>
      {children}
    </div>
  );
};

export const MagicBento: React.FC<BentoProps & { children: React.ReactNode; gridRef: React.RefObject<HTMLDivElement | null> }> = ({
  children
}) => {
  return <>{children}</>;
};
