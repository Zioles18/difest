import { motion } from "motion/react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { SpotlightCard } from "./SpotlightCard";

export function ActionItems() {
  const [items, setItems] = useState([
    {
      id: 1,
      title: "Review Q3 Marketing Deck",
      time: "2 hours ago",
      status: "pending",
      icon: Clock,
      color: "text-amber-500",
      done: false,
    },
    {
      id: 2,
      title: "Approve vendor invoices",
      time: "5 hours ago",
      status: "urgent",
      icon: AlertCircle,
      color: "text-rose-500",
      done: false,
    },
    {
      id: 3,
      title: "Weekly sync with product team",
      time: "1 day ago",
      status: "completed",
      icon: CheckCircle2,
      color: "text-emerald-500",
      done: true,
    },
  ]);

  const toggleDone = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done, icon: !item.done ? CheckCircle2 : (item.status === 'urgent' ? AlertCircle : Clock), color: !item.done ? 'text-emerald-500' : (item.status === 'urgent' ? 'text-rose-500' : 'text-amber-500') } : item
      )
    );
  };

  return (
    <SpotlightCard className="h-full">
      <div className="flex justify-between items-center mb-6 w-full z-10">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Tasks</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Action Items</p>
        </div>
        <button 
          onClick={() => console.log("View All Action Items clicked")}
          className="text-xs font-medium text-slate-900 dark:text-slate-100 hover:text-slate-500 dark:hover:text-slate-400 transition-colors"
        >
          View All
        </button>
      </div>

      <div className="space-y-3 z-10">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              onClick={() => toggleDone(item.id)}
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`flex items-center gap-4 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 hover:shadow-[0_2px_10px_-4px_rgba(15,23,42,0.05)] dark:hover:shadow-none rounded-2xl transition-all cursor-pointer group border ${item.done ? "opacity-60 border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 grayscale pt-3" : "border-transparent hover:border-slate-100 dark:hover:border-slate-700/50"}`}
            >
              <div
                className={`mt-0.5 ${item.color} bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50 group-hover:ring-transparent group-hover:bg-opacity-10 p-2.5 rounded-xl transition-all duration-300`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors ${item.done ? "line-through text-slate-500 dark:text-slate-400" : "group-hover:text-slate-900 dark:group-hover:text-slate-100"}`}>
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    {item.time}
                  </p>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center justify-center text-slate-400 dark:text-slate-500">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SpotlightCard>
  );
}
