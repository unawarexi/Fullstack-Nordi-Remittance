import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Globe
} from 'lucide-react';

// Menu structure with additional banking-specific items
const menu = [
  {
    title: "Admin Dashboard",
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
      { title: "VIP Clients", route: "/admin/users/vip" },
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
    title: "KYC / Identity Verification",
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
    route: "/logout",
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

const AdminLeftContainer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  // const [notificationCount, setNotificationCount] = useState(5);
  // const [alertCount, setAlertCount] = useState(3);
  
  // Automatically open dropdown for active route on mount
  useEffect(() => {
    const currentParentRoute = menu.find(item => 
      item.children && item.children.some(child => location.pathname === child.route)
    );
    
    if (currentParentRoute && currentParentRoute.route) {
      setOpenDropdowns([currentParentRoute.route]);
    }
  }, []);

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
      className="h-screen bg-white shadow-lg flex flex-col py-6 relative"
    >
      {/* Toggle button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-12 bg-blue-600 text-white p-1 rounded-full shadow-md z-10"
      >
        <motion.div
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      {/* Logo */}
      <motion.div 
        className="font-bold text-xl text-blue-600 mb-8 px-4 flex items-center"
        animate={{ justifyContent: collapsed ? "center" : "flex-start" }}
      >
        <Landmark size={28} className="text-blue-600 mr-2" />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Secure Bank
          </motion.span>
        )}
      </motion.div>

      {/* Status indicators */}
      {!collapsed && (
        <motion.div 
          className="px-4 mb-6 flex border-b border-gray-100  justify-between"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-2 w-1/2">
            <div className="bg-green-500 rounded-full h-2 w-2"></div>
            <span className="text-xs font-medium text-blue-800">SYSTEM ONLINE</span>
          </div>
         
        </motion.div>
      )}

  

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2">
        <ul className="list-none p-0 m-0 space-y-1">
          {menu.map((item) => {
            const active = isActive(item.route);
            const hasChildren = !!item.children;
            const open = openDropdowns.includes(item.route);
            
            return (
              <li key={item.title}>
                <motion.div
                  onClick={() => {
                    if (hasChildren) {
                      if (!collapsed) handleDropdown(item.route);
                      else handleNavigation(item.route);
                    } else {
                      handleNavigation(item.route);
                    }
                  }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition
                    ${active ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 font-medium'}
                    ${!active ? 'hover:bg-blue-50/50 hover:text-blue-600' : ''}
                  `}
                  whileHover={{ x: collapsed ? 0 : 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className={active ? "text-blue-600" : "text-amber-500"}
                    animate={{ 
                      scale: active ? 1.1 : 1 
                    }}
                  >
                    {item.icon}
                  </motion.div>
                  
                  {!collapsed && (
                    <motion.span
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex-1"
                    >
                      {item.title}
                    </motion.span>
                  )}
                  
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
                        {item.children!.map((child) => {
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
                                  ${childActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 font-normal'}
                                  ${!childActive ? 'hover:bg-blue-50 hover:text-blue-600' : ''}
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
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Admin Info */}
      {!collapsed && (
        <motion.div 
          className="mt-auto border-t border-gray-100 pt-4 px-4"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <div className="text-sm font-semibold text-blue-900">Admin User</div>
              <div className="text-xs text-gray-500">System Administrator</div>
            </div>
          </div>
          <div className="flex justify-between text-xs mt-2">
            <div className="text-gray-500">Last login:</div>
            <div className="text-blue-600 font-medium">Today, 9:45 AM</div>
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <motion.div 
        className="mt-4 py-3 px-4 text-xs text-center"
        animate={{ 
          justifyContent: collapsed ? "center" : "space-between",
          opacity: 1
        }}
      >
        {!collapsed ? (
          <div className="text-amber-500 opacity-80">
            &copy; {new Date().getFullYear()} Secure Bank Admin
          </div>
        ) : (
          <Lock size={16} className="text-amber-500 mx-auto" />
        )}
      </motion.div>
    </motion.aside>
  );
};

export default AdminLeftContainer;