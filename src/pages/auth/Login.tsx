import React, { useState, useRef } from "react";
import { useNavigate } from "../../lib/router";
import { ArrowRight, Mail, Lock, Sun, Moon } from "../../components/Icons";
import { NXLogo } from "../../components/ui/NXLogo";
import ShinyText from "../../components/ui/ShinyText";
import { auth } from "../../utils/auth";
import { useTheme } from "../../utils/ThemeContext";
function getUsers(): Record<string, any> {
    try {
        return JSON.parse(localStorage.getItem("NexBiz_users") || "{}");
    }
    catch {
        return {};
    }
}
function saveUsers(users: Record<string, any>) {
    localStorage.setItem("NexBiz_users", JSON.stringify(users));
}
function createUserProfile(email: string, count: number) {
    return {
        name: `user${count}`,
        role: "User",
        email,
        phone: "+1 (555) 000-0000",
        location: "Remote",
        bio: `User ${count} of NexBiz platform.`,
        avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${email}&backgroundColor=6366f1&textColor=ffffff`
    };
}
export function Login() {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const emailRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const email = emailRef.current?.value || "";
        setTimeout(() => {
            const users = getUsers();
            if (!users[email]) {
                const count = Object.keys(users).length + 1;
                users[email] = createUserProfile(email, count);
                saveUsers(users);
            }
            localStorage.setItem("NexBiz_profile", JSON.stringify(users[email]));
            auth.login(email);
            navigate("/");
        }, 1500);
    };
    const isDark = theme === 'dark';
    return (<div className="min-h-screen w-full flex bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-indigo-950 transition-colors duration-300 relative overflow-hidden">

      
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 z-10 w-full lg:w-1/2">
        <div className="mx-auto w-full max-w-sm lg:w-96 animate-fade-in transition-all duration-500">
          <div className="flex items-center gap-3 mb-10">
            <div className="transition-transform hover:scale-105 duration-300">
              <NXLogo size={48}/>
            </div>
            <span className="font-display font-bold text-3xl tracking-tighter">
              <ShinyText text="NexBiz" color={theme === "dark" ? "#e2e8f0" : "#1e293b"} shineColor="#60a5fa" speed={3} yoyo={true}/>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
              Elevate your business.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Log in to your command center and manage your growth with precision.
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 ml-1">
                  Business Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-600">
                    <Mail className="w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600"/>
                  </div>
                  <input ref={emailRef} type="email" required className="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-inset ring-slate-200 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-md transition-all hover:bg-white dark:hover:bg-slate-800" placeholder="name@company.com"/>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 ml-1">
                  Secret Key
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600"/>
                  </div>
                  <input type="password" required className="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-inset ring-slate-200 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-md transition-all hover:bg-white dark:hover:bg-slate-800" placeholder="••••••••••••"/>
                </div>
              </div>

              <div className="flex items-center py-2">
                <div className="flex items-center">
                  <input id="remember-me" type="checkbox" className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-600 cursor-pointer"/>
                  <label htmlFor="remember-me" className="ml-3 block text-sm font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                    Stay logged in
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className="group relative w-full rounded-2xl accent-gradient p-[1px] shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all">
                  <div className="bg-slate-900 group-hover:bg-transparent transition-colors rounded-[15px] px-6 py-4 flex items-center justify-center gap-3">
                    <span className={`text-white font-bold transition-all duration-300 ${isSubmitting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                      Access Terminal
                    </span>
                    <div className={`transition-transform duration-300 group-hover:translate-x-1 ${isSubmitting ? 'opacity-0' : 'opacity-100'}`}>
                      <ArrowRight className="w-5 h-5 text-white"/>
                    </div>
                    
                    {isSubmitting && (<div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                      </div>)}
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>

          
          <div className="mt-10 text-center">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              Created by <span className="text-indigo-500 dark:text-indigo-400">I Putu Ganendra Danadyaksa</span>
            </p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <img src="/logo_sekolah.png" alt="Logo SMK TI Bali Global Denpasar" className="w-5 h-5 object-contain"/>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">SMK TI BALI GLOBAL DENPASAR</p>
            </div>
          </div>
      </div>

      
      <div className="hidden lg:block relative w-1/2 overflow-hidden bg-slate-900">
        <img className="absolute inset-0 h-full w-full object-cover mix-blend-luminosity opacity-60 animate-fade-in transition-opacity duration-1000" src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" alt="Modern Business Architecture"/>
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/90 via-slate-900/60 to-transparent"/>
        
        <div className="absolute inset-0 flex items-center justify-center p-20">
          <div className="backdrop-blur-xl bg-white/5 p-12 rounded-[40px] border border-white/10 shadow-2xl max-w-xl animate-fade-in transition-all duration-1000">
            <div className="mb-6 inline-block rounded-full bg-indigo-500/20 px-4 py-1 border border-indigo-500/30">
               <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Enterprise Edition</span>
            </div>
            <h3 className="text-4xl font-display font-bold text-white mb-6 leading-[1.1]">
              Strategic insights for the next generation of commerce.
            </h3>
            <p className="text-indigo-100/70 text-lg leading-relaxed mb-8">
              NexBiz delivers real-time analytics and predictive modeling to help you stay ahead of the competition and maximize operational efficiency.
            </p>
            <div className="flex items-center gap-6">
               <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (<div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-white">VP</div>))}
               </div>
               <p className="text-sm text-slate-400"><span className="text-white font-bold">500+</span> leaders trust NexBiz daily</p>
            </div>
          </div>
        </div>
      </div>

      
      <button onClick={toggleTheme} className="fixed bottom-6 right-6 z-[900] w-12 h-12 rounded-2xl shadow-xl shadow-slate-900/20 dark:shadow-indigo-500/10 flex items-center justify-center accent-gradient hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden" aria-label="Toggle dark mode">
        <div className="transition-all duration-300">
          {theme === "dark" ? <Sun className="w-5 h-5 text-white"/> : <Moon className="w-5 h-5 text-white"/>}
        </div>
      </button>
    </div>);
}
