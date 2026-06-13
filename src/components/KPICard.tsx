import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { SpotlightCard } from "./SpotlightCard";

interface KPICardProps {
  title: string;
  value: string;
  trend: string;
  trendPositive: boolean;
  icon: LucideIcon;
  sparklineData?: any[];
}

export function KPICard({
  title,
  value,
  trend,
  trendPositive,
  icon: Icon,
  sparklineData,
}: KPICardProps) {
  const accentColor = trendPositive ? "#6366f1" : "#f43f5e";

  return (
    <SpotlightCard 
      onClick={() => console.log(`KPI Card clicked: ${title}`)}
      className="flex flex-col h-full overflow-hidden cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3 sm:mb-5 w-full relative z-10">
        <div
          className="p-2.5 rounded-xl transition-all duration-300 border border-indigo-100 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10"
        >
          <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div
          className={`flex items-center gap-1 status-badge ${
            trendPositive
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
          }`}
        >
          {trendPositive ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {trend.split(" ")[0]}
        </div>
      </div>

      <div className="mt-auto relative z-10">
        <h3 className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 sm:mb-2 uppercase tracking-widest">
          {title}
        </h3>
        <p className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {value}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">{trend}</p>
      </div>

      {sparklineData && (
        <div className="absolute bottom-0 left-0 right-0 h-20 opacity-25 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`sparkGrad-${title.replace(/ /g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={accentColor}
                strokeWidth={2.5}
                fill={`url(#sparkGrad-${title.replace(/ /g, "")})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </SpotlightCard>
  );
}
