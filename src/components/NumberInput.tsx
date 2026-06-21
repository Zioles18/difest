import React, { useRef, useState, useEffect } from "react";
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

/** Format a number to compact notation (1000 → 1k, 1500000 → 1.5M) */
function compactFormat(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";
  }
  if (Math.abs(n) >= 1_000) {
    return (n / 1_000).toFixed(2).replace(/\.?0+$/, "") + "k";
  }
  return String(n);
}

/** Parse a compact string (e.g. "1.5k", "2M", "500") to a number */
function compactParse(text: string): number {
  const s = text.trim().toLowerCase();
  if (s.endsWith("k")) return (parseFloat(s) || 0) * 1_000;
  if (s.endsWith("m")) return (parseFloat(s) || 0) * 1_000_000;
  return parseFloat(s.replace(/[^0-9.-]/g, "")) || 0;
}

export const NumberInput: React.FC<NumberInputProps> = ({
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
  showMultiplier = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [multiplier, setMultiplier] = useState<1 | 10 | 100>(1);
  const [isPressing, setIsPressing] = useState<'plus' | 'minus' | null>(null);
  const pressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  // Initialize value
  const [rawValue, setRawValue] = useState<number>(() => {
    if (value !== undefined) return compactParse(String(value));
    if (defaultValue !== undefined) return compactParse(String(defaultValue));
    return 0;
  });

  // Sync externally controlled value
  useEffect(() => {
    if (value !== undefined && inputRef.current) {
      const num = compactParse(String(value));
      setRawValue(num);
    }
  }, [value]);

  // Handle press and hold
  useEffect(() => {
    if (isPressing) {
      // Initial delay, then faster interval
      const startPress = () => {
        if (isPressing === 'plus') handleIncrement();
        else if (isPressing === 'minus') handleDecrement();
      };
      
      startPress();
      pressIntervalRef.current = setInterval(startPress, 100);
      
      return () => {
        if (pressIntervalRef.current) {
          clearInterval(pressIntervalRef.current);
          pressIntervalRef.current = null;
        }
      };
    }
  }, [isPressing, rawValue]);

  const applyValue = (num: number) => {
    setRawValue(num);
    if (onChange) onChange(String(num));
  };

  const handleIncrement = () => {
    const next = rawValue + step * multiplier;
    if (max !== undefined && next > max) return;
    applyValue(next);
  };

  const handleDecrement = () => {
    const next = rawValue - step * multiplier;
    if (min !== undefined && next < min) return;
    applyValue(next);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (inputRef.current) {
      // Show raw number for editing
      inputRef.current.value = rawValue !== 0 ? String(rawValue) : "";
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (inputRef.current) {
      const num = compactParse(inputRef.current.value);
      applyValue(num);
      inputRef.current.value = num ? compactFormat(num) : "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update rawValue as user types for better UX
    const num = compactParse(e.target.value);
    setRawValue(num);
    if (onChange) onChange(String(num));
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
              {([1, 10, 100] as const).map((m) => (
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
          type="text"
          inputMode="decimal"
          // Show raw number when focused, compact when not
          value={isFocused 
            ? (rawValue !== 0 ? String(rawValue) : "") 
            : (rawValue !== 0 ? compactFormat(rawValue) : "")}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl h-[68px] pr-36 text-base font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 ${
            Icon ? "pl-14" : "pl-8"
          }`}
        />
        {/* Hidden input for form submission with raw value */}
        <input
          type="hidden"
          name={name}
          value={rawValue}
        />
        <div className="absolute right-2.5 flex items-center gap-2">
          <button
            type="button"
            onMouseDown={() => setIsPressing('minus')}
            onMouseUp={() => setIsPressing(null)}
            onMouseLeave={() => setIsPressing(null)}
            onTouchStart={() => setIsPressing('minus')}
            onTouchEnd={() => setIsPressing(null)}
            onClick={handleDecrement}
            className="w-12 h-12 flex items-center justify-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 dark:border-t-white/20 backdrop-blur-md rounded-2xl text-slate-400 hover:text-indigo-500 hover:border-indigo-200 dark:hover:bg-white/10 hover:shadow-md dark:shadow-lg dark:shadow-black/20 transition-all active:scale-90"
            aria-label="Decrease"
          >
            <Minus className="w-5 h-5" />
          </button>
          <button
            type="button"
            onMouseDown={() => setIsPressing('plus')}
            onMouseUp={() => setIsPressing(null)}
            onMouseLeave={() => setIsPressing(null)}
            onTouchStart={() => setIsPressing('plus')}
            onTouchEnd={() => setIsPressing(null)}
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
};
