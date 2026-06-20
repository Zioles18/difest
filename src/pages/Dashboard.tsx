import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Download,
  Eye,
  CheckCircle2,
  Zap,
  BarChart3,
  X,
  CreditCard,
  History,
  Activity,
  CheckSquare,
  Clock,
  Edit3,
  Save
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { KPICard } from "../components/KPICard";
import { SpotlightCard } from "../components/SpotlightCard";
import { NumberInput } from "../components/NumberInput";
import { getBusinessData, updateBusinessData, BUSINESS_DATA_UPDATED, addNotification } from "../utils/store";
import { useTheme } from "../utils/ThemeContext";
import { RotatingText } from "../components/RotatingText";

export function Dashboard() {
  const navigate = useNavigate();
  const { dateRange } = useOutletContext<any>();
  const { theme } = useTheme();
  const [data, setData] = useState(getBusinessData());
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const [chartRange, setChartRange] = useState<"Week" | "Month" | "Year">("Week");
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [showPdfToast, setShowPdfToast] = useState(false);
  const [chartEditorOpen, setChartEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<"week" | "month" | "year">("week");
  const [draftData, setDraftData] = useState<{
    week: { name: string; value: number }[];
    month: { name: string; value: number }[];
    year: { name: string; value: number }[];
  }>({ week: [], month: [], year: [] });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync the chart period with the global header date filter
  useEffect(() => {
    if (dateRange === "7d") setChartRange("Week");
    else if (dateRange === "30d") setChartRange("Month");
    else if (dateRange === "12m") setChartRange("Year");
  }, [dateRange]);

  // KPI multipliers per period so numbers feel realistic
  const kpiMultiplier = dateRange === "7d" ? 0.23 : dateRange === "30d" ? 1 : 12;
  const kpiChanges: Record<string, { change: string; trend: "up" | "down" }> = {
    "7d":  { change: "+3.1%",  trend: "up"   },
    "30d": { change: "+12.5%", trend: "up"   },
    "12m": { change: "+38.4%", trend: "up"   },
  };
  const activeChange = kpiChanges[dateRange] ?? kpiChanges["30d"];

  const chartDisplayData = chartRange === "Week" ? data.chartDataPeriods.week : chartRange === "Month" ? data.chartDataPeriods.month : data.chartDataPeriods.year;

  useEffect(() => {
    const handleUpdate = () => {
      setData(getBusinessData());
    };
    window.addEventListener(BUSINESS_DATA_UPDATED, handleUpdate);
    return () => window.removeEventListener(BUSINESS_DATA_UPDATED, handleUpdate);
  }, []);

  // Broadcast modal state so Header can blur
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("NexBiz_modal_state", { detail: { open: !!selectedKPI || chartEditorOpen } }));
  }, [selectedKPI, chartEditorOpen]);

  const openChartEditor = () => {
    setDraftData({
      week: data.chartDataPeriods.week.map(d => ({ ...d })),
      month: data.chartDataPeriods.month.map(d => ({ ...d })),
      year: data.chartDataPeriods.year.map(d => ({ ...d })),
    });
    setEditorTab("week");
    setChartEditorOpen(true);
  };

  const saveChartData = () => {
    setIsSaving(true);
    // Simulate delay for UX
    setTimeout(() => {
      updateBusinessData({ chartDataPeriods: draftData });
      addNotification({ text: `Revenue chart data updated (${editorTab} view)`, dot: "bg-indigo-500" });
      setChartEditorOpen(false);
      setIsSaving(false);
    }, 800);
  };

  const updateDraftValue = (period: "week" | "month" | "year", idx: number, val: string) => {
    const num = parseFloat(val) || 0;
    setDraftData(prev => ({
      ...prev,
      [period]: prev[period].map((d, i) => i === idx ? { ...d, value: num } : d)
    }));
  };

  const handlePdfDownload = () => {
    setIsPdfLoading(true);
    setTimeout(() => {
      setIsPdfLoading(false);
      setShowPdfToast(true);
      setTimeout(() => setShowPdfToast(false), 3000);
    }, 1500);
  };

  const kpis = [
    { 
      id: "revenue",
      title: "Total Revenue", 
      value: `$${Math.round(data.revenue * kpiMultiplier).toLocaleString()}`, 
      change: activeChange.change, 
      trend: activeChange.trend, 
      icon: TrendingUp, 
      color: "indigo",
      details: `Net revenue from all approved orders over the selected period. Growth is driven by high-value Enterprise plans.`
    },
    { 
      id: "sales",
      title: "Total Sales", 
      value: Math.round(data.sales * kpiMultiplier).toLocaleString(), 
      change: activeChange.change, 
      trend: activeChange.trend, 
      icon: ShoppingBag, 
      color: "violet",
      details: "Total volume of individual sales transactions in the selected timeframe."
    },
    { 
      id: "users",
      title: "Active Users", 
      value: Math.round(data.activeUsers * kpiMultiplier).toLocaleString(), 
      change: activeChange.change, 
      trend: activeChange.trend, 
      icon: Users, 
      color: "emerald",
      details: "Unique active users engaged with the platform in the selected period."
    },
    { 
      id: "conversion",
      title: "Conversion", 
      value: `${(data.conversion * (dateRange === "7d" ? 0.9 : dateRange === "30d" ? 1 : 1.08)).toFixed(2)}%`, 
      change: dateRange === "12m" ? "+1.4%" : "-2.1%", 
      trend: dateRange === "12m" ? "up" : "down", 
      icon: Target, 
      color: "amber",
      details: "Ratio of visitors to successful checkouts. Trending toward target range."
    },
  ];

  // Derive latest activity from store orders
  const recentOrders = data.orders.slice(0, 4).map(o => ({
     title: o.status === "Completed" ? "Sale Approved" : o.status === "Processing" ? "Order Processing" : "Order Pending",
     val: o.total,
     time: o.date === new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) ? "Today" : o.date,
     icon: o.status === "Completed" ? CheckSquare : o.status === "Processing" ? Clock : Clock,
     color: o.status === "Completed" ? "text-emerald-600 dark:text-emerald-400" : o.status === "Processing" ? "text-indigo-500 dark:text-indigo-400" : "text-amber-500 dark:text-amber-400",
     bg: o.status === "Completed" ? "bg-emerald-50 dark:bg-emerald-500/10" : o.status === "Processing" ? "bg-indigo-50 dark:bg-indigo-500/10" : "bg-amber-50 dark:bg-amber-500/10"
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        staggerChildren: 0.1,
        delayChildren: 0.1
      }}
      className="space-y-4 sm:space-y-6 lg:space-y-10"
    >
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Enterprise
            </h1>
            <div className="relative inline-flex items-center">
              <RotatingText
                texts={["Overview", "Intelligence", "Insights", "Metrics"]}
                mainClassName="text-2xl sm:text-3xl font-bold text-slate-500 dark:text-slate-400 relative z-10"
                staggerDuration={0.02}
                rotationInterval={3500}
                splitBy="characters"
              />
            </div>
          </div>
          <div className="text-slate-500 dark:text-slate-400 font-semibold mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="hidden sm:inline">Real-time business intelligence •</span>
            <span className="flex items-center gap-1.5 inline-flex bg-emerald-500/5 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-emerald-500 dark:text-emerald-400">System Live</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> {dateRange === "7d" ? "Last 7 Days" : dateRange === "30d" ? "Last 30 Days" : "Last 12 Months"}
          </div>
          <button
            onClick={openChartEditor}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl shadow-sm hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all text-xs sm:text-sm font-bold"
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Chart Data</span>
          </button>
          <button 
            onClick={handlePdfDownload}
            disabled={isPdfLoading}
            className="p-2.5 sm:p-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200 dark:shadow-slate-900/50 hover:bg-black transition-all disabled:opacity-60 flex items-center gap-2 text-sm font-bold"
          >
            {isPdfLoading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            ) : (
              <Download className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <motion.div 
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
              staggerChildren: 0.12,
              delayChildren: 0.1,
              ease: [0.22, 1, 0.36, 1]
            }
          }
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
      >
        {kpis.map((kpi, idx) => (
          <motion.div 
            key={idx} 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0, 
                transition: { 
                  duration: 0.6, 
                  ease: [0.22, 1, 0.36, 1] 
                } 
              }
            }}
            onClick={() => setSelectedKPI(kpi.id)} 
            className="cursor-pointer group"
          >
            <KPICard {...kpi} trendPositive={kpi.trend === "up"} />
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <motion.div 
        variants={{
          hidden: { opacity: 0, y: 40 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
              duration: 0.8, 
              ease: [0.22, 1, 0.36, 1],
              staggerChildren: 0.15,
              delayChildren: 0.15
            }
          }
        }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
      >
        {/* Revenue Chart with Glassmorphism */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }} className="lg:col-span-2">
          <SpotlightCard allowOverflow={true} className="p-4 sm:p-8 lg:p-10 bg-white/70 dark:bg-slate-800/15 border border-slate-200/70 dark:border-slate-700/30">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <TrendingUp className="w-32 h-32 text-indigo-600 dark:text-indigo-400" />
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-10 relative z-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 dark:shadow-indigo-500/10">
                 <BarChart3 className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Revenue Stream</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">Live Diagnostic Sync</p>
               </div>
            </div>
            <div className="flex bg-slate-100/80 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700/50 self-start sm:self-auto">
               {(["Week", "Month", "Year"] as const).map(t => (
                 <button 
                   key={t} 
                   onClick={() => setChartRange(t)}
                   className={`px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                     t === chartRange ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                   }`}
                 >{t}</button>
               ))}
            </div>
          </div>
          
          <div className="h-[220px] sm:h-[320px] lg:h-[400px] w-full relative z-10 bg-white/60 dark:bg-slate-900/20 rounded-2xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartDisplayData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={theme === 'dark' ? 0.15 : 0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: isMobile ? 9 : 11, fontWeight: 700 }}
                  dy={15}
                  interval={isMobile ? "preserveStart" : "preserveStartEnd"}
                  minTickGap={isMobile ? 35 : 30}
                />
                <YAxis 
                  hide={isMobile}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 700 }}
                  tickFormatter={(val) => `$${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
                    backdropFilter: 'blur(12px)',
                    borderRadius: '8px', 
                    border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                    padding: '12px'
                  }}
                  itemStyle={{ color: '#4f46e5', fontWeight: 800, fontSize: '14px' }}
                  labelStyle={{ color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4f46e5" 
                  strokeWidth={5}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>
        </motion.div>

        {/* Sync-Ready Activity feed - Redesigned to Light/Glass */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }} className="lg:col-span-1">
          <SpotlightCard className="p-5 sm:p-8 lg:p-10 bg-white/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/50 relative overflow-hidden">
           <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
           
           <div className="flex items-center gap-4 mb-6 sm:mb-10 relative z-10">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Live Status</h3>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Persistent Stream</p>
              </div>
           </div>
           
           <div className="space-y-4 sm:space-y-6 lg:space-y-8 relative z-10">
              {recentOrders.length > 0 ? recentOrders.map((act, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer p-1">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm`}>
                      <act.icon className={`w-6 h-6 ${act.color}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">{act.title}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">{act.time}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-extrabold ${act.color}`}>{act.val}</span>
                </div>
              )) : (
                <div className="text-center py-10 opacity-40">
                   <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Waiting for new data...</p>
                </div>
              )}
           </div>
           
           <button 
            onClick={() => navigate("/analytics")}
            className="w-full mt-10 py-4 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/40 dark:shadow-black/60 hover:bg-black relative z-10"
           >
             Monitoring Center <ArrowUpRight className="w-4 h-4" />
           </button>
        </SpotlightCard>
        </motion.div>
      </motion.div>

      {/* Chart Data Editor Modal */}
      <AnimatePresence>
        {chartEditorOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChartEditorOpen(false)}
              className="fixed inset-0 z-[1100]"
            />
            <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ scale: 0.92, opacity: 0, y: 40, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 shadow-2xl border border-slate-100 dark:border-slate-700/50 pointer-events-auto max-h-[85vh] flex flex-col"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-5 sm:mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 dark:shadow-indigo-500/10">
                      <Edit3 className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Edit Chart Data</h2>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">Revenue Stream Editor</p>
                    </div>
                  </div>
                  <button onClick={() => setChartEditorOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-full transition-colors">
                    <X className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                  </button>
                </div>

                {/* Period Tabs */}
                <div className="flex bg-slate-100/60 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-100 dark:border-white/10 backdrop-blur-md mb-5 sm:mb-8 gap-1">
                  {(["week", "month", "year"] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setEditorTab(tab)}
                      className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                        tab === editorTab 
                          ? "bg-white dark:bg-white/10 text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-lg dark:shadow-black/20 border-t border-transparent dark:border-t-white/20" 
                          : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                      }`}
                    >
                      {tab === "week" ? "Weekly" : tab === "month" ? "Monthly" : "Yearly"}
                    </button>
                  ))}
                </div>

                {/* Data Inputs */}
                <div className="overflow-y-auto flex-1 pr-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {draftData[editorTab].map((point, idx) => (
                      <NumberInput
                        key={`${editorTab}-${idx}`}
                        label={point.name}
                        name={`value-${idx}`}
                        value={point.value}
                        onChange={(val) => updateDraftValue(editorTab, idx, val)}
                        step={editorTab === 'year' ? 1000 : 100}
                        className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700/50 !space-y-2"
                        showMultiplier={true}
                      />
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3 sm:gap-4 mt-5 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100 dark:border-slate-700/50">
                  <button
                    onClick={() => setChartEditorOpen(false)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 dark:border-t-white/20 backdrop-blur-md font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-sm shadow-sm dark:shadow-xl dark:shadow-black/20"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveChartData}
                    disabled={isSaving}
                    className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 dark:shadow-indigo-500/10 text-sm flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedKPI && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedKPI(null)}
              className="fixed inset-0 z-[1100]"
            />
            <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-10 lg:p-12 shadow-2xl border border-slate-100 dark:border-slate-700/50 pointer-events-auto max-h-[90vh] overflow-y-auto"
              >
               <div className="flex items-center justify-between mb-6 sm:mb-10">
                  <div className="flex items-center gap-5">
                     <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl ${
                       selectedKPI === 'revenue' ? 'bg-indigo-600' : 
                       selectedKPI === 'sales' ? 'bg-violet-600' : 
                       selectedKPI === 'users' ? 'bg-emerald-600' : 'bg-amber-600'
                     }`}>
                        {(() => {
                          const kpi = kpis.find(k => k.id === selectedKPI);
                          return kpi ? <kpi.icon className="w-8 h-8" /> : null;
                        })()}
                     </div>
                     <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{kpis.find(k => k.id === selectedKPI)?.title}</h2>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">Executive Summary</p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedKPI(null)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-full transition-colors">
                    <X className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                  </button>
               </div>

               <div className="space-y-8">
                  <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-16 h-16 text-slate-900 dark:text-slate-100" />
                     </div>
                     <p className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-2 tracking-tighter">{kpis.find(k => k.id === selectedKPI)?.value}</p>
                     <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${kpis.find(k => k.id === selectedKPI)?.trend === "up" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400"}`}>
                           {kpis.find(k => k.id === selectedKPI)?.trend === "up" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                           {kpis.find(k => k.id === selectedKPI)?.change}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Growth Vector</span>
                     </div>
                  </div>

                  <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed pl-2 border-l-4 border-indigo-100 dark:border-indigo-500/20 italic">
                    "{kpis.find(k => k.id === selectedKPI)?.details}"
                  </p>

                  <div className="pt-6 flex gap-4">
                     <button onClick={() => setSelectedKPI(null)} className="flex-1 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm">Close Insight</button>
                      <button onClick={handlePdfDownload} disabled={isPdfLoading} className="flex-1 py-4 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-2xl hover:bg-black dark:hover:bg-slate-600 transition-all shadow-xl shadow-slate-900/20 dark:shadow-black/40 text-sm flex items-center justify-center gap-2">{isPdfLoading ? "Generating..." : "Download Analytics"}</button>
                  </div>
               </div>
            </motion.div>
          </div>
        </>
        )}
      </AnimatePresence>

      {/* PDF Success Toast */}
      <AnimatePresence>
        {showPdfToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-slate-900 dark:bg-slate-800 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 dark:border-slate-700"
          >
            <div className="w-7 h-7 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="font-bold tracking-tight">Enterprise Report Exported as PDF</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
