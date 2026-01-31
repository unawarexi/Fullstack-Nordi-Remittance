/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, ChevronLeft, Search, Plus, Filter, RefreshCw, Eye, Edit, Trash2 } from 'lucide-react';
import { getAllUsers, deleteUserById } from '@core/api/UserService';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountNumber: string;
  kycStatus: 'verified' | 'pending' | 'rejected';
  isActive: boolean;
  accountType: string;
  lastLogin: string | null;
  currency: string;
}

const OverviewUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [kycFilter, setKycFilter] = useState('All');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const kycFilters = ['All', 'Verified', 'Pending', 'Rejected'];
  const activeFilters = ['All', 'Active', 'Inactive'];
  
  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, kycFilter, activeFilter]);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined
      };
      
      if (kycFilter !== 'All') {
        params.kycStatus = kycFilter.toLowerCase();
      }
      
      if (activeFilter !== 'All') {
        params.isActive = activeFilter === 'Active';
      }
      
      const response = await getAllUsers(params);
      setUsers(response.users);
      setTotalPages(Math.ceil(response.total / 10));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewUser = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };
  
  const handleCreateUser = () => {
    navigate('/admin/users/create');
  };
  
  const handleEditUser = (userId: string) => {
    navigate(`/admin/users/${userId}/edit`);
  };
  
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserById(userId);
      fetchUsers();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };
  
  const getKycStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };
  
  const getKycStatusDot = (status: string) => {
    switch(status.toLowerCase()) {
      case 'verified':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };
  
  const getActiveStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-slate-100 text-slate-600';
  };
  
  const getActiveStatusDot = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-500' 
      : 'bg-slate-500';
  };
  
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, delay: 0.2 }
    }
  };
  
  const skeletonPulse = {
    initial: { opacity: 0.6 },
    animate: { 
      opacity: 1,
      transition: { repeat: Infinity, repeatType: "reverse", duration: 1 }
    }
  };

  return (
    <motion.div 
      className="rounded-lg bg-white shadow-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="p-6 border-b border-slate-200">
        <div className="flex justify-between items-center mb-6 lg:mb-4">
          <h2 className="text-sm md:text-base font-bold">User Management</h2>
          
          <motion.button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-xs font-medium"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCreateUser}
          >
            <Plus size={16} className="mr-2" />
            Create User
          </motion.button>
        </div>
        
        {/* Search and Filters Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, email, account number..."
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2 md:ml-4">
            {/* Refresh Button */}
            <motion.button
              className="p-2 rounded-lg border border-slate-300 text-slate-600"
              whileHover={{ scale: 1.05, backgroundColor: "#f9fafb" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchUsers()}
            >
              <RefreshCw size={16} />
            </motion.button>
            
            {/* Filter Button */}
            <motion.button
              className="p-2 rounded-lg border border-slate-300 text-slate-600"
              whileHover={{ scale: 1.05, backgroundColor: "#f9fafb" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Filter size={16} />
            </motion.button>
            
            {/* Filter Dropdown */}
            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div 
                  className="absolute right-6 mt-10 w-64 bg-white rounded-lg bg-slate-50 shadow-lg z-50"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4">
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold mb-2">KYC Status</h3>
                      <div className="flex flex-wrap gap-2">
                        {kycFilters.map((filter) => (
                          <motion.button
                            key={filter}
                            className={`px-3 py-1 rounded-lg border text-xs ${
                              kycFilter === filter 
                                ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium' 
                                : 'border-slate-300 bg-slate-100 text-slate-500'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setKycFilter(filter);
                              setCurrentPage(1);
                            }}
                          >
                            {filter}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold mb-2">Account Status</h3>
                      <div className="flex flex-wrap gap-2">
                        {activeFilters.map((filter) => (
                          <motion.button
                            key={filter}
                            className={`px-3 py-1 rounded-lg border text-xs ${
                              activeFilter === filter 
                                ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium' 
                                : 'border-slate-300 bg-slate-100 text-slate-500'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setActiveFilter(filter);
                              setCurrentPage(1);
                            }}
                          >
                            {filter}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    
                    <motion.button
                      className="w-full px-3 py-2 rounded-lg bg-slate-200 text-slate-700 text-xs font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setKycFilter('All');
                        setActiveFilter('All');
                        setSearchQuery('');
                        setCurrentPage(1);
                        setShowFilterDropdown(false);
                      }}
                    >
                      Reset Filters
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {kycFilter !== 'All' && (
            <motion.div 
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs flex items-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              KYC: {kycFilter}
              <button 
                className="ml-2 text-blue-500 hover:text-blue-700"
                onClick={() => setKycFilter('All')}
              >
                ×
              </button>
            </motion.div>
          )}
          
          {activeFilter !== 'All' && (
            <motion.div 
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs flex items-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              Status: {activeFilter}
              <button 
                className="ml-2 text-blue-500 hover:text-blue-700"
                onClick={() => setActiveFilter('All')}
              >
                ×
              </button>
            </motion.div>
          )}
          
          {searchQuery && (
            <motion.div 
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs flex items-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              Search: {searchQuery}
              <button 
                className="ml-2 text-blue-500 hover:text-blue-700"
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Table container with unified scrollable header and body */}
      <div className="relative overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-white sticky top-0 border-b border-slate-500 z-10">
            <tr className="text-left font-bold text-xs text-slate-500">
              <th className="px-4 py-3 whitespace-nowrap">Name</th>
              <th className="px-4 py-3 whitespace-nowrap">Email</th>
              <th className="px-4 py-3 whitespace-nowrap">Account Number</th>
              <th className="px-4 py-3 whitespace-nowrap">Account Type</th>
              <th className="px-4 py-3 whitespace-nowrap">KYC Status</th>
              <th className="px-4 py-3 whitespace-nowrap">Status</th>
              <th className="px-4 py-3 whitespace-nowrap">Last Login</th>
              <th className="px-4 py-3 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Skeleton loading rows
              Array(5).fill(0).map((_, index) => (
                <motion.tr 
                  key={`skeleton-${index}`}
                  className="border-b border-slate-300"
                  variants={skeletonPulse}
                  initial="initial"
                  animate="animate"
                >
                  {Array(8).fill(0).map((_, cellIndex) => (
                    <td key={`cell-${cellIndex}`} className="px-4 py-3">
                      <div className="h-4 bg-slate-200 rounded w-24"></div>
                    </td>
                  ))}
                </motion.tr>
              ))
            ) : users.length > 0 ? (
              users.map((user, index) => (
                <motion.tr 
                  key={user._id}
                  className="border-b border-slate-300 hover:bg-slate-50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <td className="px-4 py-2 text-xs text-slate-700 whitespace-nowrap">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-700 whitespace-nowrap">{user.email}</td>
                  <td className="px-4 py-2 text-xs text-slate-700 whitespace-nowrap">{user.accountNumber}</td>
                  <td className="px-4 py-2 text-xs text-slate-700 whitespace-nowrap capitalize">{user.accountType}</td>
                  <td className="px-4 py-2 text-xs whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${getKycStatusDot(user.kycStatus)}`}></div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getKycStatusColor(user.kycStatus)}`}>
                        {user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-xs whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${getActiveStatusDot(user.isActive)}`}></div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getActiveStatusColor(user.isActive)}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-700 whitespace-nowrap">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-4 py-2 text-xs whitespace-nowrap">
                    <div className="flex space-x-2">
                      <motion.button
                        className="text-blue-600 hover:text-blue-800 p-1"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewUser(user._id)}
                        title="View User"
                      >
                        <Eye size={16} />
                      </motion.button>
                      <motion.button
                        className="text-yellow-600 hover:text-yellow-800 p-1"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditUser(user._id)}
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </motion.button>
                      <motion.button
                        className="text-red-600 hover:text-red-800 p-1"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowDeleteConfirm(user._id)}
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500 text-sm">
                  No users found. Try adjusting your filters or search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex justify-between items-center px-6 py-4 lg:py-2">
        <div className="text-xs md:text-sm text-slate-700">
          Page {currentPage} of {totalPages}
        </div>
        
        <div className="flex items-center space-x-1">
          <motion.button
            className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 lg:py-1"
            whileHover={{ scale: 1.1, backgroundColor: "#f9fafb" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} className={currentPage === 1 ? "text-slate-300" : "text-slate-600"} />
          </motion.button>
          
          {totalPages <= 6 ? (
            [...Array(totalPages)].map((_, i) => (
              <motion.button
                key={i}
                className={`w-8 h-8 flex text-xs items-center justify-center rounded-md ${
                  currentPage === i + 1 
                    ? 'bg-blue-600 text-white' 
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </motion.button>
            ))
          ) : (
            <>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                
                if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <motion.button
                    key={i}
                    className={`w-8 h-8 flex text-xs items-center justify-center rounded-md ${
                      currentPage === pageNum 
                        ? 'bg-blue-600 text-white' 
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </motion.button>
                );
              })}
              
              {currentPage < totalPages - 2 && (
                <div className="flex items-center px-2">...</div>
              )}
              
              {currentPage < totalPages - 2 && (
                <motion.button
                  className="w-8 h-8 flex text-xs items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </motion.button>
              )}
            </>
          )}
          
          <motion.button
            className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 lg:py-1"
            whileHover={{ scale: 1.1, backgroundColor: "#f9fafb" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} className={currentPage === totalPages ? "text-slate-300" : "text-slate-600"} />
          </motion.button>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-50 rounded-lg p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
              <p className="text-slate-700 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
              
              <div className="flex justify-end space-x-3">
                <motion.button
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OverviewUsers;