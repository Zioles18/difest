import { 
  Users, 
  Search, 
  UserPlus, 
  Mail, 
  MapPin, 
  ExternalLink,
  CheckCircle2,
  X,
  MessageSquare,
  Plus,
  Trash2
} from "../../components/Icons";
import React, { useState, useRef, useEffect } from "react";
import { SpotlightCard } from "../../components/ui/SpotlightCard";
import { addNotification, updateBusinessData } from "../../utils/store";
import { RotatingText } from "../../components/ui/RotatingText";
import { auth } from "../../utils/auth";

const initialCustomers = [
  { id: 1, name: "Alex Rivera", email: "alex@example.com", phone: "+1 (555) 123-4567", location: "New York, USA", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", spend: "$4,250", orders: 12, rating: 5, role: "Founder & CEO", joined: "Jan 2022" },
  { id: 2, name: "Sarah Chen", email: "sarah.c@example.com", phone: "+1 (555) 987-6543", location: "San Francisco, USA", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", spend: "$1,890", orders: 5, rating: 4, role: "Product Manager", joined: "Mar 2022" },
  { id: 3, name: "Marcus Johnson", email: "marcus.j@example.com", phone: "+1 (555) 456-7890", location: "London, UK", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", spend: "$8,400", orders: 24, rating: 5, role: "CTO", joined: "Jun 2021" },
];

const getCustomersKey = () => {
  const email = auth.getCurrentEmail();
  return email ? `NexBiz_customers_${email}` : "NexBiz_customers";
};

export function Customers() {
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem(getCustomersKey());
    return saved ? JSON.parse(saved) : initialCustomers;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [activeMessenger, setActiveMessenger] = useState<any>(null);
  const [message, setMessage] = useState("");
  const customerFileRef = useRef<HTMLInputElement>(null);
  const [customerAvatarPreview, setCustomerAvatarPreview] = useState<string | null>(null);

  // Broadcast modal state so Header/Layout can blur
  useEffect(() => {
    const isModalOpen = !!selectedCustomer || isAddingCustomer || !!activeMessenger;
    window.dispatchEvent(new CustomEvent("NexBiz_modal_state", { detail: { open: isModalOpen } }));
  }, [selectedCustomer, isAddingCustomer, activeMessenger]);
  
  // Persist customers to localStorage and sync count
  useEffect(() => {
    const savedCustomers = localStorage.getItem(getCustomersKey());
    const prevCount = savedCustomers ? JSON.parse(savedCustomers).length : 3;

    localStorage.setItem(getCustomersKey(), JSON.stringify(customers));
    
    if (prevCount !== customers.length) {
      updateBusinessData({ 
        activeUsers: customers.length,
        previousActiveUsers: prevCount 
      });
    }
  }, [customers]);

  // Persist messages by customer ID
  const [customerMessages, setCustomerMessages] = useState<Record<number, any[]>>({});
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessenger, customerMessages]);

  const filteredCustomers = customers.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeMessenger) return;
    
    const newMsg = { id: Date.now(), text: message, sender: "me", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const customerId = activeMessenger.id;
    
    setCustomerMessages(prev => ({
      ...prev,
      [customerId]: [...(prev[customerId] || []), newMsg]
    }));
    setMessage("");
    
    // Simulate auto-reply
    setTimeout(() => {
      const reply = { id: Date.now() + 1, text: "Thanks for reaching out! I'll get back to you shortly.", sender: activeMessenger.name, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setCustomerMessages(prev => ({
        ...prev,
        [customerId]: [...(prev[customerId] || []), reply]
      }));
      addNotification({ text: `${activeMessenger.name} replied: "${reply.text}"`, dot: "bg-indigo-500" });
    }, 1500);
  };

  const handleCustomerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomerAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAddCustomer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const randOrders = Math.floor(Math.random() * 15) + 1;
    const randSpend = (Math.random() * 4500 + 500).toFixed(0);
    const phones = ["+1 (555) 123-4567", "+1 (555) 987-6543", "+1 (555) 456-7890", "+1 (555) 234-5678", "+1 (555) 876-5432"];
    const newCustomer = {
      id: customers.length + 1,
      name,
      email: formData.get("email") as string,
      role: formData.get("role") as string,
      location: formData.get("location") as string,
      phone: phones[Math.floor(Math.random() * phones.length)],
      avatar: customerAvatarPreview || `https://i.pravatar.cc/300?u=${encodeURIComponent(name)}`,
      spend: `$${randSpend.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
      orders: randOrders,
      rating: Math.random() > 0.4 ? 5 : 4,
      joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
    setCustomers([newCustomer, ...customers]);
    setIsAddingCustomer(false);
    setCustomerAvatarPreview(null);
    addNotification({ text: `New customer ${name} joined`, dot: "bg-emerald-500" });
  };

  const currentMessages = activeMessenger ? (customerMessages[activeMessenger.id] || []) : [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Customers
            </h1>
            <div className="relative inline-flex items-center">
              <RotatingText
                texts={["Database", "Directory", "Relations", "Growth"]}
                mainClassName="text-xl sm:text-2xl font-bold text-slate-500 dark:text-slate-400 relative z-10"
                staggerDuration={0.02}
                rotationInterval={3500}
                splitBy="characters"
              />
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">View and manage your customer relationship.</p>
        </div>
        <button 
          onClick={() => setIsAddingCustomer(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10 text-sm"
        >
          <UserPlus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="relative group max-w-full sm:max-w-md transition-all duration-300">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Search customers..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 pl-10 sm:pl-12 pr-4 text-xs sm:text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 transition-all duration-300">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer: any) => (
            <div key={customer.id} className="transition-all duration-300">
              <SpotlightCard className="p-0 overflow-hidden">
                <div className="p-6 z-10 relative pointer-events-auto">
                  <div className="flex justify-between items-start mb-6">
                    <div className="relative">
                      <img 
                        src={customer.avatar} 
                        alt={customer.name} 
                        className="w-16 h-16 rounded-2xl border-2 border-white dark:border-slate-700/50 shadow-md object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => setSelectedCustomer(customer)}
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-700/50 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => { setActiveMessenger(customer); }}
                        className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 
                      onClick={() => setSelectedCustomer(customer)}
                      className="text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      {customer.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium break-all">{customer.email}</p>
                  </div>

                  <div className="mt-6 z-50 relative">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setSelectedCustomer(customer);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800/70 hover:bg-indigo-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-bold rounded-2xl transition-all border border-slate-200 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-500/30 shadow-sm cursor-pointer pointer-events-auto"
                    >
                      <ExternalLink className="w-4 h-4" /> View Profile
                    </button>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center transition-all duration-300">
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 rounded-[2rem] flex items-center justify-center shadow-inner">
                {searchTerm ? (
                  <Search className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                ) : (
                  <Users className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                )}
              </div>
              <div className="max-w-xs mx-auto text-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {searchTerm ? "No matching customers" : "No customers found"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {searchTerm 
                    ? "Try adjusting your search query to find specific customers."
                    : "Your customer directory is currently empty. Start by adding one."
                  }
                </p>
              </div>
              {searchTerm ? (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="mt-2 px-6 py-2.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-black dark:hover:bg-slate-700 transition-all border border-slate-800 dark:border-slate-700 shadow-lg"
                >
                  Reset Search
                </button>
              ) : (
                <button 
                  onClick={() => setIsAddingCustomer(true)}
                  className="mt-2 px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                >
                  Add First Customer
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Message Interface Slide-over */}
      {activeMessenger && (
        <>
          <div
            onClick={() => setActiveMessenger(null)}
            className="fixed inset-0 z-[1100] transition-opacity duration-300 bg-black/20"
          />
          <div className="fixed inset-0 z-[1200] pointer-events-none transition-all duration-300">
            <div className="absolute right-0 top-0 bottom-0 w-full sm:max-w-md bg-white dark:bg-slate-800 shadow-2xl flex flex-col pointer-events-auto">
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3 sm:gap-4">
                <img src={activeMessenger.avatar} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-white dark:border-slate-700/50 shadow-sm" alt="" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">{activeMessenger.name}</h3>
                  <p className="text-[10px] sm:text-xs text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Online
                  </p>
                </div>
              </div>
              <button onClick={() => setActiveMessenger(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
              {currentMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-sm font-medium pr-8 pl-8">No messages yet. Send a message to {activeMessenger.name.split(' ')[0]} to start a conversation.</p>
                </div>
              )}
              {currentMessages.map((msg: any) => (
                <div 
                  key={msg.id} 
                  className={`flex transition-all duration-300 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    msg.sender === "me" 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10 rounded-br-none" 
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100 rounded-bl-none"
                  }`}>
                    <p className="leading-relaxed font-medium">{msg.text}</p>
                    <p className={`text-[10px] mt-2 font-bold opacity-50 ${msg.sender === "me" ? "text-white" : "text-slate-500 dark:text-slate-400"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700/50">
              <div className="flex gap-2 p-1.5 sm:p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl items-center shadow-sm">
                <input 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent border-none text-sm px-3 focus:ring-0 outline-none"
                />
                <button 
                  type="submit"
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10"
                >
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </form>
            </div>
          </div>
        </>
      )}

      {/* Add Customer Modal */}
      {isAddingCustomer && (
        <>
          <div
            onClick={() => setIsAddingCustomer(false)}
            className="fixed inset-0 z-[1100] transition-opacity duration-300 bg-black/20"
          />
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 pointer-events-none transition-all duration-300">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 pointer-events-auto">
             <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Add New Customer</h2>
             <form onSubmit={handleAddCustomer} className="space-y-4">
               <div className="flex justify-center mb-2">
                 <div
                   onClick={() => customerFileRef.current?.click()}
                    className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all overflow-hidden"
                 >
                   {customerAvatarPreview ? (
                     <img src={customerAvatarPreview} className="w-full h-full object-cover" />
                   ) : (
                     <Plus className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                   )}
                 </div>
                 <input type="file" ref={customerFileRef} onChange={handleCustomerFileChange} accept="image/*" className="hidden" />
               </div>
               <div className="space-y-1.5">
<label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                  <input required name="name" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="Enter name" />
                </div>
                <div className="space-y-1.5">
<label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                  <input required name="email" type="email" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="Enter email" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Role</label>
                    <input name="role" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="e.g. CEO" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Location</label>
                    <input name="location" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="Global" />
                  </div>
               </div>
               <div className="pt-6 flex gap-3">
                 <button type="button" onClick={() => setIsAddingCustomer(false)} className="flex-1 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-sm">Cancel</button>
                 <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10">Add Customer</button>
               </div>
             </form>
            </div>
          </div>
        </>
      )}

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <>
          <div
            onClick={() => setSelectedCustomer(null)}
            className="fixed inset-0 z-[1100] transition-opacity duration-300 bg-black/20"
          />
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 pointer-events-none transition-all duration-300">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden pointer-events-auto">
            <div className="h-32 bg-gradient-to-r from-indigo-500 to-violet-600 relative overflow-hidden">
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
               <button 
                onClick={() => setSelectedCustomer(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-8 pb-8 relative">
              <div className="relative -mt-12 mb-6">
                <img 
                  src={selectedCustomer.avatar} 
                  alt={selectedCustomer.name} 
                  className="w-24 h-24 rounded-3xl border-4 border-white dark:border-slate-700/50 shadow-xl object-cover bg-white dark:bg-slate-800"
                />
                <div className="absolute bottom-2 left-20 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-700/50 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{selectedCustomer.name}</h2>
                <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">{selectedCustomer.role}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span className="text-sm font-medium">{selectedCustomer.email}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span className="text-sm font-medium">{selectedCustomer.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => { setActiveMessenger(selectedCustomer); setSelectedCustomer(null); }}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10"
                >
                  Send Message
                </button>
                <button 
                  onClick={() => { setSelectedCustomer(null); setIsAddingCustomer(true); }}
                  className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-sm"
                >
                  Edit
                </button>
                <button 
                  onClick={() => { setCustomers(customers.filter((c: any) => c.id !== selectedCustomer.id)); setSelectedCustomer(null); }}
                  className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 font-bold rounded-xl hover:bg-rose-100 transition-colors"
                  title="Delete customer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
