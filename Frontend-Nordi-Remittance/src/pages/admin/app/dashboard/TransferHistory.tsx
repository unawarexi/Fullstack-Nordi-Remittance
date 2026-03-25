import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  amount: string;
  status: 'Approved' | 'Liquidated' | 'Awaiting Approval';
  date: string;
}

const TransactionHistory = () => {
  const [activeFilter, setActiveFilter] = useState('3 years');
  const [statusFilter, setStatusFilter] = useState('Approved');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  const transactions: Transaction[] = [
    { id: 'TXN0012345', type: 'Liquidation', amount: '₦200,000.00', status: 'Approved', date: '2024-09-12' },
    { id: 'TXN0012345', type: 'Awaiting Approval', amount: '₦200,000.00', status: 'Liquidated', date: '2024-09-12' },
    { id: 'TXN0012345', type: 'Withdrawal', amount: '₦200,000.00', status: 'Approved', date: '2024-09-12' },
    { id: 'TXN0012345', type: 'Collateral', amount: '₦200,000.00', status: 'Approved', date: '2024-09-12' },
    { id: 'TXN0012345', type: 'Collateral', amount: '₦200,000.00', status: 'Approved', date: '2024-09-12' },
    { id: 'TXN0012345', type: 'Approved', amount: '₦200,000.00', status: 'Approved', date: '2024-09-12' },
    { id: 'TXN0012345', type: 'Collateral', amount: '₦200,000.00', status: 'Approved', date: '2024-09-12' },
    { id: 'TXN0012345', type: 'Stock Investment', amount: '₦200,000.00', status: 'Approved', date: '2024-09-12' },
    { id: 'TXN0012345', type: 'Collateral', amount: '₦200,000.00', status: 'Approved', date: '2024-09-12' },
    { id: 'TXN0012345', type: 'Collateral', amount: '₦200,000.00', status: 'Approved', date: '2024-09-12' },
  ];

  const totalPages = 30;
  const timeFilters = ['3 years', '1 year', '6 months', '30 days'];
  const statusFilters = ['Approved', 'Pending', 'Liquidated'];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 ';
      case 'Liquidated':
        return 'bg-yellow-100 text-yellow-800';
      case 'Awaiting Approval':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDot = (status: string) => {
    switch(status) {
      case 'Approved':
        return 'bg-green-500';
      case 'Liquidated':
        return 'bg-yellow-500';
      case 'Awaiting Approval':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, delay: 0.2 }
    }
  };

  return (
    <motion.div 
      className="rounded-lg"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xs md:text-sm font-bold mb-6 lg:mb-4">Transaction History</h2>
        
        <div className="flex justify-between items-center space-x-4 overflow-x-auto">
          {/* Time Filters */}
          <div className="flex space-x-2 pr-4">
            {timeFilters.map((filter) => (
              <motion.button
                key={filter}
                className={`px-3 py-1 rounded-lg border text-xs  ${
                  activeFilter === filter 
                    ? 'border-[#0C110D] bg-gray-200 text-gray-800 font-medium' 
                    : 'border-gray-300 bg-gray-100 text-gray-500'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </motion.button>
            ))}
          </div>
          
          {/* Status Filters */}
          <div className="flex space-x-2 flex-1 justify-center">
            {statusFilters.map((filter) => (
              <motion.button
                key={filter}
                className={`px-3 py-1 rounded-lg border text-xs ${
                  statusFilter === filter 
                    ? 'border-[#0C110D] bg-[#0C110D] text-white font-medium' 
                    : 'border-gray-300 bg-gray-100 text-gray-500'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStatusFilter(filter)}
              >
                {filter}
              </motion.button>
            ))}
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative flex-1 flex justify-end">
            <motion.button
              className="px-3 py-1 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 flex items-center text-xs"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilterDropdown((prev) => !prev)}
            >
              Filter by
              <ChevronDown size={14} className="ml-1" />
            </motion.button>
            
            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 overflow-visible"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs text-gray-700 font-medium border-b border-gray-100">Sort by</div>
                    <button 
                      className="px-4 py-2 rounded-lg text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => setShowFilterDropdown(false)}
                    >
                      Date (Newest first)
                    </button>
                    <button 
                      className="px-4 py-2 rounded-lg text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => setShowFilterDropdown(false)}
                    >
                      Date (Oldest first)
                    </button>
                    <button 
                      className="px-4 py-2 rounded-lg text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => setShowFilterDropdown(false)}
                    >
                      Amount (High to low)
                    </button>
                    <button 
                      className="px-4 py-2 rounded-lg text-xs text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => setShowFilterDropdown(false)}
                    >
                      Amount (Low to high)
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Table container with separate scrollable header and body */}
      <div className="relative">
        {/* Header with independent scroll */}
        <div className="overflow-x-auto border-b border-gray-400 bg-white sticky top-0 z-10">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="text-left font-bold text-xs text-gray-500">
                <th className="px-4 py-3 whitespace-nowrap">Transaction ID</th>
                <th className="px-4 py-3 whitespace-nowrap">Transaction Type</th>
                <th className="px-4 py-3 whitespace-nowrap">Amount (₦)</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 whitespace-nowrap">Date</th>
                <th className="px-4 py-3 whitespace-nowrap">Action</th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Body with independent scroll */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <tbody>
              {transactions.map((transaction, index) => (
                <motion.tr 
                  key={index}
                  className="border-b border-gray-300 hover:bg-gray-50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <td className="px-4 py-2 text-xs text-gray-700 whitespace-nowrap">{transaction.id}</td>
                  <td className="px-4 py-2 text-xs text-gray-700 whitespace-nowrap">{transaction.type}</td>
                  <td className="px-4 py-2 text-xs text-gray-700 whitespace-nowrap">{transaction.amount}</td>
                  <td className="px-4 py-2 text-xs whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${getStatusDot(transaction.status)}`}></div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-700 whitespace-nowrap">{transaction.date}</td>
                  <td className="px-4 py-2 text-xs whitespace-nowrap">
                    <motion.button
                      className="hover:text-blue-800 border border-gray-500 rounded-lg px-3 py-1 text-xs"
                      whileHover={{ scale: 1.05, backgroundColor: "#f9fafb" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-between items-center px-6 py-4 lg:py-2">
        <div className="text-[10px] md:text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </div>
        
        <div className="flex items-center space-x-1">
          <motion.button
            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 lg:py-1"
            whileHover={{ scale: 1.1, backgroundColor: "#f9fafb" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} className={currentPage === 1 ? "text-gray-300" : "text-gray-600"} />
          </motion.button>
          
          {[1, 2, 3, 4, 5, 6].map((page) => (
            <motion.button
              key={page}
              className={`w-8 h-8 flex text-xs items-center justify-center rounded-md ${
                currentPage === page 
                  ? 'bg-yellow-500 text-white' 
                  : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </motion.button>
          ))}
          
          <motion.button
            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 lg:py-1"
            whileHover={{ scale: 1.1, backgroundColor: "#f9fafb" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} className={currentPage === totalPages ? "text-gray-300" : "text-gray-600"} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionHistory;