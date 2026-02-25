/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useLogout } from "@hooks/queries/useAuth";
import { useAuth } from "@store/auth.store";
import {
  LayoutDashboard,
  Wallet,
  Repeat,
  Users,
  Send,
  CreditCard,
  Briefcase,
  LineChart,
  PiggyBank,
  Receipt,
  HelpCircle,
  Shield,
  LogOut,
  ChevronDown,
  Bell,
  Gift,
  Globe,
  Zap,
  Calendar,
  Clock,
  FileText,
  BanknoteIcon,
  QrCode,
  Smartphone,
  Settings,
  MessageSquare,
  Heart,
  AlertTriangle,
} from "lucide-react";

// Expanded menu structure with more banking options
const menuItems = [
  { 
    title: "Dashboard", 
    icon: <LayoutDashboard size={20} />, 
    route: "/customer/dashboard" 
  },
  { 
    title: "My Accounts", 
    icon: <Wallet size={20} />, 
    route: "/customer/accounts",
    children: [
      { title: "Savings Account", route: "/customer/accounts/savings" },
      { title: "Current Account", route: "/customer/accounts/current" },
      { title: "Fixed Deposits", route: "/customer/accounts/fixed-deposits" },
      { title: "Account Statements", route: "/customer/accounts/statements" },
    ]
  },
  { 
    title: "Transactions", 
    icon: <Repeat size={20} />, 
    route: "/customer/transactions",
    children: [
      { title: "Recent Activity", route: "/customer/transactions/recent" },
      { title: "Scheduled Transfers", route: "/customer/transactions/scheduled" },
      { title: "Transaction History", route: "/customer/transactions/history" },
      { title: "Download Statement", route: "/customer/transactions/download" },
    ]
  },
  { 
    title: "Send Money", 
    icon: <Send size={20} />, 
    route: "/customer/send",
    children: [
      { title: "Domestic Transfer", route: "/customer/send/domestic" },
      { title: "International Wire", route: "/customer/send/international" },
      { title: "Quick Transfer", route: "/customer/send/quick" },
      { title: "Instant Payment", route: "/customer/send/instant" },
    ]
  },
  { 
    title: "Beneficiaries", 
    icon: <Users size={20} />, 
    route: "/customer/beneficiaries",
    children: [
      { title: "All Beneficiaries", route: "/customer/beneficiaries/all" },
      { title: "Add New", route: "/customer/beneficiaries/add" },
      { title: "Manage Categories", route: "/customer/beneficiaries/categories" },
      { title: "Recent Recipients", route: "/customer/beneficiaries/recent" },
    ]
  },
  { 
    title: "Cards", 
    icon: <CreditCard size={20} />, 
    route: "/customer/cards",
    children: [
      { title: "My Cards", route: "/customer/cards/overview" },
      { title: "Card Transactions", route: "/customer/cards/transactions" },
      { title: "Apply for New Card", route: "/customer/cards/apply" },
      { title: "Card Security", route: "/customer/cards/security" },
      { title: "Virtual Cards", route: "/customer/cards/virtual" },
    ]
  },
  { 
    title: "Loans & Credit", 
    icon: <Briefcase size={20} />, 
    route: "/customer/loans",
    children: [
      { title: "My Loans", route: "/customer/loans/overview" },
      { title: "Apply for Loan", route: "/customer/loans/apply" },
      { title: "Loan Calculator", route: "/customer/loans/calculator" },
      { title: "Credit Score", route: "/customer/loans/credit-score" },
    ]
  },
  { 
    title: "Investments", 
    icon: <LineChart size={20} />, 
    route: "/customer/investments",
    children: [
      { title: "Portfolio Overview", route: "/customer/investments/overview" },
      { title: "Mutual Funds", route: "/customer/investments/mutual-funds" },
      { title: "Stocks & ETFs", route: "/customer/investments/stocks" },
      { title: "Fixed Income", route: "/customer/investments/fixed-income" },
      { title: "Market Insights", route: "/customer/investments/insights" },
    ]
  },
  { 
    title: "Savings Goals", 
    icon: <PiggyBank size={20} />, 
    route: "/customer/savings",
    children: [
      { title: "My Goals", route: "/customer/savings/goals" },
      { title: "Create New Goal", route: "/customer/savings/create" },
      { title: "Auto-Save Rules", route: "/customer/savings/auto-save" },
      { title: "Savings Analytics", route: "/customer/savings/analytics" },
    ]
  },
  { 
    title: "Bill Payments", 
    icon: <Receipt size={20} />, 
    route: "/customer/bills",
    children: [
      { title: "Pay Bills", route: "/customer/bills/pay" },
      { title: "Scheduled Payments", route: "/customer/bills/scheduled" },
      { title: "Utilities & Services", route: "/customer/bills/utilities" },
      { title: "Autopay Setup", route: "/customer/bills/autopay" },
    ]
  },
  {
    title: "Foreign Exchange",
    icon: <Globe size={20} />,
    route: "/customer/forex",
    children: [
      { title: "Currency Exchange", route: "/customer/forex/exchange" },
      { title: "Live Rates", route: "/customer/forex/rates" },
      { title: "Currency Alerts", route: "/customer/forex/alerts" },
      { title: "Exchange History", route: "/customer/forex/history" },
    ]
  },
  {
    title: "Mobile Banking",
    icon: <Smartphone size={20} />,
    route: "/customer/mobile",
    children: [
      { title: "Mobile App", route: "/customer/mobile/app" },
      { title: "Device Management", route: "/customer/mobile/devices" },
      { title: "QR Payments", route: "/customer/mobile/qr" },
      { title: "Push Notifications", route: "/customer/mobile/notifications" },
    ]
  },
  {
    title: "Rewards & Offers",
    icon: <Gift size={20} />,
    route: "/customer/rewards",
    children: [
      { title: "My Rewards", route: "/customer/rewards/overview" },
      { title: "Redeem Points", route: "/customer/rewards/redeem" },
      { title: "Special Offers", route: "/customer/rewards/offers" },
      { title: "Partner Discounts", route: "/customer/rewards/partners" },
    ]
  },
  { 
    title: "Support", 
    icon: <HelpCircle size={20} />, 
    route: "/customer/support",
    children: [
      { title: "Contact Us", route: "/customer/support/contact" },
      { title: "Live Chat", route: "/customer/support/chat" },
      { title: "FAQs", route: "/customer/support/faqs" },
      { title: "Schedule Appointment", route: "/customer/support/appointment" },
    ]
  },
  { 
    title: "Security Center", 
    icon: <Shield size={20} />, 
    route: "/customer/security",
    children: [
      { title: "Security Settings", route: "/customer/security/settings" },
      { title: "Two-Factor Auth", route: "/customer/security/2fa" },
      { title: "Biometric Access", route: "/customer/security/biometric" },
      { title: "Activity Logs", route: "/customer/security/logs" },
      { title: "Security Alerts", route: "/customer/security/alerts" },
    ]
  },
  { 
    title: "Profile & Preferences", 
    icon: <Settings size={20} />, 
    route: "/customer/profile",
    children: [
      { title: "Personal Information", route: "/customer/profile/personal" },
      { title: "Communication Preferences", route: "/customer/profile/communication" },
      { title: "Language & Region", route: "/customer/profile/language" },
      { title: "Document Center", route: "/customer/profile/documents" },
    ]
  },
  { 
    title: "Logout", 
    icon: <LogOut size={20} />, 
    route: "/customer/logout" 
  },
];

