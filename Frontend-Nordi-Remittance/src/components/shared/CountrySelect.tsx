import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, Globe, Check } from "lucide-react";
import { cn } from "@utils/cn";
import Countries from "@core/data/Countries";

interface CountrySelectProps {
  value?: string;
  onChange?: (code: string) => void;
  className?: string;
  compact?: boolean;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value = "US",
  onChange,
  className,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCountry = Countries.find((c) => c.code === value) || Countries[0];

  const filteredCountries = Countries.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    if (onChange) onChange(code);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={cn("relative inline-block text-left z-50", className)} ref={containerRef}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1 sm:gap-1.5 rounded-md sm:rounded-lg border border-neutral-200 bg-white px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs sm:text-sm font-medium text-neutral-800 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700/80 outline-none focus:ring-2 focus:ring-primary-500/50",
          compact ? "py-1 px-1.5 sm:py-1.5 sm:px-2" : "py-1.5 px-2 sm:py-2 sm:px-3"
        )}
      >
        <span className="text-base">{selectedCountry.flag}</span>
        {!compact && <span className="hidden sm:inline truncate max-w-[100px]">{selectedCountry.name}</span>}
        <span className={cn("font-semibold text-neutral-600 dark:text-neutral-400", compact ? "inline" : "sm:hidden")}>
          {selectedCountry.code}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-neutral-500 transition-transform duration-200 dark:text-neutral-400",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* DROPDOWN MENU */}
      <AnimatePresence>
        {isOpen && (
            <motion.div
              key="backdrop-cs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[105] bg-black/20 backdrop-blur-[2px] sm:hidden"
            />
        )}
        {isOpen && (
          <motion.div
            key="panel-cs"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[320px] origin-center z-[110]",
              "sm:absolute sm:left-auto sm:top-auto sm:-translate-x-0 sm:-translate-y-0 sm:right-0 sm:mt-2 sm:w-64 sm:origin-top-right",
              "rounded-xl border border-neutral-100 bg-white p-2 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)] focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-neutral-900/80"
            )}
          >
            {/* Search Input */}
            <div className="relative mb-2">
              <Search
                size={14}
                className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-3.5 h-3.5 sm:w-4 sm:h-4"
              />
              <input
                type="text"
                autoFocus
                placeholder="Search specific country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md sm:rounded-lg border-none bg-neutral-100 py-1.5 pl-7 pr-2.5 sm:py-2 sm:pl-9 sm:pr-3 text-xs sm:text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-primary-500/50 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
              />
            </div>

            {/* Country List */}
            <div className="custom-scrollbar max-h-60 overflow-y-auto pr-1">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleSelect(country.code)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md sm:rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-left text-xs sm:text-sm transition-colors",
                      value === country.code
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-medium"
                        : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/80"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                    </div>
                    {value === country.code && (
                      <Check size={16} className="text-primary-600 dark:text-primary-400" />
                    )}
                  </button>
                ))
              ) : (
                <div className="py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  No countries found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
