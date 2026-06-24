import React, { useState } from 'react';
import { Link } from '../lib/router';
import './PillNav.css';

export type PillNavItem = { label: string; href: string; ariaLabel?: string; };

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

const PillNav: React.FC<PillNavProps> = ({
  logo,
  logoAlt = 'Logo',
  items,
  activeHref,
  className = '',
  baseColor = '#fff',
  pillColor = '#120F17',
  hoveredPillTextColor = '#120F17',
  pillTextColor,
  onMobileMenuClick,
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    onMobileMenuClick?.();
  };

  const isExternalLink = (href: string) =>
    href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#');
  const isRouterLink = (href?: string) => href && !isExternalLink(href);

  const cssVars = {
    '--base': baseColor,
    '--pill-bg': pillColor,
    '--hover-text': hoveredPillTextColor,
    '--pill-text': resolvedPillTextColor
  } as React.CSSProperties;

  return (
    <div className="pill-nav-container animate-fade-in-up z-50 relative">
      <nav className={`pill-nav ${className}`} aria-label="Primary" style={cssVars}>
        {isRouterLink(items?.[0]?.href) ? (
          <Link className="pill-logo hover:scale-110 hover:rotate-180 transition-all duration-300" to={items[0].href} aria-label="Home">
            <img src={logo} alt={logoAlt} />
          </Link>
        ) : (
          <a className="pill-logo hover:scale-110 hover:rotate-180 transition-all duration-300" href={items?.[0]?.href || '#'} aria-label="Home">
            <img src={logo} alt={logoAlt} />
          </a>
        )}

        <div className="pill-nav-items desktop-only">
          <ul className="pill-list">
            {items.map((item, i) => {
              const isActive = activeHref === item.href;
              const isHovered = hoveredIndex === i;
              const content = (
                <span className="relative flex overflow-hidden w-full h-full items-center justify-center px-4 py-2">
                  <span className={`absolute inset-0 bg-[var(--pill-bg)] rounded-full transition-all duration-300 transform ${isActive || isHovered ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                  <span className={`relative z-10 font-bold transition-colors duration-300 ${isActive || isHovered ? 'text-[var(--hover-text)]' : 'text-[var(--pill-text)]'}`}>{item.label}</span>
                </span>
              );

              return (
                <li key={item.href} className="flex" onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                  {isRouterLink(item.href) ? (
                    <Link to={item.href} className={`pill flex items-center justify-center w-full h-full ${isActive ? 'is-active' : ''}`} aria-label={item.ariaLabel || item.label}>
                      {content}
                    </Link>
                  ) : (
                    <a href={item.href} className={`pill flex items-center justify-center w-full h-full ${isActive ? 'is-active' : ''}`} aria-label={item.ariaLabel || item.label}>
                      {content}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <button className="mobile-menu-button mobile-only" onClick={toggleMobileMenu} aria-label="Toggle menu">
          <span className={`hamburger-line transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
          <span className={`hamburger-line transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
        </button>
      </nav>

      <div className={`mobile-menu-popover mobile-only transition-all duration-300 origin-top ${isMobileMenuOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-0 invisible'}`} style={cssVars}>
        <ul className="mobile-menu-list">
          {items.map(item => (
            <li key={item.href}>
              {isRouterLink(item.href) ? (
                <Link to={item.href} className={`mobile-menu-link ${activeHref === item.href ? 'text-[var(--pill-bg)] font-bold' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                  {item.label}
                </Link>
              ) : (
                <a href={item.href} className={`mobile-menu-link ${activeHref === item.href ? 'text-[var(--pill-bg)] font-bold' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
