import React, { useState, useEffect, useRef } from "react";
import { Search, Plus, Filter, Eye, Trash2, Download, AlertCircle, X, Clock, DollarSign, Package, Check, ChevronDown } from "../../components/Icons";
import { SpotlightCard } from "../../components/ui/SpotlightCard";
import { RotatingText } from "../../components/ui/RotatingText";
import { NumberInput } from "../../components/ui/NumberInput";
import { getBusinessData, updateOrder, addOrder, deleteOrder, BUSINESS_DATA_UPDATED, Order } from "../../utils/store";
export function Orders() {
    const [data, setData] = useState(getBusinessData());
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isAddingOrder, setIsAddingOrder] = useState(false);
    const orderFileRef = useRef<HTMLInputElement>(null);
    const [orderAvatarPreview, setOrderAvatarPreview] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string | "All">("All");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    useEffect(() => {
        const isModalOpen = !!selectedOrder || isAddingOrder;
        window.dispatchEvent(new CustomEvent("NexBiz_modal_state", { detail: { open: isModalOpen } }));
    }, [selectedOrder, isAddingOrder]);
    useEffect(() => {
        const handleUpdate = () => setData(getBusinessData());
        window.addEventListener(BUSINESS_DATA_UPDATED, handleUpdate);
        return () => window.removeEventListener(BUSINESS_DATA_UPDATED, handleUpdate);
    }, []);
    const orders = data.orders;
    const filteredOrders = orders.filter((order: any) => {
        const matchesSearch = order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "All" || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });
    const handleDeleteOrder = (id: string) => {
        deleteOrder(id);
    };
    const handleApprove = (id: string) => {
        updateOrder(id, "Completed");
        if (selectedOrder?.id === id)
            setSelectedOrder(null);
    };
    const handleOrderFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file)
            setOrderAvatarPreview(URL.createObjectURL(file));
    };
    const handleCreateOrder = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const amount = parseFloat(formData.get("total") as string) || 0;
        const customer = (formData.get("customer") as string) || "";
        const status = (formData.get("status") as Order["status"]) || "Pending";
        const items = parseInt(formData.get("items") as string) || 1;
        setTimeout(() => {
            const newOrder: Order = {
                id: `#${Math.floor(2900 + Math.random() * 1000)}`,
                customer,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                total: `$${amount.toFixed(2)}`,
                rawTotal: amount,
                status,
                items,
                avatar: orderAvatarPreview || `https://ui-avatars.com/api/?name=${customer}&background=random`
            };
            addOrder(newOrder);
            setIsAddingOrder(false);
            setOrderAvatarPreview(null);
            setIsSubmitting(false);
        }, 800);
    };
    return (<div className="space-y-4 sm:space-y-6 animate-fade-in transition-all duration-300">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 transition-all duration-300">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Orders
            </h1>
            <div className="relative inline-flex items-center">
              <RotatingText texts={["Pipeline", "Analytics", "Intelligence", "History"]} mainClassName="text-2xl sm:text-3xl font-bold text-slate-500 dark:text-slate-400 relative z-10" staggerDuration={0.02} rotationInterval={3500} splitBy="characters"/>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">
            Integrated Data Center • Persistent Order State
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            const header = "Order ID,Customer,Date,Status,Amount,Items\n";
            const rows = orders.map((o: any) => `${o.id},"${o.customer}",${o.date},${o.status},${o.total},${o.items}`).join("\n");
            const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `lumina-orders-${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors shadow-sm text-sm">
            <Download className="w-4 h-4"/> Export CSV
          </button>
          <button onClick={() => setIsAddingOrder(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md text-sm">
            <Plus className="w-4 h-4"/> Create Order
          </button>
        </div>
      </div>

      <div className="transition-all duration-300">
        <SpotlightCard className="p-0" allowOverflow={true}>
        
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 !bg-white dark:!bg-slate-900 z-20 relative">
          <div className="relative group w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors"/>
            <input type="text" placeholder="Search persistent orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"/>
          </div>

          
          <div className="flex items-center gap-2 w-full sm:w-auto relative" ref={filterRef}>
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border text-sm font-bold rounded-xl transition-colors ${isFilterOpen
            ? "bg-indigo-600 border-indigo-600 text-white"
            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}>
              <Filter className="w-4 h-4"/>
              Filters
              {filterStatus !== "All" && (<span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"/>)}
            </button>

            {isFilterOpen && (<div className="absolute top-full right-0 mt-2 w-52 rounded-2xl overflow-hidden z-[9999] shadow-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 transition-all duration-300">
                  <div className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest" style={{
                color: '#64748b',
                background: 'inherit',
                borderBottom: '1px solid ' + (window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1e293b' : '#f1f5f9')
            }}>
                    Filter by Status
                  </div>
                  <div className="p-2 space-y-0.5">
                    {[
                { label: "All", dot: "#64748b" },
                { label: "Pending", dot: "#f59e0b" },
                { label: "Processing", dot: "#6366f1" },
                { label: "Completed", dot: "#10b981" },
            ].map(({ label, dot }) => {
                const isActive = filterStatus === label;
                return (<button key={label} onClick={() => { setFilterStatus(label); setIsFilterOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                        ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400"}`}>
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dot }}/>
                            {label}
                          </div>
                          {isActive && <Check className="w-3.5 h-3.5" style={{ color: '#6366f1' }}/>}
                        </button>);
            })}
                  </div>

                  {filterStatus !== "All" && (<div className="px-2 pb-2 pt-1" style={{ borderTop: '1px solid ' + (window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1e293b' : '#f1f5f9') }}>
                        <button onClick={() => { setFilterStatus("All"); setIsFilterOpen(false); }} className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600">
                        <X className="w-3.5 h-3.5"/> Clear Filter
                      </button>
                    </div>)}
                </div>)}
          </div>
        </div>

        
        <div className="overflow-x-auto z-10 relative">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/30 dark:bg-slate-800/30">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Customer</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredOrders.length > 0 ? (filteredOrders.map((order: any) => (<tr key={order.id} className="group hover:bg-indigo-50/20 dark:hover:bg-indigo-500/20 transition-colors cursor-pointer duration-300">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{order.id}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img src={order.avatar} className="w-9 h-9 rounded-xl border-2 border-white dark:border-slate-700/50 shadow-sm object-cover" alt=""/>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{order.customer}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm font-bold text-slate-400 dark:text-slate-500">{order.date}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === "Completed" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                order.status === "Processing" ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" :
                    "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${order.status === "Completed" ? "bg-emerald-500" :
                order.status === "Processing" ? "bg-indigo-500" :
                    "bg-amber-500"}`}/>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{order.total}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          {order.status !== "Completed" && (<button onClick={(e) => { e.stopPropagation(); handleApprove(order.id); }} className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl shadow-sm transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase">
                              <Check className="w-3.5 h-3.5"/> Approve
                            </button>)}
                          <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }} className="p-2.5 hover:bg-white dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl shadow-sm transition-all">
                            <Eye className="w-4 h-4"/>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setOrderToDelete(order.id); }} className="p-2.5 hover:bg-white dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl shadow-sm transition-all">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                      </td>
                    </tr>))) : (<tr className="bg-white dark:bg-slate-900 transition-all duration-300">
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-6">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 rounded-[2rem] flex items-center justify-center shadow-inner">
                          <Search className="w-7 h-7 text-slate-300 dark:text-slate-600"/>
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">No matching orders found</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Try adjusting your filters or search query.</p>
                        </div>
                        {(searchQuery || filterStatus !== "All") && (<button onClick={() => { setSearchQuery(""); setFilterStatus("All"); }} className="mt-2 px-6 py-2.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-black dark:hover:bg-slate-700 transition-all border border-slate-800 dark:border-slate-700">
                            Reset All Filters
                          </button>)}
                      </div>
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div>
      </SpotlightCard>
      </div>



      
      {isAddingOrder && (<>
          <div onClick={() => setIsAddingOrder(false)} className="fixed inset-0 z-[1100] transition-opacity duration-300 bg-black/20"/>
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 pointer-events-none transition-all duration-300">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden p-6 sm:p-10 pointer-events-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6 sm:mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Plus className="w-8 h-8"/>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Create Order</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-60">Persistent Storage</p>
                  </div>
                </div>
                <button onClick={() => setIsAddingOrder(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400 dark:text-slate-500"/>
                </button>
              </div>
              <form onSubmit={handleCreateOrder} className="space-y-8">
                <div className="flex justify-center mb-2">
                  <div onClick={() => orderFileRef.current?.click()} className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all overflow-hidden">
                    {orderAvatarPreview
                ? <img src={orderAvatarPreview} className="w-full h-full object-cover"/>
                : <Plus className="w-6 h-6 text-slate-400 dark:text-slate-500"/>}
                  </div>
                  <input type="file" ref={orderFileRef} onChange={handleOrderFileChange} accept="image/*" className="hidden"/>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Customer Name</label>
                  <input required name="customer" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600" placeholder="e.g. Elena Smith"/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <NumberInput label="Total Amount" name="total" step={1} required placeholder="0.00" icon={DollarSign} showControls={false}/>
                  <NumberInput label="Product Qty" name="items" defaultValue={1} min={1} required icon={Package} showControls={false}/>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Initial Status</label>
                    <div className="relative group">
                      <select name="status" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all text-slate-900 dark:text-slate-100 appearance-none cursor-pointer">
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 pointer-events-none transition-colors"/>
                    </div>
                  </div>
                </div>
                <div className="pt-4 sm:pt-6 flex gap-3 sm:gap-4">
                  <button type="button" onClick={() => setIsAddingOrder(false)} className="flex-1 py-3 sm:py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 dark:border-t-white/20 backdrop-blur-md text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all text-sm shadow-sm dark:shadow-xl dark:shadow-black/20" disabled={isSubmitting}>Discard</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-3 sm:py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg text-sm flex items-center justify-center gap-2">
                    {isSubmitting ? (<>
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        Saving...
                      </>) : "Submit Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>)}

      
      {selectedOrder && (<>
          <div onClick={() => setSelectedOrder(null)} className="fixed inset-0 z-[1100] transition-opacity duration-300 bg-black/20"/>
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 pointer-events-none transition-all duration-300">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto max-h-[90vh] overflow-y-auto">
              <div className="p-6 sm:p-10 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <img src={selectedOrder.avatar} className="w-16 h-16 rounded-2xl border-4 border-white dark:border-slate-700/50 shadow-md object-cover" alt=""/>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{selectedOrder.customer}</h2>
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Order {selectedOrder.id}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest ${selectedOrder.status === "Completed" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                selectedOrder.status === "Processing" ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" :
                    "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Entry Date</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedOrder.date}</p>
                  </div>
                  <div className="space-y-1 text-left sm:text-center">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Volume</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedOrder.items} SKU</p>
                  </div>
                  <div className="space-y-1 text-left sm:text-right">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Value</p>
                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{selectedOrder.total}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                {selectedOrder.status !== "Completed" ? (<div className="p-6 sm:p-8 bg-amber-50/50 dark:bg-amber-500/10 border-2 border-dashed border-amber-200 dark:border-amber-500/20 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-amber-100 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                      <AlertCircle className="w-8 h-8"/>
                    </div>
                    <h4 className="text-lg font-bold text-amber-900 dark:text-amber-100">Awaiting Executive Approval</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-200 mt-2 font-medium leading-relaxed max-w-xs">Approving this order will instantly update the global business revenue and growth diagrams.</p>
                    <div className="flex flex-col gap-3 mt-6 sm:mt-8 w-full">
                      {selectedOrder.status === "Pending" && (<button onClick={() => {
                        updateOrder(selectedOrder.id, "Processing");
                        setSelectedOrder(null);
                    }} className="w-full py-3 sm:py-4 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4 flex-shrink-0"/> Start Processing
                        </button>)}
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => handleApprove(selectedOrder.id)} className="py-3 sm:py-4 bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2">
                          <Check className="w-4 h-4 flex-shrink-0"/> Approve
                        </button>
                        <button onClick={() => {
                    handleDeleteOrder(selectedOrder.id);
                    setSelectedOrder(null);
                }} className="py-3 sm:py-4 bg-white dark:bg-white/5 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-white/10 dark:border-t-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-rose-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                          <X className="w-4 h-4 flex-shrink-0"/> Reject
                        </button>
                      </div>
                    </div>
                  </div>) : (<div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                      <Clock className="w-5 h-5 text-slate-400 dark:text-slate-500"/> Digital Trace Timeline
                    </h4>
                    <div className="space-y-6">
                      {[
                    { event: "Order Received", time: selectedOrder.date, active: true },
                    { event: "Digital Signature Verified", time: "Instant", active: true },
                    { event: "Asset Dispatch", time: "Complete", active: true }
                ].map((t, i) => (<div key={i} className="flex gap-6 relative">
                          {i < 2 && <div className="absolute left-[13px] top-8 w-0.5 h-8 bg-slate-100 dark:bg-slate-600/50"/>}
                          <div className={`w-7 h-7 rounded-full border-[6px] border-white dark:border-slate-700/50 shadow-md flex-shrink-0 z-10 ${t.active ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"}`}/>
                          <div className="flex-1">
                            <p className={`text-sm font-bold ${t.active ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}`}>{t.event}</p>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mt-1 opacity-60">{t.time}</p>
                          </div>
                        </div>))}
                    </div>
                  </div>)}
              </div>

              <div className="p-6 sm:p-10 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row gap-3 sm:gap-4 bg-slate-50/30 dark:bg-slate-800/30">
                <button onClick={() => setSelectedOrder(null)} className="flex-1 py-3 sm:py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 dark:border-t-white/20 backdrop-blur-md text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all text-sm shadow-sm dark:shadow-xl dark:shadow-black/20">
                  Discard
                </button>
                <button onClick={() => {
                const order = selectedOrder!;
                const receipt = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Receipt ${order.id}</title><style>body{font-family:Inter,sans-serif;max-width:520px;margin:40px auto;color:#1e293b;padding:32px}h1{font-size:24px;font-weight:800;margin:0 0 4px}p{margin:0;color:#64748b;font-size:14px}.badge{display:inline-block;padding:4px 14px;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;background:${order.status === "Completed" ? "#ecfdf5" : order.status === "Processing" ? "#eef2ff" : "#fffbeb"};color:${order.status === "Completed" ? "#059669" : order.status === "Processing" ? "#4f46e5" : "#d97706"}}.row{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid #f1f5f9;font-size:14px}.label{color:#94a3b8;font-weight:600}.value{font-weight:700}.total{font-size:22px;font-weight:800;color:#4f46e5}.logo{font-size:18px;font-weight:900;color:#4f46e5;margin-bottom:32px}hr{border:none;border-top:2px solid #f1f5f9;margin:24px 0}@media print{body{margin:0}}</style></head><body><div class="logo">⚡ NexBiz</div><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px"><div><h1>${order.customer}</h1><p>Order ${order.id}</p></div><span class="badge">${order.status}</span></div><hr/><div class="row"><span class="label">Date</span><span class="value">${order.date}</span></div><div class="row"><span class="label">Items</span><span class="value">${order.items} SKU</span></div><div class="row"><span class="label">Total Amount</span><span class="value total">${order.total}</span></div><hr/><p style="font-size:12px;color:#94a3b8;text-align:center">Thank you for choosing NexBiz Business Suite · NexBiz.co</p><script>window.onload=()=>window.print();</script></body></html>`;
                const win = window.open("", "_blank");
                if (win) {
                    win.document.write(receipt);
                    win.document.close();
                }
            }} className="flex-1 py-3 sm:py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl text-sm flex items-center justify-center gap-2">
                  <Download className="w-4 h-4"/> Download PDF
                </button>
              </div>
            </div>
          </div>
        </>)}

      
      {orderToDelete && (<>
          <div onClick={() => setOrderToDelete(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1300] transition-opacity duration-300"/>
          <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4 pointer-events-none transition-all duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl pointer-events-auto border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 mb-5">
                <Trash2 className="w-6 h-6"/>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Delete Order?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
                This action cannot be undone. This order will be permanently removed from the business hub.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setOrderToDelete(null)} className="flex-1 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 dark:border-t-white/20 backdrop-blur-md font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-sm shadow-sm dark:shadow-lg dark:shadow-black/20">
                  Cancel
                </button>
                <button onClick={() => {
                handleDeleteOrder(orderToDelete);
                setOrderToDelete(null);
            }} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors text-sm shadow-lg shadow-rose-500/20">
                  Delete Now
                </button>
              </div>
            </div>
          </div>
        </>)}
    </div>);
}
