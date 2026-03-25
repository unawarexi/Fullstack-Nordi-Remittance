import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Settings,
  Sun,
  Moon,
  Monitor,
  LogOut,
  User,
  Shield,
} from 'lucide-react';
import { useAuth } from '@store/auth.store';
import useThemeStore from '@store/theme.store';
import { useUnreadNotificationsCount } from '@hooks/queries';

const RightContainerNav: React.FC = () => {
  const navigate = useNavigate();

  // ── Auth ──
  const { user, userName, logout } = useAuth();

  // ── Theme ──
  const { mode, isDarkMode, setMode, toggleDarkMode } = useThemeStore();

  // ── Notifications (real count) ──
  const { data: countRes } = useUnreadNotificationsCount();
  const unreadCount =
    typeof countRes === 'number'
      ? countRes
      : typeof (countRes as Record<string, unknown>)?.count === 'number'
        ? (countRes as Record<string, number>).count
        : 0;

  // ── Local UI state ──
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [greeting, setGreeting] = useState('');

  const profileRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Greeting based on time-of-day
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening');
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setIsProfileOpen(false);
      if (themeRef.current && !themeRef.current.contains(e.target as Node))
        setIsThemeOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Animation variants
  const dropdown = {
    hidden: { opacity: 0, y: -5, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.15, ease: 'easeOut' },
    },
    exit: { opacity: 0, y: -5, scale: 0.97, transition: { duration: 0.1 } },
  };

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'A';

  return (
    <nav className="w-full bg-white dark:bg-gray-900 border-b border-blue-100 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
        <div className="flex items-center justify-between h-14">
          {/* ── Left: Logo + Greeting ── */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
              NA
            </div>
            <span className="text-blue-700 dark:text-blue-300 font-bold text-base hidden md:block">
              Nordi Admin
            </span>
            <div className="hidden lg:flex items-center text-sm ml-2">
              <span className="text-blue-400 dark:text-blue-500 mr-1">
                {greeting},
              </span>
              <span className="font-medium text-blue-700 dark:text-blue-300 truncate max-w-[180px]">
                {userName || 'Admin'}
              </span>
            </div>
          </div>

          {/* ── Center: Search ── */}
          <div className="flex-1 max-w-xs mx-4 hidden sm:block">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-500"
              />
              <input
                className="w-full pl-9 pr-3 py-2 text-sm rounded-full border border-blue-100 dark:border-gray-700 bg-blue-50/60 dark:bg-gray-800 placeholder-blue-300 dark:placeholder-gray-500 text-blue-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:focus:ring-blue-600 focus:bg-white dark:focus:bg-gray-800 transition"
                placeholder="Search users, transactions..."
                type="search"
              />
            </div>
          </div>

          {/* ── Right: Controls ── */}
          <div className="flex items-center gap-2">
            {/* Admin Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-blue-50 dark:bg-gray-800 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg text-sm border border-blue-100 dark:border-gray-700">
              <Shield size={14} />
              <span className="hidden md:inline font-medium">Admin Panel</span>
            </div>

            {/* Theme Toggle */}
            <div ref={themeRef} className="relative">
              <motion.button
                className="p-2 rounded-full bg-blue-50 dark:bg-gray-800 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition"
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
                    className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-blue-100 dark:border-gray-700 z-50 overflow-hidden"
                    variants={dropdown}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {([
                      { key: 'light' as const, icon: <Sun size={15} />, label: 'Light' },
                      { key: 'dark' as const, icon: <Moon size={15} />, label: 'Dark' },
                      { key: 'system' as const, icon: <Monitor size={15} />, label: 'System' },
                    ]).map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setMode(opt.key);
                          setIsThemeOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition ${
                          mode === opt.key
                            ? 'bg-blue-50 dark:bg-gray-800 text-blue-700 dark:text-blue-300 font-medium'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
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
              className="relative p-2 rounded-full bg-blue-50 dark:bg-gray-800 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition"
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/admin/communications')}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </motion.button>

            {/* Settings */}
            <motion.button
              className="p-2 rounded-full bg-blue-50 dark:bg-gray-800 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition hidden md:flex"
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/admin/settings')}
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
                className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-200 via-blue-300 to-cyan-100 dark:from-blue-700 dark:via-blue-800 dark:to-cyan-900 overflow-hidden border-2 border-blue-200 dark:border-gray-700 flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xs font-bold text-blue-700 dark:text-blue-200">
                  {initials}
                </span>
              </motion.button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-blue-100 dark:border-gray-700 z-50 overflow-hidden"
                    variants={dropdown}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-blue-50 dark:border-gray-800">
                      <p className="text-sm font-semibold text-blue-900 dark:text-gray-100 truncate">
                        {userName || 'Admin'}
                      </p>
                      <p className="text-xs text-blue-400 dark:text-blue-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/admin/management/users');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 transition"
                    >
                      <User size={15} /> My Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/admin/settings');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 transition"
                    >
                      <Settings size={15} /> Settings
                    </button>

                    {/* Dark mode quick toggle */}
                    <button
                      onClick={toggleDarkMode}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 transition"
                    >
                      {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
                      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>

                    {/* Logout */}
                    <div className="border-t border-blue-50 dark:border-gray-800">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                          navigate('/admin');
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