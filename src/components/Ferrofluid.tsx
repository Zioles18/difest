import React from 'react';
import './Ferrofluid.css';

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

const Ferrofluid: React.FC<FerrofluidProps> = ({
  className = '',
  colors = ['#0ea5e9', '#6366f1', '#7c3aed'],
}) => {
  return (
    <div
      className={`ferrofluid-container ${className}`}
      style={{
        background: `linear-gradient(135deg, ${colors[0] || '#0ea5e9'}, ${colors[1] || '#6366f1'}, ${colors[2] || '#7c3aed'})`,
        backgroundSize: '400% 400%',
        animation: 'ferrofluidShift 15s ease infinite',
      }}
    />
  );
};

export default Ferrofluid;
