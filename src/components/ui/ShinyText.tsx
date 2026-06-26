import React from 'react';
interface ShinyTextProps {
    text: string;
    disabled?: boolean;
    speed?: number;
    className?: string;
    color?: string;
    shineColor?: string;
    spread?: number;
    yoyo?: boolean;
    pauseOnHover?: boolean;
    direction?: 'left' | 'right';
    delay?: number;
}
const ShinyText: React.FC<ShinyTextProps> = ({ text, disabled = false, speed = 2, className = '', color = '#b5b5b5', shineColor = '#ffffff', spread = 120, yoyo = false, pauseOnHover = false, direction = 'left', delay = 0 }) => {
    const gradientStyle: React.CSSProperties = {
        backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animationDuration: `${speed}s`,
        animationDelay: `${delay}s`,
        animationDirection: yoyo ? 'alternate' : 'normal'
    };
    if (disabled) {
        return <span className={className} style={{ color }}>{text}</span>;
    }
    return (<>
      <style>{`
        @keyframes shiny-left { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
        @keyframes shiny-right { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .animate-shiny-left { animation: shiny-left linear infinite; }
        .animate-shiny-right { animation: shiny-right linear infinite; }
      `}</style>
      <span className={`inline-block ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''} ${direction === 'left' ? 'animate-shiny-left' : 'animate-shiny-right'} ${className}`} style={gradientStyle}>
        {text}
      </span>
    </>);
};
export default ShinyText;
