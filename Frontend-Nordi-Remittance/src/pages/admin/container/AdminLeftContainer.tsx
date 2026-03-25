import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useLogout } from "@hooks/queries/useAuth";
import { useAuth } from "@store/auth.store";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BadgeCheck,
  Briefcase,
  TrendingUp,
  BarChart2,
  ShieldAlert,
  FileText,
  Mail,
  Settings,
  UserCog,
  LogOut,
  ChevronDown,
  Landmark,
  Lock,
  Globe,
  Bell,
  AlertTriangle,
  Activity,
  Shield,
  User,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// MENU STRUCTURE
// ============================================================================
const menu = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    route: "/admin/dashboard",
  },
  {
    title: "Users Management",
    icon: <Users size={20} />,
    route: "/admin/users",
    children: [
      { title: "All Users", route: "/admin/users/all" },
      { title: "KYC Pending", route: "/admin/users/kyc-pending" },
      { title: "Blocked Users", route: "/admin/users/blocked" },
      { title: "Admin Team", route: "/admin/users/vip" },
    ],
  },
  {
    title: "Transactions",
    icon: <CreditCard size={20} />,
    route: "/admin/transactions",
    children: [
      { title: "All Transactions", route: "/admin/transactions/all" },
      { title: "Pending", route: "/admin/transactions/pending" },
      { title: "Failed", route: "/admin/transactions/failed" },
      { title: "International", route: "/admin/transactions/international" },
      { title: "Suspicious", route: "/admin/transactions/suspicious" },
    ],
  },
  {
    title: "KYC / Identity",
    icon: <BadgeCheck size={20} />,
    route: "/admin/kyc",
    children: [
      { title: "Pending KYC", route: "/admin/kyc/pending" },
      { title: "Verified", route: "/admin/kyc/verified" },
      { title: "Rejected", route: "/admin/kyc/rejected" },
      { title: "Enhanced Due Diligence", route: "/admin/kyc/enhanced" },
    ],
  },
  {
    title: "Loan Management",
    icon: <Briefcase size={20} />,
    route: "/admin/loans",
    children: [
      { title: "All Loans", route: "/admin/loans/all" },
      { title: "Pending", route: "/admin/loans/pending" },
      { title: "Approved", route: "/admin/loans/approved" },
      { title: "Rejected", route: "/admin/loans/rejected" },
      { title: "Delinquent", route: "/admin/loans/delinquent" },
    ],
  },
  {
    title: "Investment Products",
    icon: <TrendingUp size={20} />,
    route: "/admin/investments",
    children: [
      { title: "All Products", route: "/admin/investments/all" },
      { title: "Fixed Deposits", route: "/admin/investments/fixed-deposits" },
      { title: "Mutual Funds", route: "/admin/investments/mutual-funds" },
      { title: "Bonds", route: "/admin/investments/bonds" },
      { title: "Equity Products", route: "/admin/investments/equity" },
    ],
  },
  {
    title: "Bank Accounts",
    icon: <Landmark size={20} />,
    route: "/admin/accounts",
    children: [
      { title: "Savings Accounts", route: "/admin/accounts/savings" },
      { title: "Current Accounts", route: "/admin/accounts/current" },
      { title: "Fixed Deposits", route: "/admin/accounts/fixed-deposits" },
      { title: "Dormant Accounts", route: "/admin/accounts/dormant" },
    ],
  },
  {
    title: "Foreign Exchange",
    icon: <Globe size={20} />,
    route: "/admin/forex",
    children: [
      { title: "Exchange Rates", route: "/admin/forex/rates" },
      { title: "FX Transactions", route: "/admin/forex/transactions" },
      { title: "Remittances", route: "/admin/forex/remittances" },
    ],
  },
  {
    title: "Reports & Analytics",
    icon: <BarChart2 size={20} />,
    route: "/admin/reports",
    children: [
      { title: "Financial Reports", route: "/admin/reports/financial" },
      { title: "User Analytics", route: "/admin/reports/users" },
      { title: "Transaction Analytics", route: "/admin/reports/transactions" },
      { title: "Risk Reports", route: "/admin/reports/risk" },
      { title: "Regulatory Reports", route: "/admin/reports/regulatory" },
    ],
  },
  {
    title: "Fraud Monitoring",
    icon: <ShieldAlert size={20} />,
    route: "/admin/fraud",
    children: [
      { title: "Alerts", route: "/admin/fraud/alerts" },
      { title: "Investigation Cases", route: "/admin/fraud/cases" },
      { title: "AML Monitoring", route: "/admin/fraud/aml" },
    ],
  },
  {
    title: "Audit Logs",
    icon: <FileText size={20} />,
    route: "/admin/logs",
  },
  {
    title: "Communications",
    icon: <Mail size={20} />,
    route: "/admin/communications",
    children: [
      { title: "Email Templates", route: "/admin/communications/email-templates" },
      { title: "SMS Templates", route: "/admin/communications/sms-templates" },
      { title: "Push Notifications", route: "/admin/communications/push" },
      { title: "Campaign Manager", route: "/admin/communications/campaigns" },
    ],
  },
  {
    title: "System Settings",
    icon: <Settings size={20} />,
    route: "/admin/settings",
    children: [
      { title: "General", route: "/admin/settings/general" },
      { title: "Security", route: "/admin/settings/security" },
      { title: "Notifications", route: "/admin/settings/notifications" },
      { title: "API Integration", route: "/admin/settings/api" },
      { title: "Payment Gateways", route: "/admin/settings/payment-gateways" },
    ],
  },
  {
    title: "Admin Management",
    icon: <UserCog size={20} />,
    route: "/admin/management",
    children: [
      { title: "Admin Users", route: "/admin/management/users" },
      { title: "Roles & Permissions", route: "/admin/management/roles" },
      { title: "Activity Logs", route: "/admin/management/activity" },
    ],
  },
  {
    title: "Logout",
    icon: <LogOut size={20} />,
    route: "/admin/logout",
  },
];

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================
const sidebarVariants = {
  expanded: { width: "280px", transition: { duration: 0.3, ease: "easeInOut" } },
  collapsed: { width: "80px", transition: { duration: 0.3, ease: "easeInOut" } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
};

const dropdownVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

// ============================================================================
// COMPONENT
// ============================================================================
const AdminLeftContainer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout: clearAuthState, user, userName } = useAuth();
  const logoutMutation = useLogout();
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  const displayName = userName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Admin";
  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "A";
  const roleBadge = user?.role === "admin" ? "System Administrator" : "Admin";

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        clearAuthState();
        navigate("/admin", { replace: true });
      },
    });
  };

  // Auto-expand dropdown for active route
  useEffect(() => {
    const parent = menu.find(
      (item) => item.children?.some((child) => location.pathname === child.route)
    );
    if (parent) setOpenDropdowns([parent.route]);
  }, [location.pathname]);

  const toggleSidebar = () => setCollapsed(!collapsed);

  const handleDropdown = (route: string) => {
    setOpenDropdowns((prev) =>
      prev.includes(route) ? prev.filter((r) => r !== route) : [...prev, route]
    );
  };

  const isActive = (route: string) =>
    location.pathname === route || (route !== "/" && location.pathname.startsWith(route));

  const handleNavigation = (route: string) => {
    navigate(route);
    if (collapsed) setCollapsed(false);
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="expanded"
      animate={collapsed ? "collapsed" : "expanded"}
      className="h-screen bg-gradient-to-b from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-900 shadow-lg dark:shadow-gray-950/50 flex flex-col py-6 relative transition-colors duration-200"
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-1 rounded-full shadow-lg z-10"
      >
        <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown size={16} />
        </motion.div>
      </button>

      {/* Logo + Admin Profile */}
      <motion.div
        className="font-bold text-xl mb-6 px-4 flex items-center"
        animate={{ justifyContent: collapsed ? "center" : "flex-start" }}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
          {initials}
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ml-3">
            <div className="font-semibold text-blue-900 dark:text-blue-200 text-sm truncate max-w-[180px]">
              {displayName}
            </div>
            <div className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">{roleBadge}</div>
          </motion.div>
        )}
      </motion.div>

      {/* Quick Actions */}
      {!collapsed && (
        <motion.div className="px-4 mb-6" variants={itemVariants} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">Quick Actions</span>
              <Activity size={14} className="text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: <Users size={16} />, label: "Users", route: "/admin/users/all", c: "bg-blue-50 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400" },
                { icon: <ShieldAlert size={16} />, label: "Fraud", route: "/admin/fraud", c: "bg-red-50 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-gray-600 text-red-600 dark:text-red-400" },
                { icon: <BarChart2 size={16} />, label: "Reports", route: "/admin/reports", c: "bg-emerald-50 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-gray-600 text-emerald-600 dark:text-emerald-400" },
                { icon: <Settings size={16} />, label: "Settings", route: "/admin/settings", c: "bg-amber-50 dark:bg-gray-700 hover:bg-amber-100 dark:hover:bg-gray-600 text-amber-600 dark:text-amber-400" },
              ].map(({ icon, label, route, c }) => (
                <motion.div
                  key={label}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer ${c}`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(route)}
                >
                  <div className="mb-1">{icon}</div>
                  <span className="text-xs">{label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Status Indicators */}
      {!collapsed && (
        <motion.div className="px-4 mb-6 flex flex-col gap-2" variants={itemVariants} initial="hidden" animate="visible">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 flex items-center justify-between shadow-sm hover:shadow cursor-pointer"
            whileHover={{ x: 3 }}
          >
            <div className="flex items-center gap-2">
              <div className="bg-green-500 rounded-full h-2 w-2" />
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">System Online</span>
            </div>
            <Shield size={14} className="text-green-500" />
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 flex items-center justify-between shadow-sm hover:shadow cursor-pointer"
            whileHover={{ x: 3 }}
            onClick={() => navigate("/admin/fraud/alerts")}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500 dark:text-amber-400" />
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">Security Alerts</span>
            </div>
            <Bell size={14} className="text-amber-500 dark:text-amber-400" />
          </motion.div>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 custom-scrollbar">
        <AnimatePresence>
          <ul className="list-none p-0 m-0 space-y-1">
            {menu.map((item) => {
              const active = isActive(item.route);
              const hasChildren = !!item.children;
              const open = openDropdowns.includes(item.route);

              return (
                <motion.li key={item.title} variants={itemVariants} initial="hidden" animate="visible" exit="hidden">
                  <motion.div
                    onClick={() => {
                      if (item.title === "Logout") {
                        handleLogout();
                        return;
                      }
                      if (hasChildren) {
                        if (!collapsed) handleDropdown(item.route);
                        else handleNavigation(item.route);
                      } else {
                        handleNavigation(item.route);
                      }
                    }}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition
                      ${item.title === "Logout"
                        ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium"
                        : active
                          ? "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-800 dark:text-blue-200 font-semibold"
                          : "text-gray-700 dark:text-gray-300 font-medium hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-300"
                      }
                    `}
                    whileHover={{ x: collapsed ? 0 : 3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className={
                        item.title === "Logout"
                          ? "text-rose-500 dark:text-rose-400"
                          : active
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-indigo-500 dark:text-indigo-400"
                      }
                      animate={{ scale: active ? 1.1 : 1 }}
                    >
                      {item.icon}
                    </motion.div>

                    {!collapsed && <motion.span className="flex-1">{item.title}</motion.span>}

                    {hasChildren && !collapsed && (
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} className="text-blue-400" />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Dropdown */}
                  {hasChildren && !collapsed && (
                    <AnimatePresence>
                      {open && (
                        <motion.ul
                          className="list-none pl-8 mt-1 mb-1 overflow-hidden"
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          {item.children!.map((child) => {
                            const childActive = isActive(child.route);
                            return (
                              <motion.li key={child.title} variants={itemVariants} className="mb-1">
                                <motion.div
                                  onClick={() => navigate(child.route)}
                                  className={`
                                    px-3 py-2 rounded-lg cursor-pointer text-sm transition
                                    ${childActive
                                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold"
                                      : "text-gray-700 dark:text-gray-400 font-normal hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-300"
                                    }
                                  `}
                                  whileHover={{ x: 3 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  {child.title}
                                  {childActive && (
                                    <motion.div
                                      className="w-1 h-full absolute right-0 top-0 bg-blue-600 rounded-l"
                                      layoutId="activeIndicator"
                                    />
                                  )}
                                </motion.div>
                              </motion.li>
                            );
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </AnimatePresence>
      </nav>

      {/* Admin Info */}
      {!collapsed && (
        <motion.div
          className="mt-auto border-t border-blue-100 dark:border-gray-700 pt-4 px-4"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-xl p-3 flex items-center gap-3 cursor-pointer"
            whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(59, 130, 246, 0.1)" }}
            onClick={() => navigate("/admin/profile")}
          >
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <User size={16} />
            </div>
            <div>
              <div className="text-xs font-medium text-blue-900 dark:text-blue-200">Admin Profile</div>
              <div className="text-xs text-blue-700 dark:text-blue-400">View & manage</div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Footer */}
      <motion.div
        className="mt-4 py-3 px-4 text-xs text-center"
        animate={{ justifyContent: collapsed ? "center" : "space-between", opacity: 1 }}
      >
        {!collapsed ? (
          <div className="text-blue-400 dark:text-blue-500">
            &copy; {new Date().getFullYear()} Nordi Admin
          </div>
        ) : (
          <Lock size={16} className="text-blue-400 mx-auto" />
        )}
      </motion.div>
    </motion.aside>
  );
};

export default AdminLeftContainer;