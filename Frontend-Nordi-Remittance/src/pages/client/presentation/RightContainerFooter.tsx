import React from "react";
import { motion } from "framer-motion";
import { Shield, HelpCircle, Twitter, Facebook, Instagram, Youtube } from "lucide-react";

const RightContainerFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <motion.footer
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-4 px-6 transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm">
          {/* Left section */}
          <div className="flex items-center text-gray-500 mb-3 md:mb-0">
            <Shield size={16} className="text-blue-600 mr-2" />
            <span>&copy; {currentYear} SecureBank PLC. All rights reserved.</span>
          </div>
          
          {/* Middle section - social icons */}
          <div className="flex space-x-4 mb-3 md:mb-0">
            <motion.a href="#" whileHover={{ scale: 1.1 }} className="text-gray-400 hover:text-blue-500">
              <Twitter size={16} />
            </motion.a>
            <motion.a href="#" whileHover={{ scale: 1.1 }} className="text-gray-400 hover:text-blue-500">
              <Facebook size={16} />
            </motion.a>
            <motion.a href="#" whileHover={{ scale: 1.1 }} className="text-gray-400 hover:text-blue-500">
              <Instagram size={16} />
            </motion.a>
            <motion.a href="#" whileHover={{ scale: 1.1 }} className="text-gray-400 hover:text-blue-500">
              <Youtube size={16} />
            </motion.a>
          </div>
          
          {/* Right section - links */}
          <div className="flex space-x-6">
            <motion.a 
              href="/support" 
              className="text-gray-500 hover:text-blue-600 transition-colors duration-150 text-xs flex items-center"
              whileHover={{ x: 2 }}
            >
              <HelpCircle size={14} className="mr-1" />
              Support
            </motion.a>
            <motion.a 
              href="/privacy" 
              className="text-gray-500 hover:text-blue-600 transition-colors duration-150 text-xs"
              whileHover={{ x: 2 }}
            >
              Privacy Policy
            </motion.a>
            <motion.a 
              href="/terms" 
              className="text-gray-500 hover:text-blue-600 transition-colors duration-150 text-xs"
              whileHover={{ x: 2 }}
            >
              Terms
            </motion.a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default RightContainerFooter;