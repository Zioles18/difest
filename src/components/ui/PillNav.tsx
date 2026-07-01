import React, { useState } from 'react';
import { Link } from '../../lib/router';
export type PillNavItem = {
    label: string;
    href: string;
    ariaLabel?: string;
};
export interface PillNavProps {
    logo: string;
    logoAlt?: string;
    items: PillNavItem[];
    activeHref?: string;
    className?: string;
    baseColor?: string;
    pillColor?: string;
    hoveredPillTextColor?: string;
    pillTextColor?: string;
    onMobileMenuClick?: () => void;
    initialLoadAnimation?: boolean;
}
const PillNav: React.FC<PillNavProps> = ({ logo, logoAlt = 'Logo', items, activeHref, className = '', baseColor = '#fff', pillColor = '#120F17', hoveredPillTextColor = '#120F17', pillTextColor, onMobileMenuClick, }) => {
    const resolvedPillTextColor = pillTextColor ?? baseColor;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        onMobileMenuClick?.();
    };
    const isExternalLink = (href: string) => href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#');
    const isRouterLink = (href?: string) => href && !isExternalLink(href);
    const cssVars = {
        '--base': baseColor,
        '--pill-bg': pillColor,
        '--hover-text': hoveredPillTextColor,
        '--pill-text': resolvedPillTextColor
    } as React.CSSProperties;
    return (<div className="relative z-50 animate-fade-in-up">
      <nav className={`flex items-center justify-between gap-8 max-lg:gap-4 px-6 py-3 max-lg:px-4 max-lg:py-3 rounded-full bg-[var(--base)] backdrop-blur-[12px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] ${className}`} aria-label="Primary" style={cssVars}>
        {isRouterLink(items?.[0]?.href) ? (<Link className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden shrink-0 hover:scale-110 hover:rotate-180 transition-all duration-300" to={items[0].href} aria-label="Home">
            <img className="w-full h-full object-contain" src={logo} alt={logoAlt}/>
          </Link>) : (<a className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden shrink-0 hover:scale-110 hover:rotate-180 transition-all duration-300" href={items?.[0]?.href || '#'} aria-label="Home">
            <img className="w-full h-full object-contain" src={logo} alt={logoAlt}/>
          </a>)}

        <div className="flex-1 justify-center hidden lg:flex">
          <ul className="flex list-none m-0 p-0 gap-2 flex-wrap justify-center">
            {items.map((item, i) => {
            const isActive = activeHref === item.href;
            const isHovered = hoveredIndex === i;
            const content = (<span className="relative flex overflow-hidden w-full h-full items-center justify-center px-4 py-2">
                  <span className={`absolute inset-0 bg-[var(--pill-bg)] rounded-full transition-all duration-300 transform ${isActive || isHovered ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}/>
                  <span className={`relative z-10 font-bold transition-colors duration-300 ${isActive || isHovered ? 'text-[var(--hover-text)]' : 'text-[var(--pill-text)]'}`}>{item.label}</span>
                </span>);
            return (<li key={item.href} className="flex" onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                  {isRouterLink(item.href) ? (<Link to={item.href} className={`relative flex items-center justify-center p-0 rounded-full text-[var(--pill-text)] no-underline font-semibold overflow-hidden transition-colors duration-200 whitespace-nowrap w-full h-full ${isActive ? 'text-[var(--hover-text)]' : ''}`} aria-label={item.ariaLabel || item.label}>
                      {content}
                    </Link>) : (<a href={item.href} className={`relative flex items-center justify-center p-0 rounded-full text-[var(--pill-text)] no-underline font-semibold overflow-hidden transition-colors duration-200 whitespace-nowrap w-full h-full ${isActive ? 'text-[var(--hover-text)]' : ''}`} aria-label={item.ariaLabel || item.label}>
                      {content}
                    </a>)}
                </li>);
        })}
          </ul>
        </div>

        <button className="bg-none border-none cursor-pointer p-2 gap-1 flex-col shrink-0 flex lg:hidden" onClick={toggleMobileMenu} aria-label="Toggle menu">
          <span className={`w-6 h-[2px] bg-[var(--pill-bg)] rounded-[2px] block transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-[6px]' : ''}`}/>
          <span className={`w-6 h-[2px] bg-[var(--pill-bg)] rounded-[2px] block transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`}/>
        </button>
      </nav>

      <div className={`absolute top-full right-0 mt-2 bg-[var(--base)] rounded-[1.5rem] p-4 shadow-[0_10px_40px_rgba(0,0,0,0.1)] min-w-[200px] flex lg:hidden transition-all duration-300 origin-top ${isMobileMenuOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-0 invisible'}`} style={cssVars}>
        <ul className="list-none m-0 p-0 flex flex-col gap-2 w-full">
          {items.map(item => (<li key={item.href}>
              {isRouterLink(item.href) ? (<Link to={item.href} className={`block px-4 py-3 text-[var(--pill-bg)] no-underline font-semibold rounded-[1rem] transition-colors duration-200 hover:bg-black/5 ${activeHref === item.href ? 'text-[var(--pill-bg)] bg-black/5 font-bold' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                  {item.label}
                </Link>) : (<a href={item.href} className={`block px-4 py-3 text-[var(--pill-bg)] no-underline font-semibold rounded-[1rem] transition-colors duration-200 hover:bg-black/5 ${activeHref === item.href ? 'text-[var(--pill-bg)] bg-black/5 font-bold' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                  {item.label}
                </a>)}
            </li>))}
        </ul>
      </div>
    </div>);
};
export default PillNav;
