import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, 
  MapPin, 
  Briefcase, 
  Mail, 
  Phone, 
  Edit2, 
  Save, 
  X,
  Check,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  Upload
} from "lucide-react";
import React, { useState, useRef } from "react";
import { auth } from "../utils/auth";

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("NexBiz_profile");
    const email = auth.getCurrentEmail();
    return saved ? JSON.parse(saved) : {
      name: email ? email.split("@")[0] : "User",
      role: "User",
      location: "Remote",
      email: email || "",
      phone: "+1 (555) 000-0000",
      bio: "Member of NexBiz platform.",
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${email || "user"}&backgroundColor=6366f1&textColor=ffffff`
    };
  });

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      setShowSavedToast(true);
      localStorage.setItem("NexBiz_profile", JSON.stringify(profile));
      
      // Dispatch custom event for global sync
      window.dispatchEvent(new CustomEvent("NexBiz_profile_updated", { detail: profile }));
      
      setTimeout(() => setShowSavedToast(false), 3000);
    }, 1000);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app we'd upload and get a URL, here we'll use URL.createObjectURL for simulation
      const url = URL.createObjectURL(file);
      setProfile({...profile, avatar: url});
      localStorage.setItem("NexBiz_profile", JSON.stringify({...profile, avatar: url}));
      window.dispatchEvent(new CustomEvent("NexBiz_profile_updated", { detail: {...profile, avatar: url} }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        staggerChildren: 0.1,
        delayChildren: 0.1
      }}
      className="space-y-6 sm:space-y-8"
    >
       <input 
         type="file" 
         ref={fileInputRef} 
         onChange={handleFileChange} 
         className="hidden" 
         accept="image/*"
       />

       {/* Saved Toast */}
       <AnimatePresence>
        {showSavedToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 dark:bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 dark:border-slate-700"
          >
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <span className="font-bold">Profile updated successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cover Profile */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden mb-6 sm:mb-8 shadow-2xl shadow-indigo-500/10"
      >
        <div className="h-52 sm:h-72 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 relative">
          <img 
            src="https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover mix-blend-overlay opacity-40"
            alt="Cover"
          />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent p-5 sm:p-8 md:p-10 flex flex-col md:flex-row items-center md:items-end gap-5 sm:gap-6">
          <div className="relative group">
            <div 
              onClick={handleAvatarClick}
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-[1.5rem] sm:rounded-[2rem] border-4 border-white dark:border-slate-700/50 shadow-2xl overflow-hidden bg-white dark:bg-slate-900 transition-transform group-hover:scale-[1.02] cursor-pointer"
            >
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Upload className="w-8 h-8" />
              </div>
            </div>
            <button 
              onClick={handleAvatarClick}
              className="absolute -bottom-1 -right-1 p-2.5 sm:p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl sm:rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all shadow-xl border border-slate-100 dark:border-slate-700/50 transform translate-y-1 group-hover:translate-y-0"
            >
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          
          <div className="flex-1 pb-2 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-white tracking-tight">{profile.name}</h1>
              {isEditing && (
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full">Editing Mode</span>
              )}
            </div>
            <p className="text-indigo-100/90 font-medium flex flex-wrap items-center justify-center md:justify-start gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm md:text-base">
              <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 opacity-70" /> {profile.role}</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 opacity-70" /> {profile.location}</span>
            </p>
          </div>
          
          <div className="pb-2 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
            {isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl sm:rounded-2xl hover:bg-white/20 transition-all border border-white/20 text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleSave()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl sm:rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all shadow-xl shadow-white/10 text-sm"
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold rounded-xl sm:rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all shadow-xl group border border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/30 text-sm"
              >
                <Edit2 className="w-4 h-4 transition-transform group-hover:rotate-12" /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8"
      >
        <div className="space-y-8">
          <div className="bento-card p-5 sm:p-8">
            <h3 className="font-bold text-xl mb-6 text-slate-900 dark:text-slate-100 font-display">Introduction</h3>
            {isEditing ? (
              <textarea 
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                rows={5}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none mb-4"
              />
            ) : (
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-8">
                {profile.bio}
              </p>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 group">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors shadow-sm">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Email</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 break-all">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 group">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors shadow-sm">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Phone</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{profile.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bento-card p-5 sm:p-8 h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 font-display">Personal Information</h3>
            </div>
            
            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    readOnly={!isEditing}
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className={`w-full rounded-2xl px-5 py-3.5 text-sm transition-all outline-none ${
                    isEditing 
                      ? "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500" 
                      : "bg-white dark:bg-slate-900 border-transparent cursor-default font-bold text-slate-900 dark:text-slate-100"}`} 
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Job Title</label>
                  <input 
                    type="text" 
                    readOnly={!isEditing}
                    value={profile.role}
                    onChange={(e) => setProfile({...profile, role: e.target.value})}
                    className={`w-full rounded-2xl px-5 py-3.5 text-sm transition-all outline-none ${
                    isEditing 
                      ? "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500" 
                      : "bg-white dark:bg-slate-900 border-transparent cursor-default font-bold text-slate-900 dark:text-slate-100"}`} 
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
