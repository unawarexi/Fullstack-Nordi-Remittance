import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Settings,
  ChevronDown,
  CreditCard,
  Briefcase,
  PiggyBank,
  Wallet,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@store/auth.store";
import useThemeStore from "@store/theme.store";
import { useWallets, useUnreadNotificationsCount } from "@hooks/queries";
import { useUserProfile } from "@hooks/queries/useUsers";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// HELPERS
// ============================================================================
const walletIconMap: Record<string, React.ReactNode> = {
  savings: <PiggyBank size={16} />,
  checking: <CreditCard size={16} />,
  business: <Briefcase size={16} />,
  investment: <Briefcase size={16} />,
  primary: <Wallet size={16} />,
};

const getWalletIcon = (type?: string) =>
  walletIconMap[type || "primary"] || <Wallet size={16} />;

const formatBalance = (amount: number, currency?: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
  }).format(amount);

const maskNumber = (num?: string) =>
  num ? `****${num.slice(-4)}` : "****0000";

// ============================================================================
// COMPONENT
// ============================================================================
const RightContainerNav: React.FC = () => {
  const navigate = useNavigate();

  // ── Auth ──
  const { user, userName, logout } = useAuth();

  // ── Profile (for profilePicture fallback) ──
  const { data: profileData } = useUserProfile();
  const profile = (profileData ?? {}) as Record<string, any>;
  const avatarUrl = profile.profilePicture || user?.avatar || null;

  // ── Theme ──
  const { mode, isDarkMode, setMode, toggleDarkMode } = useThemeStore();

  // ── Wallets (real data) ──
  const { data: walletsRes } = useWallets();
  const wallets: any[] = Array.isArray(walletsRes)
    ? walletsRes
    : Array.isArray((walletsRes as any)?.data)
      ? (walletsRes as any).data
      : [];

  // ── Notifications (real count) ──
  const { data: countRes } = useUnreadNotificationsCount();
  const unreadCount =
    typeof countRes === "number"
      ? countRes
      : typeof (countRes as any)?.count === "number"
        ? (countRes as any).count
        : 0;

  // ── Local UI state ──
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [greeting, setGreeting] = useState("");

  const accountRef = useRef<HTMLDivElement>(null);
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
      if (accountRef.current && !accountRef.current.contains(e.target as Node))
        setIsAccountOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setIsProfileOpen(false);
      if (themeRef.current && !themeRef.current.contains(e.target as Node))
        setIsThemeOpen(false);
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

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "U";

  return (
    <nav className="w-full bg-white dark:bg-gray-900 border-b border-indigo-100 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
        <div className="flex items-center justify-between h-14">
          {/* ── Left: Logo + Greeting ── */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
              NR
            </div>
            <span className="text-indigo-700 dark:text-indigo-300 font-bold text-base hidden md:block">
              Nordi
            </span>
            <div className="hidden lg:flex items-center text-sm ml-2">
              <span className="text-purple-400 dark:text-purple-500 mr-1">
                {greeting},
              </span>
              <span className="font-medium text-indigo-700 dark:text-indigo-300 truncate max-w-[180px]">
                {userName || "User"}
              </span>
            </div>
          </div>

          {/* ── Center: Search ── */}
          <div className="flex-1 max-w-xs mx-4 hidden sm:block">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 dark:text-purple-500"
              />
              <input
                className="w-full pl-9 pr-3 py-2 text-sm rounded-full border border-indigo-100 dark:border-gray-700 bg-indigo-50/60 dark:bg-gray-800 placeholder-purple-300 dark:placeholder-gray-500 text-indigo-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-400 dark:focus:ring-purple-600 focus:bg-white dark:focus:bg-gray-800 transition"
                placeholder="Search..."
                type="search"
              />
            </div>
          </div>

          {/* ── Right: Controls ── */}
          <div className="flex items-center gap-2">
            {/* Account Selector */}
            <div ref={accountRef} className="relative hidden sm:block">
              <motion.button
                onClick={() => {
                  setIsAccountOpen(!isAccountOpen);
                  setIsProfileOpen(false);
                  setIsThemeOpen(false);
                }}
                className="flex items-center gap-1.5 bg-indigo-50 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-gray-700 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg text-sm border border-indigo-100 dark:border-gray-700 transition"
                whileTap={{ scale: 0.97 }}
              >
                <Wallet size={14} />
                <span className="hidden md:inline">Accounts</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${isAccountOpen ? "rotate-180" : ""}`}
                />
              </motion.button>

              <AnimatePresence>
                {isAccountOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-indigo-100 dark:border-gray-700 z-50 overflow-hidden"
                    variants={dropdown}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="px-4 py-3 border-b border-indigo-50 dark:border-gray-800">
                      <h3 className="text-sm font-semibold text-indigo-900 dark:text-gray-100">
                        Your Wallets
                      </h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {wallets.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-6">
                          No wallets found
                        </p>
                      ) : (
                        wallets.map((w: any, i: number) => (
                          <button
                            key={w._id || w.id || i}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-50 dark:hover:bg-gray-800 transition text-left"
                            onClick={() => {
                              setIsAccountOpen(false);
                              navigate("/customer/accounts");
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-purple-500 dark:text-purple-400">
                                {getWalletIcon(w.type)}
                              </span>
                              <div>
                                <div className="text-sm font-medium text-indigo-900 dark:text-gray-100">
                                  {w.type
                                    ? `${w.type.charAt(0).toUpperCase()}${w.type.slice(1)} Wallet`
                                    : "Wallet"}
                                </div>
                                <div className="text-xs text-purple-400 dark:text-purple-500">
                                  {maskNumber(w.walletNumber || w.accountNumber)}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                              {formatBalance(
                                w.balance ?? w.availableBalance ?? 0,
                                w.currency
                              )}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                    <div className="border-t border-indigo-50 dark:border-gray-800 px-4 py-2.5">
                      <button
                        onClick={() => {
                          setIsAccountOpen(false);
                          navigate("/customer/accounts");
                        }}
                        className="text-xs flex items-center justify-center w-full text-purple-600 dark:text-purple-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                      >
                        View All Accounts{" "}
                        <ChevronRight size={13} className="ml-1" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <div ref={themeRef} className="relative">
              <motion.button
                className="p-2 rounded-full bg-indigo-50 dark:bg-gray-800 text-purple-500 dark:text-purple-400 hover:bg-indigo-100 dark:hover:bg-gray-700 transition"
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setIsThemeOpen(!isThemeOpen);
                  setIsAccountOpen(false);
                  setIsProfileOpen(false);
                }}
                title={`Theme: ${mode}`}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>

              <AnimatePresence>
                {isThemeOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-indigo-100 dark:border-gray-700 z-50 overflow-hidden"
                    variants={dropdown}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {(
                      [
                        { key: "light" as const, icon: <Sun size={15} />, label: "Light" },
                        { key: "dark" as const, icon: <Moon size={15} />, label: "Dark" },
                        { key: "system" as const, icon: <Monitor size={15} />, label: "System" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setMode(opt.key);
                          setIsThemeOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition ${
                          mode === opt.key
                            ? "bg-indigo-50 dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 font-medium"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
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
              className="relative p-2 rounded-full bg-indigo-50 dark:bg-gray-800 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-gray-700 transition"
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/customer/notifications")}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-purple-600 text-white text-[10px] min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </motion.button>

            {/* Settings */}
            <motion.button
              className="p-2 rounded-full bg-purple-50 dark:bg-gray-800 text-purple-500 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-gray-700 transition hidden md:flex"
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/customer/settings")}
            >
              <Settings size={18} />
            </motion.button>

            {/* Profile Avatar + Dropdown */}
            <div ref={profileRef} className="relative ml-1">
              <motion.button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsAccountOpen(false);
                  setIsThemeOpen(false);
                }}
                className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-200 via-purple-200 to-pink-100 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-800 overflow-hidden border-2 border-indigo-200 dark:border-gray-700 flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-200">
                    {initials}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-indigo-100 dark:border-gray-700 z-50 overflow-hidden"
                    variants={dropdown}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-indigo-50 dark:border-gray-800">
                      <p className="text-sm font-semibold text-indigo-900 dark:text-gray-100 truncate">
                        {userName || "User"}
                      </p>
                      <p className="text-xs text-purple-400 dark:text-purple-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/customer/profile");
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800 transition"
                    >
                      <User size={15} /> My Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/customer/settings");
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800 transition"
                    >
                      <Settings size={15} /> Settings
                    </button>

                    {/* Dark mode quick toggle */}
                    <button
                      onClick={toggleDarkMode}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800 transition"
                    >
                      {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
                      {isDarkMode ? "Light Mode" : "Dark Mode"}
                    </button>

                    {/* Logout */}
                    <div className="border-t border-indigo-50 dark:border-gray-800">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                          navigate("/login");
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-gray-800 transition"
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