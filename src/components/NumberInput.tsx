import React, { useRef, useEffect, useState } from "react";
import { Plus, Minus, LucideIcon } from "lucide-react";

interface NumberInputProps {
  id?: string;
  name: string;
  label?: string;
  defaultValue?: number | string;
  value?: number | string;
  onChange?: (val: string) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  required?: boolean;
  icon?: LucideIcon;
  className?: string;
  showMultiplier?: boolean;
}

export function NumberInput({
  id,
  name,
  label,
  defaultValue,
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  required,
  icon: Icon,
  className = "",
  showMultiplier = false
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [multiplier, setMultiplier] = useState<1 | 10 | 100>(1);

  const handleIncrement = () => {
    if (inputRef.current) {
      const currentVal = parseFloat(inputRef.current.value || "0");
      const newVal = currentVal + (step * multiplier);
      if (max !== undefined && newVal > max) return;
      
      const roundedVal = Number(newVal.toFixed(10)).toString(); // Fix floating point precision
      inputRef.current.value = roundedVal;
      if (onChange) onChange(roundedVal);
      // Trigger native change event for forms
      inputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const handleDecrement = () => {
    if (inputRef.current) {
      const currentVal = parseFloat(inputRef.current.value || "0");
      const newVal = currentVal - (step * multiplier);
      if (min !== undefined && newVal < min) return;
      
      const roundedVal = Number(newVal.toFixed(10)).toString();
      inputRef.current.value = roundedVal;
      if (onChange) onChange(roundedVal);
      inputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <div className="flex items-center justify-between pl-1">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {label}
          </label>
          {showMultiplier && (
            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl gap-1 border border-transparent dark:border-white/5 dark:border-t-white/10 backdrop-blur-md transition-all">
              {([1, 10, 100] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMultiplier(m)}
                  className={`px-3 py-1 text-[11px] font-black rounded-lg transition-all ${
                    multiplier === m 
                      ? "bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm dark:shadow-lg dark:shadow-black/20 border-t border-transparent dark:border-t-white/20" 
                      : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  {m}x
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="relative group flex items-center">
        {Icon && (
          <Icon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
        )}
        <input
          ref={inputRef}
          id={id}
          required={required}
          name={name}
          type="number"
          min={min}
          max={max}
          step={step}
          defaultValue={defaultValue}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl h-[68px] pr-32 text-base font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 no-spin ${Icon ? 'pl-14' : 'pl-8'}`}
        />
        <div className="absolute right-2.5 flex items-center gap-2">
          <button
            type="button"
            onClick={handleDecrement}
            className="w-12 h-12 flex items-center justify-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 dark:border-t-white/20 backdrop-blur-md rounded-2xl text-slate-400 hover:text-indigo-500 hover:border-indigo-200 dark:hover:bg-white/10 hover:shadow-md dark:shadow-lg dark:shadow-black/20 transition-all active:scale-90"
            aria-label="Decrease"
          >
            <Minus className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleIncrement}
            className="w-12 h-12 flex items-center justify-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 dark:border-t-white/20 backdrop-blur-md rounded-2xl text-slate-400 hover:text-indigo-500 hover:border-indigo-200 dark:hover:bg-white/10 hover:shadow-md dark:shadow-lg dark:shadow-black/20 transition-all active:scale-90"
            aria-label="Increase"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
