import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SpotlightCard } from "./SpotlightCard";
import { useState, useEffect } from "react";
import { getBusinessData, BUSINESS_DATA_UPDATED } from "../utils/store";
import { useTheme } from "../utils/ThemeContext";

// Map header dateRange keys → store chartDataPeriods keys
const PERIOD_MAP: Record<"7d" | "30d" | "12m", "week" | "month" | "year"> = {
  "7d": "week",
  "30d": "month",
  "12m": "year",
};

interface DashboardChartProps {
  dateRange: "7d" | "30d" | "12m";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-2xl px-4 py-3">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-display font-black text-slate-900 dark:text-slate-100">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function DashboardChart({ dateRange }: DashboardChartProps) {
  const { theme } = useTheme();
  const [storeData, setStoreData] = useState(getBusinessData());

  useEffect(() => {
    const handleUpdate = () => setStoreData(getBusinessData());
    window.addEventListener(BUSINESS_DATA_UPDATED, handleUpdate);
    return () => window.removeEventListener(BUSINESS_DATA_UPDATED, handleUpdate);
  }, []);

  const periodKey = PERIOD_MAP[dateRange];
  const data = storeData.chartDataPeriods[periodKey];

  const gridColor = theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const tickColor = theme === "dark" ? "#64748b" : "#94a3b8";

  return (
    <SpotlightCard className="col-span-1 lg:col-span-2 flex flex-col h-full pt-1">
      <div className="flex justify-between items-end mb-6 w-full z-10">
        <div>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Revenue</p>
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Growth Trend
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-full">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Live</span>
        </div>
      </div>

      <div className="h-[220px] sm:h-[280px] w-full sm:-ml-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.5} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: tickColor, fontWeight: 600 }}
              dy={12}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: tickColor, fontWeight: 600 }}
              tickFormatter={(v) => `$${v >= 1000 ? `${v / 1000}k` : v}`}
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#6366f1", strokeWidth: 1.5, strokeDasharray: "4 4" }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorIndigo)"
              animationDuration={1200}
              dot={false}
              activeDot={{ r: 6, fill: "#6366f1", stroke: theme === "dark" ? "#1e293b" : "#fff", strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SpotlightCard>
  );
}
