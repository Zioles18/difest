import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Lock, 
  Bell, 
  CreditCard,
  ChevronRight,
  Shield,
  Save,
  Mail,
  Smartphone,
  Globe,
  Trash2,
  CheckCircle2,
  Sparkles,
  Zap,
  Loader2,
  X,
  CreditCard as PaymentIcon,
  TrendingUp,
  AlertTriangle,
  Monitor,
  LogOut
} from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { SpotlightCard } from "../components/SpotlightCard";
import { 
  getBusinessData, 
  updateBusinessData, 
  syncChartFromOrders,
  BUSINESS_DATA_UPDATED,
  BusinessData,
  addNotification
} from "../utils/store";
import { BarChart as BarChartIcon } from "lucide-react";

export function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStep, setPaymentStep] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Notify layout when modal opens/closes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("NexBiz_modal_state", { detail: { open: showDeleteConfirm || isPaying } }));
  }, [showDeleteConfirm, isPaying]);

  // Active sessions state (mock)
  const [sessions, setSessions] = useState([
    { id: 1, device: "Chrome on Windows", location: "Jakarta, ID", time: "Active now", icon: Monitor, current: true },
    { id: 2, device: "Safari on iPhone", location: "Surabaya, ID", time: "2 hours ago", icon: Smartphone, current: false },
    { id: 3, device: "Firefox on Mac", location: "Bandung, ID", time: "Yesterday", icon: Globe, current: false },
  ]);

  const handleRemoveSession = (id: number) => {
    setSessions(prev => prev.filter(s => s.id !== id || s.current));
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== "DELETE") return;
    // Clear all app data
    const email = auth.getCurrentEmail();
    if (email) {
      localStorage.removeItem(`NexBiz_notifications_${email}`);
      localStorage.removeItem(`NexBiz_settings_${email}`);
      localStorage.removeItem(`NexBiz_business_hub_${email}`);
      localStorage.removeItem(`NexBiz_invoices_${email}`);
      localStorage.removeItem(`NexBiz_customers_${email}`);
      localStorage.removeItem(`NexBiz_device_share_${email}`);
    } else {
      localStorage.removeItem("NexBiz_settings");
      localStorage.removeItem("NexBiz_business_hub");
      localStorage.removeItem("NexBiz_invoices");
      localStorage.removeItem("NexBiz_customers");
      localStorage.removeItem("NexBiz_device_share");
    }
    localStorage.removeItem("NexBiz_profile");
    localStorage.removeItem("NexBiz_orders");
    setShowDeleteConfirm(false);
    setDeleteConfirmText("");
    navigate("/login");
  };

  // Billing history - persisted to localStorage
  const [invoices, setInvoices] = useState(() => {
    const email = auth.getCurrentEmail();
    const key = email ? `NexBiz_invoices_${email}` : "NexBiz_invoices";
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [
      { id: "#INV-2024-001", date: "Jun 01, 2024", amount: "$49.00", status: "Paid" },
      { id: "#INV-2024-002", date: "May 01, 2024", amount: "$49.00", status: "Paid" },
    ];
  });

  const [settings, setSettings] = useState(() => {
    const email = auth.getCurrentEmail();
    const key = email ? `NexBiz_settings_${email}` : "NexBiz_settings";
    const saved = localStorage.getItem(key);
    const name = email ? email.split("@")[0] : "User";
    return saved ? JSON.parse(saved) : {
      firstName: name,
      lastName: "",
      email: email || "",
      twoFactor: true,
      emailNotifications: true,
      pushNotifications: false,
      marketingEmails: true,
      plan: "Pro"
    };
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      const email = auth.getCurrentEmail();
      const key = email ? `NexBiz_settings_${email}` : "NexBiz_settings";
      localStorage.setItem(key, JSON.stringify(settings));
      
      // Dispatch settings updated custom event
      window.dispatchEvent(new CustomEvent("NexBiz_settings_updated", { detail: settings }));

      addNotification({ text: `Settings saved — ${activeTab} tab`, dot: "bg-indigo-500" });
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  const handleUpgrade = () => {
    setIsPaying(true);
    setPaymentStep(1);
    setTimeout(() => {
      const newPlan = "Business Premium";
      const newSettings = {...settings, plan: newPlan};
      setPaymentStep(2);
      setSettings(newSettings);
      const email = auth.getCurrentEmail();
      const settingsKey = email ? `NexBiz_settings_${email}` : "NexBiz_settings";
      localStorage.setItem(settingsKey, JSON.stringify(newSettings));
      
      // Dispatch settings updated custom event
      window.dispatchEvent(new CustomEvent("NexBiz_settings_updated", { detail: newSettings }));

      addNotification({ text: "Upgraded to Business Premium — payment confirmed", dot: "bg-emerald-500" });
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      const newInvId = `#INV-${now.getFullYear()}-${String(Math.floor(Math.random()*900)+100)}`;
      setInvoices(prev => {
        const updated = [{ id: newInvId, date: dateStr, amount: "$99.00", status: "Paid" }, ...prev];
        const invoicesKey = email ? `NexBiz_invoices_${email}` : "NexBiz_invoices";
        localStorage.setItem(invoicesKey, JSON.stringify(updated));
        return updated;
      });
    }, 3000);
  };

  const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "data", label: "Data Management", icon: BarChartIcon },
  ];

  const [businessData, setBusinessData] = useState<BusinessData>(getBusinessData());

  useEffect(() => {
    const handleUpdate = () => {
      setBusinessData(getBusinessData());
    };
    window.addEventListener(BUSINESS_DATA_UPDATED, handleUpdate);
    return () => window.removeEventListener(BUSINESS_DATA_UPDATED, handleUpdate);
  }, []);

  const handleSaveBusinessData = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateBusinessData(businessData);
      addNotification({ text: "Business data updated — KPIs & chart synced", dot: "bg-amber-500" });
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  const handleSyncFromOrders = () => {
    setIsSaving(true);
    setTimeout(() => {
      const updated = syncChartFromOrders();
      setBusinessData(updated);
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-20"
    >
      <div className="px-1 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Configure your workspace and account preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        {/* Sidebar Tabs - Horizontal Scroll on Mobile */}
        <div className="flex lg:flex-col lg:w-64 shrink-0 gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 px-1 sm:px-0 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 lg:w-full flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10" 
                    : "text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100 backdrop-blur-sm"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 px-1 sm:px-0">
          <SpotlightCard className="p-5 sm:p-8">
            <AnimatePresence mode="wait">
              {activeTab === "general" && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8 z-10 relative"
                >
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">First Name</label>
                        <input 
                          type="text" 
                          value={settings.firstName}
                          onChange={(e) => setSettings({...settings, firstName: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all text-slate-900 dark:text-slate-100" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Last Name</label>
                        <input 
                          type="text" 
                          value={settings.lastName}
                          onChange={(e) => setSettings({...settings, lastName: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all text-slate-900 dark:text-slate-100" 
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <input 
                            type="email" 
                            value={settings.email}
                            onChange={(e) => setSettings({...settings, email: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all text-slate-900 dark:text-slate-100" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "billing" && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8 z-10 relative"
                >
                  <div className="p-5 sm:p-6 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                        <Zap className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Current Plan</p>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{settings.plan}</h4>
                      </div>
                    </div>
                    {settings.plan !== "Business Premium" && (
                      <button 
                        onClick={handleUpgrade}
                        className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10 text-sm flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" /> Upgrade to Premium
                      </button>
                    )}
                  </div>

                  <div>
                     <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">Payment History</h3>
                     <div className="space-y-3">
                        {invoices.map((inv) => (
                           <div key={inv.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 group hover:border-indigo-100 transition-colors gap-4">
                              <div className="flex flex-col">
                                 <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{inv.id}</span>
                                 <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{inv.date}</span>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                 <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{inv.amount}</span>
                                 <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-widest transition-colors">{inv.status}</span>
                                    <button className="text-slate-400 dark:text-slate-500 hover:text-indigo-600">
                                     <ChevronRight className="w-5 h-5" />
                                   </button>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "notifications" && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8 z-10 relative"
                >
                   <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Notification Preferences</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">Choose how you want to be notified about workspace updates.</p>
                    
                    <div className="space-y-4">
                      {[
                        { id: "emailNotifications", label: "Email Notifications", desc: "Receive updates via your email address", icon: Mail },
                        { id: "pushNotifications", label: "Push Notifications", desc: "Receive instant notifications on desktop", icon: Smartphone },
                        { id: "marketingEmails", label: "Marketing Emails", desc: "Stay updated with new features and offers", icon: Sparkles },
                      ].map((pref) => {
                        const Icon = pref.icon;
                        return (
                          <div key={pref.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 gap-4">
                             <div className="flex gap-4">
                               <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-sm"><Icon className="w-5 h-5" /></div>
                               <div>
                                 <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{pref.label}</h4>
                                 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{pref.desc}</p>
                               </div>
                             </div>
                             <button 
                               onClick={() => setSettings({...settings, [pref.id]: !settings[pref.id as keyof typeof settings]})}
                               className={`w-12 h-6 rounded-full relative transition-colors duration-200 self-end sm:self-center ${settings[pref.id as keyof typeof settings] ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"}`}
                             >
                                <motion.div 
                                  animate={{ x: settings[pref.id as keyof typeof settings] ? 26 : 4 }}
                                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                />
                             </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "data" && (
                <motion.div
                  key="data"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8 z-10 relative"
                >
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Business Data Hub</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">Manually update your business metrics (revenue goal and conversion rate) or configure weekly revenue chart points.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Revenue Goal ($)</label>
                           <div className="relative">
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">$</span>
                             <input 
                               type="text"
                               inputMode="numeric"
                               value={businessData.revenueGoal}
                               onChange={(e) => {
                                 const val = e.target.value.replace(/[^0-9]/g, '');
                                 setBusinessData({...businessData, revenueGoal: val ? Number(val) : 0})
                               }}
                               className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pl-8 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all font-bold text-slate-900 dark:text-slate-100" 
                             />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Conversion Rate (%)</label>
                           <div className="relative">
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">%</span>
                             <input 
                               type="text"
                               inputMode="decimal"
                               value={businessData.conversion}
                               onChange={(e) => {
                                 const val = e.target.value.replace(/[^0-9.]/g, '');
                                 // Ensure only one decimal point
                                 const parts = val.split('.');
                                 const sanitized = parts[0] + (parts[1] ? '.' + parts[1].slice(0, 2) : '');
                                 setBusinessData({...businessData, conversion: sanitized ? Number(sanitized) : 0})
                               }}
                               className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all font-bold text-slate-900 dark:text-slate-100" 
                             />
                           </div>
                       </div>
                    </div>
                    <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 dark:border-slate-700/50 mb-8">
                       <div className="flex items-center justify-between mb-6">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Automation & Synchronization</h4>
                          <Zap className="w-4 h-4 text-amber-500" />
                       </div>
                       <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                          Synchronizing from orders will automatically recalculate your total revenue and sales based on the items in your order database. It will also update the weekly revenue chart points.
                       </p>
                       <button 
                        onClick={handleSyncFromOrders}
                        className="w-full py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                       >
                         <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> 
                         Sync Everything from Orders
                       </button>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 px-1">
                          <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Weekly Chart Data
                       </h4>
                       <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                          {businessData.chartDataPeriods.week.map((d, i) => (
                             <div key={d.name} className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase text-center block">{d.name}</label>
                                <div className="relative">
                                  <input 
                                    type="text"
                                    inputMode="numeric"
                                    value={d.value}
                                    onChange={(e) => {
                                       const val = e.target.value.replace(/[^0-9]/g, '');
                                       const newWeek = [...businessData.chartDataPeriods.week];
                                       newWeek[i] = { ...newWeek[i], value: val ? Number(val) : 0 };
                                       setBusinessData({
                                          ...businessData,
                                          chartDataPeriods: { ...businessData.chartDataPeriods, week: newWeek }
                                       });
                                    }}
                                     className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 rounded-lg px-2 py-3 text-[11px] font-bold text-center focus:ring-2 focus:ring-indigo-500/10 outline-none text-slate-900 dark:text-slate-100 transition-all hover:border-indigo-200 dark:hover:border-indigo-600"
                                  />
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8 z-10 relative"
                >
                   <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">Security Settings</h3>
                    <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                       <div className="flex gap-4">
                          <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm"><Shield className="w-6 h-6" /></div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Two-Factor Authentication</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Add an extra layer of security to your account.</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => setSettings({...settings, twoFactor: !settings.twoFactor})}
                         className={`w-full sm:w-auto px-6 py-2 rounded-xl text-xs font-bold transition-all ${settings.twoFactor ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50" : "bg-indigo-600 text-white shadow-lg shadow-indigo-100"}`}
                       >
                         {settings.twoFactor ? "Enabled" : "Enable"}
                       </button>
                    </div>

                    {/* Active Sessions */}
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2"><Monitor className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Active Sessions</h4>
                      <div className="space-y-3">
                        <AnimatePresence>
                          {sessions.map(s => {
                            const Icon = s.icon;
                            return (
                              <motion.div
                                key={s.id}
                                initial={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 gap-4"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm text-slate-400 dark:text-slate-500">
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                      {s.device}
                                      {s.current && <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold rounded-full uppercase tracking-wider">Current</span>}
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{s.location} · {s.time}</p>
                                  </div>
                                </div>
                                {!s.current && (
                                  <button
                                    onClick={() => handleRemoveSession(s.id)}
                                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                                    title="Remove session"
                                  >
                                    <LogOut className="w-4 h-4" />
                                  </button>
                                )}
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-xs font-bold text-rose-500 dark:text-rose-400 flex items-center gap-2 px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                       <Trash2 className="w-4 h-4" /> Delete Account
                    </button>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-end items-center gap-3 z-10 relative">
                <button className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold text-sm hover:text-slate-900 dark:hover:text-slate-100 transition-colors rounded-2xl">Discard Changes</button>

               <button 
                onClick={activeTab === "data" ? handleSaveBusinessData : handleSave}
                disabled={isSaving}
                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 dark:shadow-indigo-500/10 text-sm flex items-center gap-2 min-w-[140px] justify-center"
               >
                 {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                 {isSaving ? "Saving..." : "Save Changes"}
               </button>
            </div>
          </SpotlightCard>
        </div>
      </div>

      {/* Global Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 dark:bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 dark:border-slate-700/50"
          >
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="font-bold tracking-tight">Settings updated successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}
              className="fixed inset-0 z-[1100]"
            />
            <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl pointer-events-auto"
              >
                <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-100 dark:border-rose-800/50">
                  <AlertTriangle className="w-8 h-8 text-rose-500 dark:text-rose-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-2">Delete Account?</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center font-medium mb-8 leading-relaxed">
                  This will permanently erase all your data, settings, and orders. This action <strong>cannot</strong> be undone.
                </p>
                <div className="space-y-3 mb-6">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Type DELETE to confirm</label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 outline-none transition-all text-center tracking-widest text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== "DELETE"}
                    className="flex-1 py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-500/20 dark:shadow-rose-500/10 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Delete Forever
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Payment Processing Modal */}
      <AnimatePresence>
        {isPaying && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1100]"
            />
            <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                key={paymentStep}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 text-center shadow-2xl pointer-events-auto"
              >
               {paymentStep === 1 ? (
                 <>
                   <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                     <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">Processing Payment</h3>
                   <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Please wait while we secure your transaction and prepare your Business Premium workspace...</p>
                 </>
               ) : (
                 <>
                   <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-100 dark:border-emerald-800/50">
                     <CheckCircle2 className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">Payment Successful!</h3>
                   <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">Welcome to NexBiz Business Premium. Your new features are now unlocked and ready to use.</p>
                   <button 
                    onClick={() => setIsPaying(false)}
                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 dark:shadow-indigo-500/10"
                   >
                     Get Started
                   </button>
                 </>
               )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
