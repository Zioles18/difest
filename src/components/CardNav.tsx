import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowUpRight, Bell, Sun, Moon, X, Trash2, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ShinyText from './ShinyText';
import { NXLogo } from './NXLogo';
import { useTheme } from '../utils/ThemeContext';
import { auth } from '../utils/auth';
import { getBusinessData, BUSINESS_DATA_UPDATED, NEW_NOTIFICATION, Notification, deleteNotification, clearAllNotifications } from "../utils/store";
import './CardNav.css';

type CardNavLink = {
  label: string;
  href: string;
  ariaLabel: string;
};

export type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
};

export interface CardNavProps {
  logo: string;
  logoAlt?: string;
  items: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
}

const CardNav: React.FC<CardNavProps> = ({
  logo,
  logoAlt = "Logo",
  items,
  className = "",
  ease = "power4.out",
  baseColor = "#fff",
  menuColor,
}) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(() => getBusinessData().notifications);
  const [unreadCount, setUnreadCount] = useState(() => getBusinessData().notifications.length);
  const [showToast, setShowToast] = useState(false);
  const [latestNotification, setLatestNotification] = useState<string>("");
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("NexBiz_profile");
    const email = auth.getCurrentEmail();
    return saved ? JSON.parse(saved) : {
      name: email ? email.split("@")[0] : "User",
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${email || "user"}&backgroundColor=6366f1&textColor=ffffff`
    };
  });

  // Close menu when route changes
  useEffect(() => {
    closeMenu();
    setShowNotifications(false);
  }, [location.pathname]);

  // Listen for store updates and new notifications
  useEffect(() => {
    const handleStoreUpdate = () => {
      setNotifications(getBusinessData().notifications);
    };
    const handleNewNotification = (event: CustomEvent<Notification>) => {
      setLatestNotification(event.detail.text);
      setShowToast(true);
      setUnreadCount(c => c + 1);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setShowToast(false), 3500);
    };
    window.addEventListener(BUSINESS_DATA_UPDATED, handleStoreUpdate);
    window.addEventListener(NEW_NOTIFICATION, handleNewNotification as EventListener);
    return () => {
      window.removeEventListener(BUSINESS_DATA_UPDATED, handleStoreUpdate);
      window.removeEventListener(NEW_NOTIFICATION, handleNewNotification as EventListener);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  const navRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const bellRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleProfileUpdate = (e: any) => setProfile(e.detail);
    window.addEventListener("NexBiz_profile_updated", handleProfileUpdate);
    return () => window.removeEventListener("NexBiz_profile_updated", handleProfileUpdate);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const insideBell = notifRef.current?.contains(target);
      const insidePanel = panelRef.current?.contains(target);
      if (!insideBell && !insidePanel) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      const contentEl = navEl.querySelector('.card-nav-content') as HTMLElement;
      if (contentEl) {
        const wasVisible = contentEl.style.visibility;
        const wasPointerEvents = contentEl.style.pointerEvents;
        const wasPosition = contentEl.style.position;
        const wasHeight = contentEl.style.height;

        contentEl.style.visibility = 'visible';
        contentEl.style.pointerEvents = 'auto';
        contentEl.style.position = 'static';
        contentEl.style.height = 'auto';

        contentEl.offsetHeight;

        const topBar = 60;
        const padding = 16;
        const contentHeight = contentEl.scrollHeight;
        
        contentEl.style.visibility = wasVisible;
        contentEl.style.pointerEvents = wasPointerEvents;
        contentEl.style.position = wasPosition;
        contentEl.style.height = wasHeight;

        // Add extra padding/buffer to prevent cutoff
        return topBar + contentHeight + 40; 
      }
    } else {
      // Desktop also needs a dynamic height now that we added a card
      const contentEl = navEl.querySelector('.card-nav-content') as HTMLElement;
      if (contentEl) {
        return 60 + contentEl.scrollHeight + 32;
      }
    }
    return 300; // Increased base height
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 60, overflow: 'hidden' });
    gsap.set(cardsRef.current, { y: 30, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.2,
      ease,
      onComplete: () => {
        gsap.set(navEl, { overflow: 'visible' });
      }
    });

    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.15, ease, stagger: 0.05 }, '-=0.1');

    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [ease, items]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });

        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);

  const toggleMenu = () => {
    // Ensure timeline is fresh
    const tl = createTimeline();
    if (!tl) return;
    tlRef.current = tl;

    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback('onReverseComplete', () => {
        setIsExpanded(false);
        if (navRef.current) {
          gsap.set(navRef.current, { height: 60, overflow: 'hidden' });
        }
      });
      tl.reverse(0);
    }
  };

  const closeMenu = () => {
    if (isExpanded) {
      setIsHamburgerOpen(false);
      const tl = tlRef.current;
      if (tl) {
        tl.eventCallback('onReverseComplete', () => {
          setIsExpanded(false);
          // Ensure the nav is reset properly
          if (navRef.current) {
            gsap.set(navRef.current, { height: 60, overflow: 'hidden' });
          }
        });
        tl.reverse(0);
      }
    }
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  const handleLinkClick = () => {
    setShowNotifications(false);
    closeMenu();
  };

  return (
    <div className={`card-nav-container ${className}`}>
      <nav ref={navRef} className={`card-nav ${isExpanded ? 'open' : ''}`} style={{ 
        backgroundColor: baseColor,
        transition: 'background-color 0.5s cubic-bezier(0.22,1,0.36,1)'
      }}>
        <div className="card-nav-top overflow-visible">
          <div
            className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? 'Close menu' : 'Open menu'}
            tabIndex={0}
            style={{ color: menuColor || '#000' }}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </div>

          <div className="logo-container">
            <div className="flex items-center gap-3">
              <NXLogo size={40} />
              <span className="font-display font-bold text-xl sm:text-2xl tracking-tighter">
                <ShinyText 
                  text="NexBiz" 
                  color={theme === "dark" ? "#e2e8f0" : "#1e293b"} 
                  shineColor="#60a5fa" 
                  speed={3} 
                  yoyo={true}
                />
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Theme toggle clicked!');
                toggleTheme();
              }}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer pointer-events-auto z-40"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            {/* Notifications */}
            <div className="relative z-50" ref={notifRef}>
              <button
                type="button"
                ref={bellRef}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!showNotifications && bellRef.current) {
                    const rect = bellRef.current.getBoundingClientRect();
                    const isMobile = window.innerWidth < 640;
                    setDropdownPos({
                      top: rect.bottom + 8,
                      right: isMobile ? 16 : window.innerWidth - rect.right,
                    });
                    setUnreadCount(0);
                  }
                  setShowNotifications((p) => !p);
                  closeMenu();
                }}
                className="relative z-50 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all cursor-pointer pointer-events-auto"
                aria-label="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Panel via Portal - escapes ALL overflow/transform constraints */}
              {showNotifications && createPortal(
                <AnimatePresence>
                  <motion.div
                    ref={panelRef}
                    key="notif-panel"
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    style={{ 
                      position: 'fixed', 
                      top: dropdownPos.top, 
                      right: dropdownPos.right, 
                      zIndex: 9999 
                    }}
                    className="w-[320px] max-w-[calc(100vw-32px)] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl shadow-slate-900/15 dark:shadow-black/40 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
                      <div className="flex items-center gap-2">
                        {notifications.length > 0 && (
                          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full">
                            {notifications.length} {notifications.length === 1 ? 'Item' : 'Items'}
                          </span>
                        )}
                        <button onClick={() => setShowNotifications(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[280px] overflow-y-auto">
                      <AnimatePresence initial={false}>
                        {notifications.length === 0 ? (
                          <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="px-4 py-8 text-center"
                          >
                            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                              <Bell className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                            </div>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">All caught up!</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">No new notifications</p>
                          </motion.div>
                        ) : (
                          notifications.map((n) => (
                            <motion.div
                              key={n.id}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
                              onClick={() => deleteNotification(n.id)}
                              className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0 group cursor-pointer"
                            >
                              <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.dot}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">{n.text}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{n.time}</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(n.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-all rounded-md flex-shrink-0"
                                aria-label="Dismiss notification"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                          {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearAllNotifications();
                            setShowNotifications(false);
                          }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Clear all
                        </button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>,
                document.body
              )}

              {/* Toast notification */}
              <AnimatePresence>
                {showToast && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => {
                      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
                      setShowToast(false);
                      setShowNotifications(true);
                      if (bellRef.current) {
                        const rect = bellRef.current.getBoundingClientRect();
                        setDropdownPos({
                          top: rect.bottom + 8,
                          right: window.innerWidth - rect.right,
                        });
                      }
                    }}
                    className="fixed top-20 right-4 z-[2000] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 max-w-xs cursor-pointer"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 flex-1 min-w-0 truncate">{latestNotification}</p>
                    <button
                      onClick={() => setShowToast(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile avatar */}
            <NavLink
              to="/profile"
              onClick={handleLinkClick}
              aria-label="Go to profile"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-400">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </NavLink>
          </div>
        </div>

        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {(items || []).slice(0, 3).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
              ref={setCardRef(idx)}
              style={{ 
                backgroundColor: item.bgColor, 
                color: item.textColor,
                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
              }}
            >
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {item.links?.map((lnk, i) => (
                  <NavLink
                    key={`${lnk.label}-${i}`}
                    to={lnk.href}
                    aria-label={lnk.ariaLabel}
                    className="nav-card-link"
                    end={lnk.href === "/"}
                    onClick={handleLinkClick}
                  >
                    <ArrowUpRight className="nav-card-link-icon" aria-hidden="true" />
                    {lnk.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {/* Sign Out Section in Menu */}
          <div 
            className="nav-card nav-logout-card"
            style={{ 
              backgroundColor: theme === 'dark' ? 'rgba(244, 63, 94, 0.1)' : '#fff1f2',
              color: theme === 'dark' ? '#fb7185' : '#e11d48',
              border: theme === 'dark' ? '1px solid rgba(244, 63, 94, 0.2)' : '1px solid #fecdd3'
            }}
          >
            <div className="nav-card-label">Session</div>
            <button
              onClick={() => {
                auth.logout();
                navigate('/login');
              }}
              className="nav-card-link font-bold"
            >
              <LogOut className="nav-card-link-icon" />
              Sign Out from NexBiz
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default CardNav;
