import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bell, Search, Menu, ChevronDown, X, Users, ShoppingBag, Sun, Moon, Trash2, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "../utils/auth";
import { useTheme } from "../utils/ThemeContext";
import { getBusinessData, deleteNotification, clearAllNotifications, BUSINESS_DATA_UPDATED, NEW_NOTIFICATION } from "../utils/store";

interface HeaderProps {
  setSidebarOpen: (isOpen: boolean) => void;
  dateRange: "7d" | "30d" | "12m";
  setDateRange: (range: "7d" | "30d" | "12m") => void;
  activeTab: string;
}



export function Header({ setSidebarOpen, dateRange, setDateRange, activeTab }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => getBusinessData().notifications);
  const [unreadCount, setUnreadCount] = useState(() => getBusinessData().notifications.length);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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
    window.addEventListener("NexBiz_modal_state", handleModalState);
    return () => window.removeEventListener("NexBiz_modal_state", handleModalState);
  }, []);

  // Sync notifications from store
  useEffect(() => {
    const syncNotifs = () => {
      const fresh = getBusinessData().notifications;
      setNotifications(fresh);
    };
    const handleNew = () => {
      syncNotifs();
      setUnreadCount(c => c + 1);
    };
    window.addEventListener(BUSINESS_DATA_UPDATED, syncNotifs);
    window.addEventListener(NEW_NOTIFICATION, handleNew);
    return () => {
      window.removeEventListener(BUSINESS_DATA_UPDATED, syncNotifs);
      window.removeEventListener(NEW_NOTIFICATION, handleNew);
    };
  }, []);

  // Reset unread count when bell is opened
  const handleToggleNotifications = () => {
    setShowNotifications(p => !p);
    if (!showNotifications) setUnreadCount(0);
  };

  const handleDismiss = (id: string) => {
    const updated = deleteNotification(id);
    setNotifications(updated.notifications);
  };

  const handleClearAll = () => {
    const updated = clearAllNotifications();
    setNotifications(updated.notifications);
    setShowNotifications(false);
  };

  const handleSignOut = () => {
    auth.logout();
    navigate("/login");
  };

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    }
    if (showNotifications || showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications, showProfileDropdown]);

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("NexBiz_profile");
    const email = auth.getCurrentEmail();
    return saved ? JSON.parse(saved) : {
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${email || "user"}&backgroundColor=6366f1&textColor=ffffff`
    };
  });

  useEffect(() => {
    const handleUpdate = (e: any) => {
      setProfile(e.detail);
    };
    window.addEventListener("NexBiz_profile_updated", handleUpdate);
    return () => window.removeEventListener("NexBiz_profile_updated", handleUpdate);
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
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleToggleNotifications}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
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
                    {notifications.length > 0 && (
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full">
                        {notifications.length} {notifications.length === 1 ? "Item" : "Items"}
                      </span>
                    )}
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
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
                          exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0 group"
                        >
                          <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.dot}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">{n.text}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{n.time}</p>
                          </div>
                          <button
                            onClick={() => handleDismiss(n.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-all rounded-md flex-shrink-0"
                            aria-label="Dismiss"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
                {notifications.length > 0 && (
                  <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{notifications.length} notification{notifications.length !== 1 ? "s" : ""}</span>
                    <button
                      onClick={handleClearAll}
                      className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear all
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700">
              <img
                src={profile.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${showProfileDropdown ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showProfileDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/30 z-50 overflow-hidden"
              >
                {/* Profile info */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-200 dark:border-indigo-700">
                      <img
                        src={profile.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {profile.name || "User"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {auth.getCurrentEmail() || "user@example.com"}
                      </p>
                    </div>
                  </div>
                  <NavLink
                    to="/profile"
                    onClick={() => setShowProfileDropdown(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </NavLink>
                </div>

                {/* Quick actions */}
                <div className="p-2 space-y-1 border-b border-slate-100 dark:border-slate-700/50">
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      {theme === "light" ? (
                        <Moon className="w-4 h-4" />
                      ) : (
                        <Sun className="w-4 h-4" />
                      )}
                      <span>{theme === "light" ? "Light Mode" : "Dark Mode"}</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${theme === "light" ? "bg-slate-200" : "bg-indigo-500"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${theme === "light" ? "translate-x-0.5" : "translate-x-5"}`} />
                    </div>
                  </button>
                </div>

                {/* Sign out */}
                <div className="p-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </div>
    </header>
  );
}
