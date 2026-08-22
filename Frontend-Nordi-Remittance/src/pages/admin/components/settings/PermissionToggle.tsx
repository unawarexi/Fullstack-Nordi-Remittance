import React from "react";
import { motion } from "framer-motion";

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export function ToggleSwitch({ enabled, onChange, disabled }: ToggleSwitchProps) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${enabled ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"}`}
    >
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm"
      />
    </motion.button>
  );
}

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex flex-col justify-between gap-3 border-b border-gray-100 py-4 last:border-0 dark:border-gray-800 sm:flex-row sm:items-center">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {description && <p className="mt-1 text-[11px] leading-snug text-gray-500">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}
