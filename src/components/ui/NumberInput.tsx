import React, { useState } from "react";
import { Plus, Minus } from "../Icons";
interface NumberInputProps {
    id?: string;
    name: string;
    label?: string;
    value?: number | string;
    defaultValue?: number | string;
    onChange?: (val: number) => void;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    required?: boolean;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
    className?: string;
    showMultiplier?: boolean;
    showControls?: boolean;
}
export const NumberInput: React.FC<NumberInputProps> = ({ id, name, label, value: controlledValue, defaultValue, onChange, min, max, step = 1, placeholder, required, icon: Icon, className = "", showMultiplier = false, showControls = true, }) => {
    const [multiplier, setMultiplier] = useState<1 | 10 | 100>(1);
    const [internalValue, setInternalValue] = useState<string>("");
    const [focused, setFocused] = useState(false);
    React.useEffect(() => {
        if (defaultValue !== undefined && internalValue === "") {
            setInternalValue(String(defaultValue));
        }
    }, [defaultValue]);
    const isControlled = controlledValue !== undefined;
    const rawDisplay = isControlled ? String(controlledValue) : internalValue;
    const formatNumber = (raw: string): string => {
        if (!raw || raw === "0")
            return raw;
        const num = Number(raw);
        if (num >= 1000000000) {
            const val = num / 1000000000;
            return val % 1 === 0 ? `${val}T` : `${parseFloat(val.toFixed(1))}T`;
        }
        if (num >= 1000000) {
            const val = num / 1000000;
            return val % 1 === 0 ? `${val}M` : `${parseFloat(val.toFixed(1))}M`;
        }
        if (num >= 1000) {
            const val = num / 1000;
            return val % 1 === 0 ? `${val}k` : `${parseFloat(val.toFixed(1))}k`;
        }
        return raw;
    };
    const displayValue = isControlled ? rawDisplay : (focused ? rawDisplay : formatNumber(rawDisplay));
    const commitValue = (raw: string) => {
        if (!isControlled)
            setInternalValue(raw);
        onChange?.(Number(raw) || 0);
    };
    const handleIncrement = () => {
        const currentNum = Number(rawDisplay) || 0;
        const next = currentNum + step * multiplier;
        if (max !== undefined && next > max)
            return;
        commitValue(String(next));
    };
    const handleDecrement = () => {
        const currentNum = Number(rawDisplay) || 0;
        const next = currentNum - step * multiplier;
        if (min !== undefined && next < min)
            return;
        commitValue(String(next));
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
            commitValue(raw);
        }
    };
    const handleFocus = () => setFocused(true);
    const handleBlur = () => setFocused(false);
    return (<div className={`space-y-3 ${className}`}>
      {label && (<div className="flex items-center justify-between pl-1">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {label}
          </label>
          {showMultiplier && (<div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl gap-1">
              {([1, 10, 100] as const).map((m) => (<button key={m} type="button" onClick={() => setMultiplier(m)} className={`px-3 py-1 text-[11px] font-black rounded-xl transition-all ${multiplier === m
                        ? "bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}>
                  {m}x
                </button>))}
            </div>)}
        </div>)}
      <div className="relative group flex items-center">
        {Icon && (<Icon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 dark:text-slate-300 pointer-events-none"/>)}
        <input id={id} name={name} required={required} type="text" inputMode="decimal" value={displayValue} onChange={handleInputChange} onFocus={handleFocus} onBlur={handleBlur} placeholder={placeholder} className={`w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl h-[68px] text-lg font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 ${showControls ? "pr-36" : "pr-8"} ${Icon ? "pl-14" : "pl-8"}`}/>
        {showControls && (<div className="absolute right-2.5 flex items-center gap-2">
            <button type="button" onClick={handleDecrement} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-600 dark:text-white hover:text-indigo-500 hover:border-indigo-200 dark:hover:bg-slate-600 transition-all active:scale-90" aria-label="Decrease">
              <Minus className="w-5 h-5"/>
            </button>
            <button type="button" onClick={handleIncrement} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-600 dark:text-white hover:text-indigo-500 hover:border-indigo-200 dark:hover:bg-slate-600 transition-all active:scale-90" aria-label="Increase">
              <Plus className="w-5 h-5"/>
            </button>
          </div>)}
      </div>
    </div>);
};
