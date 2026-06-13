import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bell, Search, Menu, ChevronDown, X, Users, ShoppingBag, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "../utils/auth";
import { useTheme } from "../utils/ThemeContext";

interface HeaderProps {
  setSidebarOpen: (isOpen: boolean) => void;
  dateRange: "7d" | "30d" | "12m";
  setDateRange: (range: "7d" | "30d" | "12m") => void;
  activeTab: string;
}

const notifications = [
  { id: 1, text: "New order #2890 received", time: "2m ago", dot: "bg-emerald-500" },
  { id: 2, text: "Monthly report is ready", time: "1h ago", dot: "bg-indigo-500" },
  { id: 3, text: "Server usage at 82%", time: "3h ago", dot: "bg-amber-500" },
];

export function Header({ setSidebarOpen, dateRange, setDateRange, activeTab }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleSearchNav = (path: string) => {
    setSearchQuery("");
    setSearchFocused(false);
    navigate(path);
  };

  // Mock search logic
  useEffect(() => {
    if (!searchQuery) {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => setIsSearching(false), 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Listen to modal state from children pages
  useEffect(() => {
    const handleModalState = (e: any) => setIsModalOpen(e.detail?.open ?? false);
    window.addEventListener("lumina_modal_state", handleModalState);
    return () => window.removeEventListener("lumina_modal_state", handleModalState);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("lumina_profile");
    const email = auth.getCurrentEmail();
    return saved ? JSON.parse(saved) : {
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${email || "user"}&backgroundColor=6366f1&textColor=ffffff`
    };
  });

  useEffect(() => {
    const handleUpdate = (e: any) => {
      setProfile(e.detail);
    };
    window.addEventListener("lumina_profile_updated", handleUpdate);
    return () => window.removeEventListener("lumina_profile_updated", handleUpdate);
  }, []);

  return (
    <header className="h-16 shrink-0 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between px-4 sm:px-6 gap-4 relative transition-all duration-300 bg-white dark:bg-slate-900">
      <div className="flex items-center justify-between w-full gap-4 transition-all duration-300">
      {/* Left: Mobile menu + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 -ml-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-sm tracking-tight">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Workspace</span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-slate-900 dark:text-white font-bold tracking-tight">{activeTab}</span>
        </div>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date range selector */}
        <div className="relative hidden sm:block">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as "7d" | "30d" | "12m")}
            className="appearance-none bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg pl-3 pr-8 py-2 outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-400/30 focus:border-indigo-400 dark:focus:border-indigo-400 transition-all cursor-pointer"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="12m">Last 12 Months</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {/* Mobile date range - compact icon button + select */}
        <div className="relative block sm:hidden">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as "7d" | "30d" | "12m")}
            className="appearance-none bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg pl-2 pr-7 py-2 outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-400/30 focus:border-indigo-400 dark:focus:border-indigo-400 transition-all cursor-pointer"
          >
            <option value="7d">7D</option>
            <option value="30d">30D</option>
            <option value="12m">12M</option>
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Search bar */}
        <div className={`relative hidden sm:flex flex-col items-start transition-all duration-300 ${searchFocused || searchQuery ? "w-48 sm:w-64" : "w-32 sm:w-44"}`}>
          <div className="relative w-full flex items-center z-10">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-400 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800 text-sm rounded-lg py-2 pl-9 pr-3 transition-all outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          
          <AnimatePresence>
            {(searchFocused && searchQuery) && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-12 left-0 w-[calc(100vw-2rem)] sm:w-80 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden z-[1200] max-h-[60vh] overflow-y-auto"
              >
                {isSearching ? (
                  <div className="p-4 flex items-center justify-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                     <svg className="animate-spin h-5 w-5 text-indigo-500 dark:text-indigo-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                     Searching records...
                  </div>
                ) : (
                  <div>
                    <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Results for "{searchQuery}"</span>
                    </div>
                    <button onClick={() => handleSearchNav("/orders")} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-700/50 text-left">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400 flex-shrink-0">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">Orders matching "{searchQuery}"</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Go to Orders page</p>
                      </div>
                    </button>
                    <button onClick={() => handleSearchNav("/customers")} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left">
                       <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 dark:text-emerald-400 flex-shrink-0">
                         <Users className="w-4 h-4" />
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">Customers matching "{searchQuery}"</p>
                         <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Go to Customers page</p>
                       </div>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group overflow-hidden relative"
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === "light" ? (
              <motion.div
                key="sun"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="w-[18px] h-[18px]" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="w-[18px] h-[18px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications((p) => !p)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-[-40px] sm:right-0 top-11 w-[calc(100vw-2rem)] sm:w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/30 z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full">3 New</span>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        console.log(`Notification clicked: ${n.text}`);
                        setShowNotifications(false);
                      }}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                    >
                      <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.dot}`} />
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.text}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{n.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50">
                  <button 
                    onClick={() => {
                      console.log("View all notifications clicked");
                      setShowNotifications(false);
                    }}
                    className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    View all →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile avatar */}
        <NavLink to="/profile" aria-label="Go to profile">
          {({ isActive }) => (
            <div
              className={`w-9 h-9 rounded-full overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 ${
                isActive ? "border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900" : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-400"
              }`}
            >
              <img
                src={profile.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </NavLink>
      </div>
      </div>
    </header>
  );
}
