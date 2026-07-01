import React from 'react';

export interface FerrofluidProps {
    className?: string;
    dpr?: number;
    paused?: boolean;
    colors?: string[];
    speed?: number;
    scale?: number;
    turbulence?: number;
    fluidity?: number;
    rimWidth?: number;
    sharpness?: number;
    shimmer?: number;
    glow?: number;
    flowDirection?: 'up' | 'down' | 'left' | 'right';
    opacity?: number;
}
const Ferrofluid: React.FC<FerrofluidProps> = ({ className = '', colors = ['#0ea5e9', '#6366f1', '#7c3aed'], }) => {
    return (<>
      <style>{`
        @keyframes ferrofluidShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div className={`w-full h-full absolute top-0 left-0 overflow-hidden ${className}`} style={{
            background: `linear-gradient(135deg, ${colors[0] || '#0ea5e9'}, ${colors[1] || '#6366f1'}, ${colors[2] || '#7c3aed'})`,
            backgroundSize: '400% 400%',
            animation: 'ferrofluidShift 15s ease infinite',
        }}/>
    </>);
};
export default Ferrofluid;
