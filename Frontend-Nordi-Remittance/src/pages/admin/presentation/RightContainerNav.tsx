import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Settings, Sun, Moon, Monitor, LogOut, User, Shield } from "lucide-react";
import { useAuth } from "@store/auth.store";
import useThemeStore from "@store/theme.store";
import { useUnreadNotificationsCount } from "@hooks/api-queries";

const RightContainerNav: React.FC = () => {
  const navigate = useNavigate();

  // ── Auth ──
  const { user, userName, logout } = useAuth();

  // ── Theme ──
  const { mode, isDarkMode, setMode, toggleDarkMode } = useThemeStore();

  // ── Notifications (real count) ──
  const { data: countRes } = useUnreadNotificationsCount();
  const unreadCount =
    typeof countRes === "number"
      ? countRes
      : typeof (countRes as Record<string, unknown>)?.count === "number"
        ? (countRes as Record<string, number>).count
        : 0;

  // ── Local UI state ──
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [greeting, setGreeting] = useState("");

  const profileRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Greeting based on time-of-day
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening");
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setIsThemeOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Animation variants
  const dropdown = {
    hidden: { opacity: 0, y: -5, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.15, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -5, scale: 0.97, transition: { duration: 0.1 } },
  };

  const initials = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() : "A";

  return (
    <nav className="w-full border-b border-blue-100 bg-white transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-1.5 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* ── Left: Logo + Greeting ── */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 text-sm font-bold text-white">
              NA
            </div>
            <span className="hidden text-base font-bold text-blue-700 dark:text-blue-300 md:block">Nordi Admin</span>
            <div className="ml-2 hidden items-center text-sm lg:flex">
              <span className="mr-1 text-blue-400 dark:text-blue-500">{greeting},</span>
              <span className="max-w-[180px] truncate font-medium text-blue-700 dark:text-blue-300">
                {userName || "Admin"}
              </span>
            </div>
          </div>

          {/* ── Center: Search ── */}
          <div className="mx-4 hidden max-w-xs flex-1 sm:block">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-500" />
              <input
                className="w-full rounded-full border border-blue-100 bg-blue-50/60 py-2 pl-9 pr-3 text-sm text-blue-900 placeholder-blue-300 transition focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:bg-gray-800 dark:focus:ring-blue-600"
                placeholder="Search users, transactions..."
                type="search"
              />
            </div>
          </div>

          {/* ── Right: Controls ── */}
          <div className="flex items-center gap-2">
            {/* Admin Badge */}
            <div className="hidden items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-300 sm:flex">
              <Shield size={14} />
              <span className="hidden font-medium md:inline">Admin Panel</span>
            </div>

            {/* Theme Toggle */}
            <div ref={themeRef} className="relative">
              <motion.button
                className="rounded-full bg-blue-50 p-2 text-blue-500 transition hover:bg-blue-100 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700"
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setIsThemeOpen(!isThemeOpen);
                  setIsProfileOpen(false);
                }}
                title={`Theme: ${mode}`}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>

              <AnimatePresence>
                {isThemeOpen && (
                  <motion.div
                    className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-blue-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
                    variants={dropdown}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {[
                      { key: "light" as const, icon: <Sun size={15} />, label: "Light" },
                      { key: "dark" as const, icon: <Moon size={15} />, label: "Dark" },
                      { key: "system" as const, icon: <Monitor size={15} />, label: "System" },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setMode(opt.key);
                          setIsThemeOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition ${
                          mode === opt.key
                            ? "bg-blue-50 font-medium text-blue-700 dark:bg-gray-800 dark:text-blue-300"
                            : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                        }`}
                      >
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <motion.button
              className="relative rounded-full bg-blue-50 p-2 text-blue-500 transition hover:bg-blue-100 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700"
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/admin/communications")}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </motion.button>

            {/* Settings */}
            <motion.button
              className="hidden rounded-full bg-blue-50 p-2 text-blue-500 transition hover:bg-blue-100 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700 md:flex"
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/admin/settings")}
            >
              <Settings size={18} />
            </motion.button>

            {/* Profile Avatar + Dropdown */}
            <div ref={profileRef} className="relative ml-1">
              <motion.button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsThemeOpen(false);
                }}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-blue-200 bg-gradient-to-tr from-blue-200 via-blue-300 to-cyan-100 dark:border-gray-700 dark:from-blue-700 dark:via-blue-800 dark:to-cyan-900"
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xs font-bold text-blue-700 dark:text-blue-200">{initials}</span>
              </motion.button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-blue-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
                    variants={dropdown}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {/* User info header */}
                    <div className="border-b border-blue-50 px-4 py-3 dark:border-gray-800">
                      <p className="truncate text-sm font-semibold text-blue-900 dark:text-gray-100">
                        {userName || "Admin"}
                      </p>
                      <p className="truncate text-xs text-blue-400 dark:text-blue-500">{user?.email}</p>
                    </div>

                    {/* Menu items */}
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/admin/management/users");
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <User size={15} /> My Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/admin/settings");
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <Settings size={15} /> Settings
                    </button>

                    {/* Dark mode quick toggle */}
                    <button
                      onClick={toggleDarkMode}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
                      {isDarkMode ? "Light Mode" : "Dark Mode"}
                    </button>

                    {/* Logout */}
                    <div className="border-t border-blue-50 dark:border-gray-800">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                          navigate("/admin");
                        }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-gray-800"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default RightContainerNav;
