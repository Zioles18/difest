import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AIChat } from "../components/AIChat";
import Ferrofluid from "../components/Ferrofluid";
import CardNav from "../components/CardNav";
import { useTheme } from "../utils/ThemeContext";

export type DateRange = "7d" | "30d" | "12m";

export function DashboardLayout() {
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [isModalActive, setIsModalActive] = useState(false);
  const isDark = theme === "dark";
  const location = useLocation();

  // Track active tab for UI
  const activeTab = location.pathname === "/"
    ? "Overview"
    : location.pathname.replace("/", "").charAt(0).toUpperCase() + location.pathname.slice(1);

  const cardNavItems = [
    {
      label: "Dashboard",
      bgColor: isDark ? "#1e293b" : "#f1f5f9",
      textColor: isDark ? "#e2e8f0" : "#1e293b",
      links: [
        { label: "Overview", href: "/", ariaLabel: "Go to Overview page" },
        { label: "Analytics", href: "/analytics", ariaLabel: "Go to Analytics page" }
      ]
    },
    {
      label: "Business",
      bgColor: isDark ? "#312e81" : "#eff6ff",
      textColor: isDark ? "#c7d2fe" : "#3730a3",
      links: [
        { label: "Orders", href: "/orders", ariaLabel: "Go to Orders page" },
        { label: "Customers", href: "/customers", ariaLabel: "Go to Customers page" }
      ]
    },
    {
      label: "Account",
      bgColor: isDark ? "#1e1b4b" : "#f3e8ff",
      textColor: isDark ? "#ddd6fe" : "#4c1d95",
      links: [
        { label: "Profile", href: "/profile", ariaLabel: "Go to Profile page" },
        { label: "Settings", href: "/settings", ariaLabel: "Go to Settings page" }
      ]
    }
  ];

  useEffect(() => {
    const handleModalState = (e: any) => setIsModalActive(e.detail?.open ?? false);
    window.addEventListener("NexBiz_modal_state", handleModalState);
    return () => window.removeEventListener("NexBiz_modal_state", handleModalState);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans">
      <Ferrofluid
        className="absolute inset-0 z-0"
        colors={isDark 
          ? ['#0ea5e9', '#6366f1', '#7c3aed'] 
          : ['#0ea5e9', '#6366f1', '#7c3aed']}
        speed={0.4}
        scale={1.6}
        turbulence={1}
        fluidity={0.1}
        rimWidth={0.2}
        sharpness={2.5}
        shimmer={1.5}
        glow={isDark ? 0.8 : 0.9}
        opacity={isDark ? 0.6 : 0.7}
        mixBlendMode={isDark ? "screen" : "multiply"}
      />
      
      <div className="relative z-10 p-4 sm:p-6">
        <CardNav
          logo="/logo.png"
          logoAlt="NexBiz Logo"
          items={cardNavItems}
          baseColor={isDark ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.95)"}
          menuColor={isDark ? "#e2e8f0" : "#1e293b"}
        />
      </div>

      <main className={`flex-1 w-full relative transition-all duration-300 ${isModalActive ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32">
          <Outlet context={{ dateRange, activeTab }} />
        </div>
        <div className="pb-4 sm:pb-10 text-center">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            Created by <span className="text-indigo-500 dark:text-indigo-400">I Putu Ganendra Danadyaksa</span>
          </p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <img src="/logo_sekolah.png" alt="Logo SMK TI Bali Global Denpasar" className="w-5 h-5 object-contain" />
            <p className="text-[10px] text-slate-400 dark:text-slate-500">SMK TI BALI GLOBAL DENPASAR</p>
          </div>
        </div>
      </main>
      
      <AIChat />
    </div>
  );
}
