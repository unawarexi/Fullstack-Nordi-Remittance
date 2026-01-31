import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell, 
  MessageSquare, 
  Settings, 
  ChevronDown, 
  CreditCard, 
  Briefcase, 
  PiggyBank, 
  Wallet,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';

// Sample user accounts for the dropdown
const userAccounts = [
  { id: 1, type: "Checking Account", number: "****6789", balance: "$4,256.78", icon: <CreditCard size={16} /> },
  { id: 2, type: "Savings Account", number: "****1234", balance: "$12,845.50", icon: <PiggyBank size={16} /> },
  { id: 3, type: "Investment Portfolio", number: "****8901", balance: "$36,720.42", icon: <Briefcase size={16} /> },
  { id: 4, type: "Business Account", number: "****4567", balance: "$85,412.19", icon: <Wallet size={16} /> }
];

// Placeholder user data
const userData = {
  name: "Alexander Thompson",
  image: "/api/placeholder/40/40", // You can replace with actual image path
  notifications: 3,
  messages: 2
};

const RightContainerNav = () => {
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Calculate greeting based on time of day
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Good Morning");
    else if (hours < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);
  
  // Toggle account dropdown
  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
  };

  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -5, height: 0 },
    visible: { 
      opacity: 1, 
      y: 0, 
      height: "auto",
      transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      y: -5,
      height: 0,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  const iconButtonVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.95 }
  };

  return (
    <nav className="w-full bg-slate-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between h-16">
          {/* Left section: Logo and greeting */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold mr-2">
                SB
              </div>
              <span className="text-blue-600 font-bold text-lg hidden md:block">SecureBank</span>
            </div>
            
            <div className="ml-6 hidden md:flex items-center text-gray-700">
              <span className="mr-1 text-sm text-gray-500">{greeting},</span>
              <span className="font-medium text-blue-600">{userData.name}</span>
            </div>
          </div>
          
          {/* Center: Search */}
          <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm"
                  placeholder="Search transactions, accounts..."
                  type="search"
                />
              </div>
            </div>
          </div>
          
          {/* Right section: Account selector and icons */}
          <div className="flex items-center space-x-4">
            {/* Account selector dropdown */}
            <div className="relative">
              <motion.button
                onClick={toggleAccountDropdown}
                className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition-colors duration-150 text-sm border border-blue-100"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="hidden sm:inline">Choose Account</span>
                <ChevronDown size={16} className={`transform transition-transform duration-200 ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
              </motion.button>
              
              <AnimatePresence>
                {isAccountDropdownOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-72 bg-slate-50 rounded-lg shadow-lg border border-gray-100 z-50"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="p-3 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700">Your Accounts</h3>
                    </div>
                    <div className="py-1">
                      {userAccounts.map((account) => (
                        <motion.a
                          key={account.id}
                          href="#"
                          className="block px-4 py-3 hover:bg-blue-50 transition-colors duration-150"
                          whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.6)" }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="mr-3 text-blue-500">
                                {account.icon}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-800">{account.type}</div>
                                <div className="text-xs text-gray-500">{account.number}</div>
                              </div>
                            </div>
                            <div className="text-sm font-semibold text-blue-700">{account.balance}</div>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <a href="/accounts" className="text-xs flex items-center justify-center text-blue-600 hover:text-blue-800 font-medium">
                        View All Accounts
                        <ChevronRight size={14} className="ml-1" />
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Icon buttons */}
            <div className="flex items-center space-x-2">
              {/* Toggle dark/light mode */}
              <motion.button
                className="p-2 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                variants={iconButtonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>
            
              {/* Messages */}
              <motion.div className="relative" variants={iconButtonVariants} whileHover="hover" whileTap="tap">
                <button className="p-2 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <MessageSquare size={18} />
                </button>
                {userData.messages > 0 && (
                  <span className="absolute top-0 right-0 bg-amber-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                    {userData.messages}
                  </span>
                )}
              </motion.div>
              
              {/* Notifications */}
              <motion.div className="relative" variants={iconButtonVariants} whileHover="hover" whileTap="tap">
                <button className="p-2 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <Bell size={18} />
                </button>
                {userData.notifications > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                    {userData.notifications}
                  </span>
                )}
              </motion.div>
              
              {/* Settings */}
              <motion.button
                className="p-2 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                variants={iconButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Settings size={18} />
              </motion.button>
            </div>
            
            {/* User profile */}
            <div className="ml-2 flex items-center">
              <motion.div 
                className="h-10 w-10 rounded-full bg-blue-100 overflow-hidden border-2 border-blue-200"
                whileHover={{ scale: 1.05 }}
              >
                <img
                  src={userData.image}
                  alt={userData.name}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default RightContainerNav;