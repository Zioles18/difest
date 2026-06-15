import { DollarSign, ShoppingCart, Activity } from "lucide-react";
import { motion } from "motion/react";
import { useOutletContext } from "react-router-dom";
import { KPICard } from "../components/KPICard";
import { DashboardChart } from "../components/DashboardChart";
import { ActionItems } from "../components/ActionItems";
import { SplitText } from "../components/SplitText";
import type { DateRange } from "../layouts/DashboardLayout";
import { auth } from "../utils/auth";

const KPI_DATA = {
  "7d": {
    revenue: { value: "$8,432.00", trend: "+5.2% from last week", trendPositive: true },
    orders: { value: "+142", trend: "+2% from last week", trendPositive: true },
    engagement: { value: "28.1%", trend: "+1.4% from last week", trendPositive: true },
  },
  "30d": {
    revenue: { value: "$45,231.89", trend: "+20.1% from last month", trendPositive: true },
    orders: { value: "+2,350", trend: "+15% from last month", trendPositive: true },
    engagement: { value: "24.5%", trend: "-2.4% from last month", trendPositive: false },
  },
  "12m": {
    revenue: { value: "$542,000.00", trend: "+45% from last year", trendPositive: true },
    orders: { value: "+28,400", trend: "+32% from last year", trendPositive: true },
    engagement: { value: "32.4%", trend: "+5.2% from last year", trendPositive: true },
  },
};

export function Overview() {
  const { dateRange, activeTab } = useOutletContext<{ dateRange: DateRange; activeTab: string }>();
  const currentKPI = KPI_DATA[dateRange];

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
          <SplitText
            text={`Good morning, ${greetingName}.`}
            className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2"
            delay={0.05}
          />
          <p className="text-slate-500 dark:text-slate-400 text-base font-medium">
            Here's what's happening with your business today.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <KPICard
          title="Total Revenue"
          value={currentKPI.revenue.value}
          trend={currentKPI.revenue.trend}
          trendPositive={currentKPI.revenue.trendPositive}
          icon={DollarSign}
          sparklineData={[{ value: 20 }, { value: 30 }, { value: 45 }, { value: 35 }, { value: 50 }, { value: 65 }, { value: 75 }]}
        />
        <KPICard
          title="Active Orders"
          value={currentKPI.orders.value}
          trend={currentKPI.orders.trend}
          trendPositive={currentKPI.orders.trendPositive}
          icon={ShoppingCart}
          sparklineData={[{ value: 10 }, { value: 15 }, { value: 12 }, { value: 20 }, { value: 25 }, { value: 22 }, { value: 30 }]}
        />
        <KPICard
          title="Engagement Rate"
          value={currentKPI.engagement.value}
          trend={currentKPI.engagement.trend}
          trendPositive={currentKPI.engagement.trendPositive}
          icon={Activity}
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
