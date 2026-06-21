import React, { useState, useEffect } from "react";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useOutletContext } from "react-router-dom";
import { KPICard } from "../components/KPICard";
import { DashboardChart } from "../components/DashboardChart";
import { ActionItems } from "../components/ActionItems";
import { SplitText } from "../components/SplitText";
import { RotatingText } from "../components/RotatingText";
import type { DateRange } from "../layouts/DashboardLayout";
import { auth } from "../utils/auth";
import { getBusinessData, BUSINESS_DATA_UPDATED, type BusinessData } from "../utils/store";

export function Overview() {
  const { dateRange, activeTab } = useOutletContext<{ dateRange: DateRange; activeTab: string }>();
  
  const [data, setData] = useState<BusinessData>(getBusinessData());

  useEffect(() => {
    const handleDataUpdate = () => setData(getBusinessData());
    window.addEventListener(BUSINESS_DATA_UPDATED, handleDataUpdate);
    return () => window.removeEventListener(BUSINESS_DATA_UPDATED, handleDataUpdate);
  }, []);

  const profile = (() => {
    try { return JSON.parse(localStorage.getItem("NexBiz_profile") || "{}"); } catch { return {}; }
  })();
  const greetingName = profile.name || auth.getCurrentEmail()?.split("@")[0] || "User";

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } },
      }}
    >
      <div className="mb-8">
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
          }}
        >
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <SplitText
              text="Good"
              className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
              delay={0.05}
            />
            <div className="relative inline-flex items-center">
              <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-400/20 rounded-xl blur-sm"></div>
              <RotatingText
                texts={["morning", "afternoon", "evening", "day"]}
                mainClassName="font-display text-3xl sm:text-4xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 relative z-10"
                staggerDuration={0.03}
                staggerFrom="last"
                rotationInterval={3500}
                splitBy="characters"
              />
            </div>
            <SplitText
              text={", " + greetingName + "!"}
              className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
              delay={0.05}
            />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-base font-medium">
            Here's what's happening with your{" "}
            <span className="inline-flex items-center gap-1">
              <RotatingText
                texts={["business", "team", "revenue", "growth"]}
                mainClassName="text-base font-bold text-indigo-600 dark:text-indigo-400"
                staggerDuration={0.02}
                rotationInterval={2800}
                splitBy="characters"
              />
            </span>{" "}
            today.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <KPICard
          title="Total Revenue"
          value={`$${data.revenue.toLocaleString()}`}
          trend="+12.5% from last period"
          trendPositive={true}
          icon={DollarSign}
          sparklineData={[{ value: 20 }, { value: 30 }, { value: 45 }, { value: 35 }, { value: 50 }, { value: 65 }, { value: 75 }]}
        />
        <KPICard
          title="Total Sales"
          value={data.sales.toString()}
          trend="+8.3% from last period"
          trendPositive={true}
          icon={ShoppingCart}
          sparklineData={[{ value: 10 }, { value: 15 }, { value: 12 }, { value: 20 }, { value: 25 }, { value: 22 }, { value: 30 }]}
        />
        <KPICard
          title="Active Customers"
          value={data.activeUsers.toString()}
          trend="+5.2% from last period"
          trendPositive={true}
          icon={Users}
          sparklineData={[{ value: 5 }, { value: 8 }, { value: 6 }, { value: 10 }, { value: 12 }, { value: 15 }, { value: 18 }]}
        />
        <KPICard
          title="Conversion Rate"
          value={`${data.conversion.toFixed(1)}%`}
          trend="+2.1% from last period"
          trendPositive={true}
          icon={TrendingUp}
          sparklineData={[{ value: 60 }, { value: 55 }, { value: 62 }, { value: 50 }, { value: 45 }, { value: 40 }, { value: 35 }]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardChart dateRange={dateRange} />
        <ActionItems />
      </div>
    </motion.div>
  );
}
