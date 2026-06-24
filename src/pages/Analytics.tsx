import { 
  BarChart3, 
  TrendingUp, 
  Zap,
  X,
  ArrowRight,
  PieChart as PieIcon
} from "../components/Icons";
import { useState, useEffect } from "react";
import { SpotlightCard } from "../components/SpotlightCard";
import { getBusinessData, BUSINESS_DATA_UPDATED, applyOptimization } from "../utils/store";
import { useTheme } from "../utils/ThemeContext";
import { RotatingText } from "../components/RotatingText";
import { auth } from "../utils/auth";

export function Analytics() {
  const { theme } = useTheme();
  const [businessData, setBusinessData] = useState(getBusinessData());
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setBusinessData(getBusinessData());
    };
    window.addEventListener(BUSINESS_DATA_UPDATED, handleUpdate);
    return () => window.removeEventListener(BUSINESS_DATA_UPDATED, handleUpdate);
  }, []);

  const handleApplyOptimization = () => {
    applyOptimization();
    setShowReport(false);
  };

  const [deviceData, setDeviceData] = useState(() => {
    const email = auth.getCurrentEmail();
    const key = email ? `NexBiz_device_share_${email}` : "NexBiz_device_share";
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [
      { name: "Desktop", value: 65, color: "#4f46e5" },
      { name: "Mobile", value: 25, color: "#10b981" },
      { name: "Tablet", value: 10, color: "#f59e0b" },
    ];
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setDeviceData(prev => {
        const newData = prev.map((d: any) => ({
          ...d,
          value: Math.max(5, Math.min(85, d.value + (Math.random() - 0.5) * 4))
        }));
        const total = newData.reduce((s: number, d: any) => s + d.value, 0);
        const normalized = newData.map((d: any) => ({
          ...d,
          value: Math.round((d.value / total) * 100)
        }));
        const email = auth.getCurrentEmail();
        const key = email ? `NexBiz_device_share_${email}` : "NexBiz_device_share";
        localStorage.setItem(key, JSON.stringify(normalized));
        return normalized;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const generateConicGradient = (data: any[]) => {
    let gradient: string[] = [];
    let currentPercent = 0;
    data.forEach(d => {
      let nextPercent = currentPercent + d.value;
      gradient.push(`${d.color} ${currentPercent}% ${nextPercent}%`);
      currentPercent = nextPercent;
    });
    return `conic-gradient(${gradient.join(', ')})`;
  };

  const chartDisplayData = businessData.chartDataPeriods.week;
  const maxVal = Math.max(...chartDisplayData.map((d: any) => d.value), 1000);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Advanced
            </h1>
            <div className="relative inline-flex items-center">
              <RotatingText
                texts={["Analytics", "Insights", "Growth", "Trends"]}
                mainClassName="text-xl sm:text-2xl font-bold text-slate-500 dark:text-slate-400 relative z-10"
                staggerDuration={0.02}
                rotationInterval={3500}
                splitBy="characters"
              />
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Real-time data synchronization across all business units.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowReport(true)}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10 text-xs sm:text-sm"
          >
            <Zap className="w-4 h-4" /> Optimization Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 transition-all duration-300">
        <SpotlightCard allowOverflow={true} className="lg:col-span-2 p-5 sm:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-10">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 dark:bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 dark:shadow-indigo-500/10">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Revenue Stream</h3>
                   <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">Direct Persistent Sync</p>
                </div>
             </div>
             <div className="flex items-center gap-2.5 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-emerald-100/50 shadow-sm">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span> Live Data
             </div>
          </div>
          
          <div className="h-[220px] sm:h-[300px] lg:h-[350px] w-full bg-white/60 dark:bg-slate-900/20 rounded-2xl p-4 flex items-end justify-between gap-2 sm:gap-4 pb-8 group relative z-10">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pb-8 pt-4 px-4 pointer-events-none">
              {[1, 0.75, 0.5, 0.25, 0].map((tick, i) => (
                <div key={i} className="w-full border-t border-slate-200 dark:border-slate-700/50 border-dashed relative">
                  <span className="absolute -top-3 -left-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 px-1">
                    ${Math.round((maxVal * tick) / 1000)}k
                  </span>
                </div>
              ))}
            </div>

            {chartDisplayData.map((item: any, i: number) => {
              const heightPercent = (item.value / maxVal) * 100;
              return (
                <div key={i} className="relative flex flex-col items-center justify-end h-full flex-1 group/bar z-10">
                  {/* Tooltip */}
                  <div className="absolute -top-12 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                    ${item.value.toLocaleString()}
                  </div>
                  
                  {/* Bar */}
                  <div 
                    className="w-full max-w-[40px] bg-indigo-500 dark:bg-indigo-400 rounded-t-sm transition-all duration-500 ease-in-out hover:bg-indigo-600 dark:hover:bg-indigo-300 cursor-pointer"
                    style={{ height: `${heightPercent}%` }}
                  />
                  
                  {/* Label */}
                  <span className="absolute -bottom-6 text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate w-full text-center">
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>
        </SpotlightCard>

        <div className="space-y-4 sm:space-y-8">
          <SpotlightCard className="p-6 sm:p-8">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <PieIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Device Share</h3>
             </div>
             <div className="h-[180px] sm:h-[200px] w-full flex items-center justify-center">
                <div 
                  className="w-40 h-40 rounded-full transition-all duration-500 shadow-inner"
                  style={{ background: generateConicGradient(deviceData) }}
                />
             </div>
             <div className="mt-8 space-y-4">
                {deviceData.map((d: any) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{d.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{d.value}%</span>
                  </div>
                ))}
             </div>
          </SpotlightCard>
        </div>
      </div>

      {/* Optimization Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300">
          <div
            onClick={() => setShowReport(false)}
            className="absolute inset-0 bg-slate-900/60"
          />
          <div
            className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden transition-all duration-300"
          >
             <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10">
                   <Zap className="w-5 h-5" />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">Optimization Report</h2>
                   <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">AI Insights • Jun 2024</p>
                 </div>
               </div>
               <button onClick={() => setShowReport(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
                 <X className="w-5 h-5 text-slate-400 dark:text-slate-500" />
               </button>
             </div>

             <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Growth", val: "+18%", bg: "bg-emerald-50 dark:bg-emerald-500/10", color: "text-emerald-600 dark:text-emerald-400" },
                    { label: "Revenue", val: "+$24k", bg: "bg-indigo-50 dark:bg-indigo-500/10", color: "text-indigo-600 dark:text-indigo-400" },
                    { label: "Conf.", val: "94%", bg: "bg-violet-50 dark:bg-violet-500/10", color: "text-violet-600 dark:text-violet-400" },
                  ].map((idx) => (
                    <div key={idx.label} className={`${idx.bg} p-4 rounded-2xl text-center`}>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{idx.label}</p>
                      <h4 className={`text-lg font-bold ${idx.color}`}>{idx.val}</h4>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                     <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Key Recommendations
                  </h3>
                  {[
                    { title: "Reduce Checkout Friction", desc: "Shorten forms by 3 fields." },
                    { title: "Optimized Mobile CTA", desc: "Increase button size for accessibility." },
                    { title: "Dynamic Product Bundles", desc: "Show matching items in-cart." },
                  ].map((rec, i) => (
                    <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-start gap-4">
                      <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs shadow-sm">{i+1}</div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{rec.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{rec.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-end gap-3 px-5 pt-5 pb-5">
                <button onClick={() => setShowReport(false)} className="px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 text-xs">Dismiss</button>

               <button 
                onClick={handleApplyOptimization}
                className="px-6 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10 flex items-center gap-2 text-xs"
               >
                 Apply Insights <ArrowRight className="w-3.5 h-3.5" />
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
