import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { AIChat } from "../components/AIChat";
import { useTheme } from "../utils/ThemeContext";

export type DateRange = "7d" | "30d" | "12m";

export function DashboardLayout() {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [isModalActive, setIsModalActive] = useState(false);
  const isDark = theme === "dark";
  const location = useLocation();

  useEffect(() => {
    const handleModalState = (e: any) => setIsModalActive(e.detail?.open ?? false);
    window.addEventListener("NexBiz_modal_state", handleModalState);

    return () => window.removeEventListener("NexBiz_modal_state", handleModalState);
  }, []);

  // Determine active tab name based on pathname
  let activeTab = "Overview";
  if (location.pathname === "/orders") activeTab = "Orders";
  if (location.pathname === "/customers") activeTab = "Customers";
  if (location.pathname === "/analytics") activeTab = "Analytics";
  if (location.pathname === "/settings") activeTab = "Settings";
  if (location.pathname === "/profile") activeTab = "Profile";

  return (
    <div className="flex h-screen bg-transparent overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {isModalActive && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000]" />
        )}

        <Header
          setSidebarOpen={setSidebarOpen}
          dateRange={dateRange}
          setDateRange={setDateRange}
          activeTab={activeTab}
        />

        <main className={`flex-1 w-full relative transition-all duration-300 ${isModalActive ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <div className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-8">
            <Outlet context={{ dateRange, activeTab }} />
          </div>
        </main>
      </div>
      <AIChat />
    </div>
  );
}