// Animation variants
const sidebarVariants = {
  expanded: {
    width: "280px",
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  collapsed: {
    width: "80px",
    transition: { duration: 0.3, ease: "easeInOut" }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.2 }
  }
};

const dropdownVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { 
    height: "auto", 
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

const UserLeftContainer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout: clearAuthState } = useAuth();
  const logoutMutation = useLogout();
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [alertCount, setAlertCount] = useState(2);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        clearAuthState();
        navigate("/login", { replace: true });
      },
    });
  };
  
  // Automatically open dropdown for active route on mount
  useEffect(() => {
    const currentParentRoute = menuItems.find(item => 
      item.children && item.children.some(child => location.pathname === child.route)
    );
    
    if (currentParentRoute && currentParentRoute.route) {
      setOpenDropdowns([currentParentRoute.route]);
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleDropdown = (route: string) => {
    setOpenDropdowns((prev) =>
      prev.includes(route)
        ? prev.filter((r) => r !== route)
        : [...prev, route]
    );
  };

  const isActive = (route: string) =>
    location.pathname === route ||
    (route !== '/' && location.pathname.startsWith(route));
    
  const handleNavigation = (route: string) => {
    navigate(route);
    if (collapsed) {
      setCollapsed(false);
    }
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="expanded"
      animate={collapsed ? "collapsed" : "expanded"}
      className="h-screen bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-900 shadow-lg dark:shadow-gray-950/50 flex flex-col py-6 relative transition-colors duration-200"
    >
      {/* Toggle button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-1 rounded-full shadow-lg z-10"
      >
        <motion.div
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      {/* Logo and User Info */}
      <motion.div 
        className="font-bold text-xl mb-6 px-4 flex items-center"
        animate={{ justifyContent: collapsed ? "center" : "flex-start" }}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
          U
        </div>
        
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ml-3"
          >
            <div className="font-semibold text-indigo-900 dark:text-indigo-200">User Name</div>
            <div className="text-xs text-purple-500 dark:text-purple-400 font-medium">Premium Member</div>
          </motion.div>
        )}
      </motion.div>

      {/* Quick Links */}
      {!collapsed && (
        <motion.div 
          className="px-4 mb-6"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">Quick Actions</span>
              <Zap size={14} className="text-purple-500 dark:text-purple-400" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <motion.div 
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-indigo-50 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-gray-600 cursor-pointer"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send size={16} className="text-indigo-600 dark:text-indigo-400 mb-1" />
                <span className="text-xs text-indigo-700 dark:text-indigo-300">Send</span>
              </motion.div>
              <motion.div 
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-purple-50 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-gray-600 cursor-pointer"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <QrCode size={16} className="text-purple-600 dark:text-purple-400 mb-1" />
                <span className="text-xs text-purple-700 dark:text-purple-300">Scan</span>
              </motion.div>
              <motion.div 
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-pink-50 dark:bg-gray-700 hover:bg-pink-100 dark:hover:bg-gray-600 cursor-pointer"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <BanknoteIcon size={16} className="text-pink-600 dark:text-pink-400 mb-1" />
                <span className="text-xs text-pink-700 dark:text-pink-300">Pay</span>
              </motion.div>
              <motion.div 
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600 cursor-pointer"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Globe size={16} className="text-blue-600 dark:text-blue-400 mb-1" />
                <span className="text-xs text-blue-700 dark:text-blue-300">Forex</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications & Alerts */}
      {!collapsed && (
        <motion.div 
          className="px-4 mb-6 flex flex-col gap-2"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 flex items-center justify-between shadow-sm hover:shadow cursor-pointer"
            whileHover={{ x: 3 }}
          >
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-purple-500 dark:text-purple-400" />
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">Notifications</span>
            </div>
            {notificationCount > 0 && (
              <div className="bg-purple-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                {notificationCount}
              </div>
            )}
          </motion.div>
          
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 flex items-center justify-between shadow-sm hover:shadow cursor-pointer"
            whileHover={{ x: 3 }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500 dark:text-amber-400" />
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">Security Alerts</span>
            </div>
            {alertCount > 0 && (
              <div className="bg-amber-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                {alertCount}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

    

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2">
        <AnimatePresence>
          <ul className="list-none p-0 m-0 space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.route);
              const hasChildren = !!item.children;
              const open = openDropdowns.includes(item.route);
              
              return (
                <motion.li 
                  key={item.title}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
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
                        ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium'
                        : active
                          ? 'bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-800 dark:text-indigo-200 font-semibold'
                          : 'text-gray-700 dark:text-gray-300 font-medium hover:bg-indigo-50 dark:hover:bg-gray-800 hover:text-indigo-700 dark:hover:text-indigo-300'}
                    `}
                    whileHover={{ x: collapsed ? 0 : 3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className={item.title === "Logout"
                        ? "text-rose-500 dark:text-rose-400"
                        : active ? "text-indigo-600 dark:text-indigo-400" : "text-purple-500 dark:text-purple-400"}
                      animate={{ 
                        scale: active ? 1.1 : 1 
                      }}
                    >
                      {item.icon}
                    </motion.div>
                    
                    {!collapsed && (
                      <motion.span className="flex-1">
                        {item.title}
                      </motion.span>
                    )}
                    
                    {hasChildren && !collapsed && (
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} className="text-indigo-400" />
                      </motion.div>
                    )}
                  </motion.div>
                  
                  {/* Dropdown menu */}
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
                          {item.children.map((child) => {
                            const childActive = isActive(child.route);
                            return (
                              <motion.li 
                                key={child.title}
                                variants={itemVariants}
                                className="mb-1"
                              >
                                <motion.div
                                  onClick={() => navigate(child.route)}
                                  className={`
                                    px-3 py-2 rounded-lg cursor-pointer text-sm transition
                                    ${childActive ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold' : 'text-gray-700 dark:text-gray-400 font-normal'}
                                    ${!childActive ? 'hover:bg-indigo-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-300' : ''}
                                  `}
                                  whileHover={{ x: 3 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  {child.title}
                                  {childActive && (
                                    <motion.div
                                      className="w-1 h-full absolute right-0 top-0 bg-indigo-600 rounded-l"
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

      {/* Upcoming events */}
      {!collapsed && (
        <motion.div 
          className="mt-auto border-t border-indigo-100 dark:border-gray-700 pt-4 px-4 mb-4"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">Coming Up</span>
              <Calendar size={14} className="text-purple-500 dark:text-purple-400" />
            </div>
            <motion.div className="flex items-center gap-3 mb-2 bg-indigo-50 dark:bg-gray-700 p-2 rounded-lg"
              whileHover={{ x: 2 }}
            >
              <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Clock size={16} />
              </div>
              <div>
                <div className="text-xs font-medium text-indigo-900 dark:text-indigo-200">Loan Payment</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Tomorrow, 9:00 AM</div>
              </div>
            </motion.div>
            
            <motion.div className="flex items-center gap-3 bg-purple-50 dark:bg-gray-700 p-2 rounded-lg"
              whileHover={{ x: 2 }}
            >
              <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <FileText size={16} />
              </div>
              <div>
                <div className="text-xs font-medium text-purple-900 dark:text-purple-200">Statement Available</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Apr 22, 2025</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Customer Support */}
      {!collapsed && (
        <motion.div 
          className="px-4 mb-4"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-xl p-3 flex items-center gap-3 cursor-pointer"
            whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(79, 70, 229, 0.1)" }}
          >
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
              <MessageSquare size={16} />
            </div>
            <div>
              <div className="text-xs font-medium text-indigo-900 dark:text-indigo-200">Need assistance?</div>
              <div className="text-xs text-indigo-700 dark:text-indigo-400">Chat with support</div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Footer */}
      <motion.div 
        className="mt-2 py-3 px-4 text-xs text-center"
        animate={{ 
          justifyContent: collapsed ? "center" : "space-between",
          opacity: 1
        }}
      >
        {!collapsed ? (
          <div className="text-indigo-400 dark:text-indigo-500">
            &copy; {new Date().getFullYear()} Remit Digital Banking
          </div>
        ) : (
          <Heart size={16} className="text-purple-400 mx-auto" />
        )}
      </motion.div>
    </motion.aside>
  );
};

export default UserLeftContainer;