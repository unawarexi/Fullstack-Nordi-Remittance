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
    <nav className="w-full bg-gradient-to-b from-indigo-50 to-purple-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between h-16">
          {/* Left section: Logo and greeting */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 rounded-md flex items-center justify-center text-white font-bold mr-2">
                SB
              </div>
              <span className="text-indigo-700 font-bold text-lg hidden md:block">SecureBank</span>
            </div>
            
            <div className="ml-6 hidden md:flex items-center text-indigo-900">
              <span className="mr-1 text-sm text-purple-400">{greeting},</span>
              <span className="font-medium text-indigo-700">{userData.name}</span>
            </div>
          </div>
          
          {/* Center: Search */}
          <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-purple-400" />
                </div>
                <input
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-indigo-100 rounded-full leading-5 bg-indigo-50 placeholder-purple-300 focus:outline-none focus:bg-white focus:ring-1 focus:ring-purple-400 focus:border-purple-400 transition duration-150 ease-in-out text-sm text-indigo-900"
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
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 text-indigo-700 px-3 py-1.5 rounded-lg transition-colors duration-150 text-sm border border-indigo-100"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="hidden sm:inline">Choose Account</span>
                <ChevronDown size={16} className={`transform transition-transform duration-200 ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
              </motion.button>
              
              <AnimatePresence>
                {isAccountDropdownOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-72 bg-gradient-to-b from-indigo-50 to-purple-50 rounded-lg shadow-lg border border-indigo-100 z-50"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="p-3 border-b border-indigo-100">
                      <h3 className="text-sm font-medium text-indigo-900">Your Accounts</h3>
                    </div>
                    <div className="py-1">
                      {userAccounts.map((account) => (
                        <motion.a
                          key={account.id}
                          href="#"
                          className="block px-4 py-3 hover:bg-indigo-50 transition-colors duration-150"
                          whileHover={{ backgroundColor: "rgba(238,242,255,0.7)" }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="mr-3 text-purple-500">
                                {account.icon}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-indigo-900">{account.type}</div>
                                <div className="text-xs text-purple-400">{account.number}</div>
                              </div>
                            </div>
                            <div className="text-sm font-semibold text-purple-700">{account.balance}</div>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                    <div className="p-3 border-t border-indigo-100">
                      <a href="/accounts" className="text-xs flex items-center justify-center text-purple-600 hover:text-indigo-700 font-medium">
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
                className="p-2 rounded-full bg-indigo-50 text-purple-500 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                variants={iconButtonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>
            
              {/* Messages */}
              <motion.div className="relative" variants={iconButtonVariants} whileHover="hover" whileTap="tap">
                <button className="p-2 rounded-full bg-purple-50 text-purple-500 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400">
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
                <button className="p-2 rounded-full bg-indigo-50 text-indigo-500 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <Bell size={18} />
                </button>
                {userData.notifications > 0 && (
                  <span className="absolute top-0 right-0 bg-purple-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                    {userData.notifications}
                  </span>
                )}
              </motion.div>
              
              {/* Settings */}
              <motion.button
                className="p-2 rounded-full bg-purple-50 text-purple-500 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
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
                className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-200 via-purple-200 to-pink-100 overflow-hidden border-2 border-indigo-200"
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