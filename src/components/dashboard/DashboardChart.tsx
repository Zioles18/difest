import { useState, useEffect } from "react";
import { SpotlightCard } from "../ui/SpotlightCard";
import { getBusinessData, BUSINESS_DATA_UPDATED } from "../../utils/store";
import { useTheme } from "../../utils/ThemeContext";
const PERIOD_MAP: Record<"7d" | "30d" | "12m", "week" | "month" | "year"> = {
    "7d": "week",
    "30d": "month",
    "12m": "year",
};
interface DashboardChartProps {
    dateRange: "7d" | "30d" | "12m";
}
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
    const maxVal = Math.max(...data.map((d: any) => d.value), 1000);
    return (<SpotlightCard className="col-span-1 lg:col-span-2 flex flex-col h-full pt-1">
      <div className="flex justify-between items-end mb-6 w-full z-10">
        <div>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Revenue</p>
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Growth Trend
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-full">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"/>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Live</span>
        </div>
      </div>

      <div className="h-[220px] sm:h-[280px] w-full flex items-end justify-between gap-2 sm:gap-4 pb-6 relative group">
        
        <div className="absolute inset-0 flex flex-col justify-between pb-6 pointer-events-none">
          {[1, 0.75, 0.5, 0.25, 0].map((tick, i) => (<div key={i} className="w-full border-t border-slate-200 dark:border-slate-700/50 border-dashed relative">
              <span className="absolute -top-3 -left-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 px-1">
                ${Math.round((maxVal * tick) / 1000)}k
              </span>
            </div>))}
        </div>

        {data.map((item: any, i: number) => {
            const heightPercent = (item.value / maxVal) * 100;
            return (<div key={i} className="relative flex flex-col items-center justify-end h-full flex-1 group/bar z-10">
              
              <div className="absolute -top-12 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                ${item.value.toLocaleString()}
              </div>
              
              
              <div className="w-full max-w-[40px] bg-indigo-500 dark:bg-indigo-400 rounded-t-sm transition-all duration-500 ease-in-out hover:bg-indigo-600 dark:hover:bg-indigo-300 cursor-pointer" style={{ height: `${heightPercent}%` }}/>
              
              
              <span className="absolute -bottom-6 text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate w-full text-center">
                {item.name}
              </span>
            </div>);
        })}
      </div>
    </SpotlightCard>);
}
