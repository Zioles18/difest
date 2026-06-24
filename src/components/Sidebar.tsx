import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "../lib/router";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Settings,
  PieChart,
  X,
  LogOut,
  ChevronRight,
  TrendingUp,
  Award
} from "./Icons";
import { NXLogo } from "./NXLogo";
import ShinyText from "./ShinyText";
import { useTheme } from "../utils/ThemeContext";
import { getBusinessData, BUSINESS_DATA_UPDATED } from "../utils/store";
import { auth } from "../utils/auth";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", to: "/" },
  { icon: ShoppingBag, label: "Orders", to: "/orders" },
  { icon: Users, label: "Customers", to: "/customers" },
  { icon: PieChart, label: "Analytics", to: "/analytics" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

function SidebarContent({ setIsOpen }: { setIsOpen: (v: boolean) => void }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [data, setData] = useState(getBusinessData());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("NexBiz_profile");
    const email = auth.getCurrentEmail();
    return saved ? JSON.parse(saved) : {
      name: email ? email.split("@")[0] : "User",
      role: "User",
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${email || "user"}&backgroundColor=6366f1&textColor=ffffff`
    };
  });

  const [isPremium, setIsPremium] = useState(() => {
    const email = auth.getCurrentEmail();
    const key = email ? `NexBiz_settings_${email}` : "NexBiz_settings";
    const saved = localStorage.getItem(key);
    if (!saved) return false;
    try {
      const parsed = JSON.parse(saved);
      return (parsed.billing?.plan === "Business Premium") || (parsed.plan === "Business Premium");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleProfileUpdate = (e: any) => setProfile(e.detail);
    const handleBusinessUpdate = () => setData(getBusinessData());
    const handleModalState = (e: any) => setIsModalOpen(e.detail?.open ?? false);
    const handleSettingsUpdate = () => {
       const email = auth.getCurrentEmail();
       const key = email ? `NexBiz_settings_${email}` : "NexBiz_settings";
       const saved = localStorage.getItem(key);
       if (saved) {
         try {
           const parsed = JSON.parse(saved);
           setIsPremium((parsed.billing?.plan === "Business Premium") || (parsed.plan === "Business Premium"));
         } catch (e) {
           console.error("Error updates settings in sidebar", e);
         }
       }
    };

    window.addEventListener("NexBiz_profile_updated", handleProfileUpdate);
    window.addEventListener(BUSINESS_DATA_UPDATED, handleBusinessUpdate);
    window.addEventListener("NexBiz_settings_updated", handleSettingsUpdate);
    window.addEventListener("NexBiz_modal_state", handleModalState);

    return () => {
      window.removeEventListener("NexBiz_profile_updated", handleProfileUpdate);
      window.removeEventListener(BUSINESS_DATA_UPDATED, handleBusinessUpdate);
      window.removeEventListener("NexBiz_settings_updated", handleSettingsUpdate);
      window.removeEventListener("NexBiz_modal_state", handleModalState);
    };
  }, []);

  const revenueGoal = data.revenueGoal;
  const progress = (data.revenue / revenueGoal) * 100;

  return (
    <div className="w-64 h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/50 transition-all duration-300">
      {/* Logo */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800/50 shrink-0">
        <NavLink to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3.5 group">
          <div className="group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
            <NXLogo size={40} />
          </div>
          <span className="font-display font-bold text-2xl tracking-tighter group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            <ShinyText 
              text="NexBiz" 
              color={theme === "dark" ? "#e2e8f0" : "#1e293b"} 
              shineColor="#60a5fa" 
              speed={3} 
              yoyo={true}
            />
          </span>
        </NavLink>
        <button
          className="lg:hidden p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-5 px-3 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-3">
          Main Menu
        </p>
        <div className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                       ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                       : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 opacity-60" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Global Progress Widget */}
        <div className="mt-8 px-3">
           <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Revenue Goal</span>
              </div>
              <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">${Math.round(data.revenue/1000)}k</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">${revenueGoal/1000}k</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                 <div 
                    style={{ width: `${Math.min(100, progress)}%`, transition: 'width 1s ease-in-out' }}
                    className="h-full bg-indigo-600 rounded-full"
                 />
              </div>
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-2">Real-time sync active <span className="w-1.5 h-1.5 animate-pulse inline-block bg-emerald-500 rounded-full ml-1"/></p>
           </div>
        </div>
      </nav>

      {/* Profile section */}
      <div className="shrink-0 border-t border-slate-100 dark:border-slate-700/50 p-3">
        {isPremium && (
          <div className="mb-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Verified Business</span>
          </div>
        )}
        <NavLink
          to="/profile"
          onClick={() => setIsOpen(false)}
          className={({ isActive }) =>
            `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-indigo-50 dark:bg-indigo-500/10 ring-1 ring-indigo-200 dark:ring-indigo-800"
                : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
            }`
          }
        >
          <div className="relative shrink-0">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-9 h-9 rounded-xl border-2 border-white dark:border-slate-700/50 shadow-sm object-cover"
            />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-700/50 shadow-sm" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{profile.name}</p>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate tracking-tight">{profile.role}</p>
          </div>
        </NavLink>

        <button
          onClick={() => { auth.logout(); navigate("/login"); }}
          className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all text-sm font-bold group text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>

        {/* Creator credit */}
        <div className="mt-3 px-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 text-center leading-relaxed">
            Created by <span className="text-indigo-500 dark:text-indigo-400">I Putu Ganendra Danadyaksa</span>
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
            SMK TI BALI GLOBAL DENPASAR
          </p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  return (
    <>
      {/* Desktop: always visible */}
      <aside className="hidden lg:flex shrink-0 h-screen sticky top-0">
        <SidebarContent setIsOpen={setIsOpen} />
      </aside>

      {/* Mobile: slide-in drawer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[500] lg:hidden transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="fixed top-0 left-0 h-full z-[600] lg:hidden shadow-2xl transition-transform duration-300 translate-x-0"
          >
            <SidebarContent setIsOpen={setIsOpen} />
          </div>
        </>
      )}
    </>
  );
}

