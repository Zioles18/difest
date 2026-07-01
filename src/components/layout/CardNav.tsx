import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate, useLocation } from '../../lib/router';
import { ArrowUpRight, Bell, Sun, Moon, X, Trash2, LogOut } from '../Icons';
import ShinyText from '../ui/ShinyText';
import { NXLogo } from '../ui/NXLogo';
import { useTheme } from '../../utils/ThemeContext';
import { auth } from '../../utils/auth';
import { getBusinessData, BUSINESS_DATA_UPDATED, NEW_NOTIFICATION, Notification, deleteNotification, clearAllNotifications } from "../../utils/store";

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
const CardNav: React.FC<CardNavProps> = ({ logo, logoAlt = "Logo", items, className = "", baseColor = "#fff", menuColor, }) => {
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
    const navRef = useRef<HTMLDivElement | null>(null);
    const notifRef = useRef<HTMLDivElement | null>(null);
    const bellRef = useRef<HTMLButtonElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        setIsHamburgerOpen(false);
        setIsExpanded(false);
        setShowNotifications(false);
    }, [location.pathname]);
    useEffect(() => {
        const handleStoreUpdate = () => {
            setNotifications(getBusinessData().notifications);
        };
        const handleNewNotification = (event: CustomEvent<Notification>) => {
            setLatestNotification(event.detail.text);
            setShowToast(true);
            setUnreadCount(c => c + 1);
            if (toastTimeoutRef.current)
                clearTimeout(toastTimeoutRef.current);
            toastTimeoutRef.current = setTimeout(() => setShowToast(false), 3500);
        };
        window.addEventListener(BUSINESS_DATA_UPDATED, handleStoreUpdate);
        window.addEventListener(NEW_NOTIFICATION, handleNewNotification as EventListener);
        return () => {
            window.removeEventListener(BUSINESS_DATA_UPDATED, handleStoreUpdate);
            window.removeEventListener(NEW_NOTIFICATION, handleNewNotification as EventListener);
            if (toastTimeoutRef.current)
                clearTimeout(toastTimeoutRef.current);
        };
    }, []);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
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
    const toggleMenu = () => {
        if (!isExpanded) {
            setIsHamburgerOpen(true);
            setIsExpanded(true);
        }
        else {
            setIsHamburgerOpen(false);
            setIsExpanded(false);
        }
    };
    const closeMenu = () => {
        if (isExpanded) {
            setIsHamburgerOpen(false);
            setIsExpanded(false);
        }
    };
    const handleLinkClick = () => {
        setShowNotifications(false);
        closeMenu();
    };
    return (<div className={`relative z-[10000] w-full ${className}`}>
      <nav ref={navRef} className={`rounded-[8px] px-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-[10px] relative overflow-x-hidden overflow-y-visible transition-all duration-500 w-full box-border hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] ${isExpanded ? 'rounded-[12px] shadow-[0_10px_40px_rgba(0,0,0,0.15)]' : ''}`} style={{
            backgroundColor: baseColor,
            height: isExpanded ? 'auto' : '60px',
            overflow: isExpanded ? 'visible' : 'hidden',
        }}>
        <div className="flex items-center justify-between h-[60px] gap-3 w-full box-border overflow-visible px-4">
          <div className="flex flex-col gap-[6px] cursor-pointer p-2 w-10 h-10 justify-center items-center transition-transform duration-300 ease-out shrink-0 hover:scale-110" onClick={toggleMenu} role="button" aria-label={isExpanded ? 'Close menu' : 'Open menu'} tabIndex={0} style={{ color: menuColor || '#000' }}>
            <div className={`w-6 h-[2px] bg-current transition-all duration-300 ease-out rounded-[2px] ${isHamburgerOpen ? 'rotate-45 translate-y-[5px]' : ''}`}/>
            <div className={`w-6 h-[2px] bg-current transition-all duration-300 ease-out rounded-[2px] ${isHamburgerOpen ? '-rotate-45 -translate-y-[5px]' : ''}`}/>
          </div>

          <div className="flex-1 flex justify-center items-center min-w-0 ml-auto mr-auto sm:ml-4 sm:mr-auto">
            <div className="flex items-center gap-3">
              <NXLogo size={40}/>
              <span className="font-display font-bold text-xl sm:text-2xl tracking-tighter">
                <ShinyText text="NexBiz" color={theme === "dark" ? "#e2e8f0" : "#1e293b"} shineColor="#60a5fa" speed={3} yoyo={true}/>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-3 max-sm:gap-1 max-[480px]:gap-[2px] ml-auto">
            
            <button type="button" onClick={(e) => {
            e.stopPropagation();
            toggleTheme();
        }} className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer pointer-events-auto z-40" aria-label="Toggle theme">
              {theme === "light" ? <Sun className="w-[18px] h-[18px]"/> : <Moon className="w-[18px] h-[18px]"/>}
            </button>

            
            <div className="relative z-50" ref={notifRef}>
              <button type="button" ref={bellRef} onClick={(e) => {
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
        }} className="relative z-50 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all cursor-pointer pointer-events-auto" aria-label="Notifications">
                <Bell className="w-4.5 h-4.5"/>
                {unreadCount > 0 && (<span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>)}
              </button>

              
              {showNotifications && createPortal(<div ref={panelRef} style={{
                position: 'fixed',
                top: dropdownPos.top,
                right: dropdownPos.right,
                zIndex: 9999
            }} className="animate-fade-in w-[320px] max-w-[calc(100vw-32px)] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl shadow-slate-900/15 dark:shadow-black/40 overflow-hidden">
                    
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
                      <div className="flex items-center gap-2">
                        {notifications.length > 0 && (<span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full">
                            {notifications.length} {notifications.length === 1 ? 'Item' : 'Items'}
                          </span>)}
                        <button onClick={() => setShowNotifications(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5">
                          <X className="w-4 h-4"/>
                        </button>
                      </div>
                    </div>

                    
                    <div className="max-h-[280px] overflow-y-auto">
                        {notifications.length === 0 ? (<div className="px-4 py-8 text-center animate-fade-in">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                              <Bell className="w-5 h-5 text-slate-400 dark:text-slate-500"/>
                            </div>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">All caught up!</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">No new notifications</p>
                          </div>) : (notifications.map((n) => (<div key={n.id} onClick={() => deleteNotification(n.id)} className="animate-fade-in flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0 group cursor-pointer">
                                <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.dot}`}/>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">{n.text}</p>
                                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{n.time}</p>
                                </div>
                                <button onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                }} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-all rounded-md flex-shrink-0" aria-label="Dismiss notification">
                                  <X className="w-3.5 h-3.5"/>
                                </button>
                              </div>)))}
                    </div>

                    
                    {notifications.length > 0 && (<div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                          {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                        </span>
                        <button onClick={(e) => {
                    e.stopPropagation();
                    clearAllNotifications();
                    setShowNotifications(false);
                }} className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors">
                          <Trash2 className="w-3 h-3"/>
                          Clear all
                        </button>
                      </div>)}
                  </div>, document.body)}

              
                {showToast && (<div onClick={() => {
                if (toastTimeoutRef.current)
                    clearTimeout(toastTimeoutRef.current);
                setShowToast(false);
                setShowNotifications(true);
                if (bellRef.current) {
                    const rect = bellRef.current.getBoundingClientRect();
                    setDropdownPos({
                        top: rect.bottom + 8,
                        right: window.innerWidth - rect.right,
                    });
                }
            }} className="animate-fade-in fixed top-20 right-4 z-[2000] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 max-w-xs cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"/>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 flex-1 min-w-0 truncate">{latestNotification}</p>
                    <button onClick={() => setShowToast(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex-shrink-0">
                      <X className="w-4 h-4"/>
                    </button>
                  </div>)}
            </div>

            
            <NavLink to="/profile" onClick={handleLinkClick} aria-label="Go to profile">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-400">
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover"/>
              </div>
            </NavLink>
          </div>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-4 gap-3 py-3 md:pb-3 max-md:pb-8 transition-all duration-500 ease-out px-4 pb-4 ${isExpanded ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-4 invisible'}`} aria-hidden={!isExpanded}>
          {(items || []).slice(0, 3).map((item, idx) => (<div key={`${item.label}-${idx}`} className="rounded-[4px] p-5 max-md:p-4 flex flex-col gap-3" style={{
                backgroundColor: item.bgColor,
                color: item.textColor,
                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
            }}>
              <div className="text-sm font-semibold opacity-80">{item.label}</div>
              <div className="flex flex-col gap-2">
                {item.links?.map((lnk, i) => (<NavLink key={`${lnk.label}-${i}`} to={lnk.href} aria-label={lnk.ariaLabel} className="flex items-center gap-[6px] text-base font-medium no-underline text-inherit transition-all duration-200 ease-out hover:translate-x-1 hover:opacity-90" end={lnk.href === "/"} onClick={handleLinkClick}>
                    <ArrowUpRight className="w-4 h-4" aria-hidden="true"/>
                    {lnk.label}
                  </NavLink>))}
              </div>
            </div>))}

          
          <div className="rounded-[4px] p-5 max-md:p-4 flex flex-col gap-3 transition-all duration-300 ease-out cursor-pointer hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(244,63,94,0.15)]" style={{
            backgroundColor: theme === 'dark' ? 'rgba(244, 63, 94, 0.1)' : '#fff1f2',
            color: theme === 'dark' ? '#fb7185' : '#e11d48',
            border: theme === 'dark' ? '1px solid rgba(244, 63, 94, 0.2)' : '1px solid #fecdd3'
        }}>
            <div className="text-sm font-semibold opacity-80">Session</div>
            <button onClick={() => {
            auth.logout();
            navigate('/login');
        }} className="border-none bg-none p-0 text-left w-full flex items-center gap-[6px] text-base font-medium no-underline text-inherit transition-all duration-200 ease-out hover:translate-x-1 hover:opacity-90 font-bold">
              <LogOut className="w-4 h-4"/>
              Sign Out from NexBiz
            </button>
          </div>
        </div>
      </nav>
    </div>);
};
export default CardNav;
