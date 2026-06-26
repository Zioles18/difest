import { useOutletContext } from "../../lib/router";
import { Construction } from "../../components/Icons";

export function UnderDevelopment() {
  const { activeTab } = useOutletContext<{ dateRange: string; activeTab: string }>();

  return (
    <div className="flex flex-col items-center justify-center py-28 px-4 bento-card animate-fade-in">
      <div className="w-20 h-20 accent-gradient rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
        <Construction className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 mb-2">{activeTab}</h2>
      <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm text-sm leading-relaxed">
        This section is currently under development. Please check back later for updates to the{" "}
        <span className="font-semibold text-slate-700 dark:text-slate-300">{activeTab}</span> module.
      </p>
    </div>
  );
}
