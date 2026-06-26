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
  Activity,
  CheckSquare,
  Clock,
  Edit3,
  Save
} from "../../components/Icons";
import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "../../lib/router";
import { KPICard } from "../../components/dashboard/KPICard";
import { SpotlightCard } from "../../components/ui/SpotlightCard";
import { NumberInput } from "../../components/ui/NumberInput";
import { getBusinessData, updateBusinessData, BUSINESS_DATA_UPDATED, addNotification } from "../../utils/store";
import { useTheme } from "../../utils/ThemeContext";
import { RotatingText } from "../../components/ui/RotatingText";

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
  const maxVal = Math.max(...chartDisplayData.map((d: any) => d.value), 1000);

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

  // Revenue calculations
  const currRevenueVal = data.revenue * kpiMultiplier;
  const prevRevenueValStored = data.previousRevenue !== undefined ? data.previousRevenue : (data.revenue * 0.9);
  const prevRevenueVal = prevRevenueValStored * kpiMultiplier;
  const revenueDiff = currRevenueVal - prevRevenueVal;
  const revenueTrend = revenueDiff >= 0 ? "up" : "down";
  const revenueChangePct = prevRevenueVal !== 0 ? (revenueDiff / prevRevenueVal) * 100 : 0;
  const revenueChange = `${revenueChangePct >= 0 ? "+" : ""}${revenueChangePct.toFixed(1)}%`;

  // Sales calculations
  const currSalesVal = data.sales * kpiMultiplier;
  const prevSalesValStored = data.previousSales !== undefined ? data.previousSales : Math.max(0, data.sales - 1);
  const prevSalesVal = prevSalesValStored * kpiMultiplier;
  const salesDiff = currSalesVal - prevSalesVal;
  const salesTrend = salesDiff >= 0 ? "up" : "down";
  const salesChangePct = prevSalesVal !== 0 ? (salesDiff / prevSalesVal) * 100 : 0;
  const salesChange = `${salesChangePct >= 0 ? "+" : ""}${salesChangePct.toFixed(1)}%`;

  // Active Users calculations
  const currUsersVal = data.activeUsers * kpiMultiplier;
  const prevUsersValStored = data.previousActiveUsers !== undefined ? data.previousActiveUsers : Math.max(1, data.activeUsers - 1);
  const prevUsersVal = prevUsersValStored * kpiMultiplier;
  const usersDiff = currUsersVal - prevUsersVal;
  const usersTrend = usersDiff >= 0 ? "up" : "down";
  const usersChangePct = prevUsersVal !== 0 ? (usersDiff / prevUsersVal) * 100 : 0;
  const usersChange = `${usersChangePct >= 0 ? "+" : ""}${usersChangePct.toFixed(1)}%`;

  // Conversion calculations
  const currentConversion = data.conversion * (dateRange === "7d" ? 0.9 : dateRange === "30d" ? 1 : 1.08);
  const prevConversionVal = data.previousConversion !== undefined ? data.previousConversion : 4.0;
  const previousConversion = prevConversionVal * (dateRange === "7d" ? 0.9 : dateRange === "30d" ? 1 : 1.08);
  const conversionDiff = currentConversion - previousConversion;
  const conversionTrend = conversionDiff >= 0 ? "up" : "down";
  const conversionChange = `${conversionDiff >= 0 ? "+" : ""}${conversionDiff.toFixed(2)}%`;

  const kpis = [
    { 
      id: "revenue",
      title: "Total Revenue", 
      value: `$${Math.round(currRevenueVal).toLocaleString()}`, 
      change: revenueChange, 
      trend: revenueTrend, 
      icon: TrendingUp, 
      color: "indigo",
      details: `Net revenue from all approved orders over the selected period. Growth is driven by high-value Enterprise plans.`
    },
    { 
      id: "sales",
      title: "Total Sales", 
      value: Math.round(currSalesVal).toLocaleString(), 
      change: salesChange, 
      trend: salesTrend, 
      icon: ShoppingBag, 
      color: "violet",
      details: "Total volume of individual sales transactions in the selected timeframe."
    },
    { 
      id: "users",
      title: "Active Users", 
      value: Math.round(currUsersVal).toLocaleString(), 
      change: usersChange, 
      trend: usersTrend, 
      icon: Users, 
      color: "emerald",
      details: "Unique active users engaged with the platform in the selected period."
    },
    { 
      id: "conversion",
      title: "Conversion", 
      value: `${currentConversion.toFixed(2)}%`, 
      change: conversionChange, 
      trend: conversionTrend, 
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
    <div className="space-y-4 sm:space-y-6 lg:space-y-10 animate-fade-in transition-all duration-300">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 transition-all duration-300">
        {kpis.map((kpi, idx) => (
          <div 
            key={idx} 
            onClick={() => setSelectedKPI(kpi.id)} 
            className="cursor-pointer group transition-all duration-300"
          >
            <KPICard {...kpi} trendPositive={kpi.trend === "up"} />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 transition-all duration-300">
        {/* Revenue Chart with Glassmorphism */}
        <div className="lg:col-span-2 transition-all duration-300">
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
          
          <div className="h-[220px] sm:h-[320px] lg:h-[400px] w-full relative z-10 bg-white/60 dark:bg-slate-900/20 rounded-2xl p-4 flex items-end justify-between gap-2 sm:gap-4 pb-8 group">
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
        </div>

        {/* Sync-Ready Activity feed - Redesigned to Light/Glass */}
        <div className="lg:col-span-1 transition-all duration-300">
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
        </div>
      </div>

      {/* Chart Data Editor Modal */}
      {chartEditorOpen && (
        <>
          <div
            onClick={() => setChartEditorOpen(false)}
            className="fixed inset-0 z-[1100] transition-opacity duration-300"
          />
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 pointer-events-none transition-all duration-300">
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 shadow-2xl border border-slate-100 dark:border-slate-700/50 pointer-events-auto max-h-[85vh] flex flex-col">
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
                      step={1}
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
            </div>
          </div>
        </>
      )}

      {selectedKPI && (
        <>
          <div
            onClick={() => setSelectedKPI(null)}
            className="fixed inset-0 z-[1100] transition-opacity duration-300"
          />
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 pointer-events-none transition-all duration-300">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-10 lg:p-12 shadow-2xl border border-slate-100 dark:border-slate-700/50 pointer-events-auto max-h-[90vh] overflow-y-auto">
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
            </div>
          </div>
        </>
      )}

      {/* PDF Success Toast */}
      {showPdfToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-slate-900 dark:bg-slate-800 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 dark:border-slate-700 transition-all duration-300">
          <div className="w-7 h-7 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight">Enterprise Report Exported as PDF</span>
        </div>
      )}
    </div>
  );
}
