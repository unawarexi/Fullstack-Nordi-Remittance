/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, ShieldCheck, Edit, Lock, Unlock, FileCheck, FileBadge } from 'lucide-react';
import { useUserDetail } from '../../domain/useUserDetail';
import UserTransfer from './UserTransfer';
import useThemeStore from '@store/theme.store';

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();
  const {
    user,
    isLoading: loading,
    confirmAction,
    setConfirmAction,
    activateDeactivate,
    lockUnlock,
    changeKycStatus,
  } = useUserDetail(id || '');
  const [activeTab, setActiveTab] = useState('personal');

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200';
    switch(status.toLowerCase()) {
      case 'verified':
      case 'approved':
        return 'bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-400';
      case 'pending':
        return 'bg-secondary-50 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400';
      case 'rejected':
        return 'bg-error-50 text-error-700 dark:bg-error-900/30 dark:text-error-400';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center max-w-md p-6 bg-white dark:bg-neutral-900 rounded-lg shadow-md">
          <div className="text-error-500 text-5xl mb-4">!</div>
          <h2 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">User Not Found</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">The requested user could not be found.</p>
          <button 
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            onClick={() => navigate('/admin/users/all')}
          >
            Back to User List
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto py-6 px-4 max-w-6xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="flex justify-between items-center mb-6"
        variants={itemVariants}
      >
        <div className="flex items-center">
          <button 
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 mr-4 text-neutral-700 dark:text-neutral-300"
            onClick={() => navigate('/admin/users')}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">User Details</h1>
            <p className="text-neutral-500 dark:text-neutral-400">Manage and view user information</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <motion.button
            className="px-4 py-2 bg-secondary-500 text-white rounded-lg flex items-center hover:bg-secondary-600"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/admin/users/${id}/edit`)}
          >
            <Edit size={16} className="mr-2" />
            Edit User
          </motion.button>
          <motion.button
            className={`px-4 py-2 ${user.isActive ? 'bg-error-500 hover:bg-error-600' : 'bg-success-500 hover:bg-success-600'} text-white rounded-lg flex items-center`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setConfirmAction({ type: 'activate', visible: true })}
          >
            {user.isActive ? (
              <>
                <Lock size={16} className="mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <Unlock size={16} className="mr-2" />
                Activate
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* User Summary Card */}
      <motion.div 
        className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 mb-6 border border-neutral-200 dark:border-neutral-700"
        variants={itemVariants}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 md:mb-0 md:mr-6 flex-shrink-0 border-2 border-neutral-200 dark:border-neutral-700">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                <User size={40} className="text-neutral-400 dark:text-neutral-500" />
              </div>
            )}
          </div>
          
          <div className="text-center md:text-left flex-grow">
            <h2 className="text-xl font-bold mb-1 text-neutral-900 dark:text-white">
              {[user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ') || 'N/A'}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-3">{user.email || 'N/A'}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(user.kycStatus)}`}>
                KYC: {user.kycStatus ? user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1) : 'N/A'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs ${user.isActive ? 'bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-400' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs ${user.isLocked ? 'bg-error-50 text-error-700 dark:bg-error-900/30 dark:text-error-400' : 'bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-400'}`}>
                {user.isLocked ? 'Locked' : 'Unlocked'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                {user.accountType ? user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1) : 'N/A'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-neutral-500 dark:text-neutral-400">Account Number</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.accountNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-neutral-400">Last Login</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-neutral-400">Currency</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.currency || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
            <div className="flex flex-col">
              <span className="text-neutral-500 dark:text-neutral-400 text-xs">ID Number</span>
              <span className="font-medium text-neutral-900 dark:text-white">{user.idNumber || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-neutral-500 dark:text-neutral-400 text-xs">ID Type</span>
              <span className="font-medium capitalize text-neutral-900 dark:text-white">{user.idType ? user.idType.replace('_', ' ') : 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-neutral-500 dark:text-neutral-400 text-xs">ID Expiry</span>
              <span className="font-medium text-neutral-900 dark:text-white">{user.idExpiryDate ? formatDate(user.idExpiryDate) : 'N/A'}</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Tabs Navigation */}
      <motion.div 
        className="flex border-b border-neutral-200 dark:border-neutral-700 mb-6 overflow-x-auto"
        variants={itemVariants}
      >
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'personal' ? 'border-primary-500 text-primary-500' : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
          onClick={() => setActiveTab('personal')}
        >
          Personal Details
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'account' ? 'border-primary-500 text-primary-500' : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
          onClick={() => setActiveTab('account')}
        >
          Account Details
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'financial' ? 'border-primary-500 text-primary-500' : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
          onClick={() => setActiveTab('financial')}
        >
          Financial Info
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'security' ? 'border-primary-500 text-primary-500' : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
          onClick={() => setActiveTab('security')}
        >
          Security Settings
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'documents' ? 'border-primary-500 text-primary-500' : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </button>
      </motion.div>
      
      {/* Tab Content */}
      <motion.div 
        className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-700 mb-6"
        variants={itemVariants}
      >
        {/* Personal Details Tab */}
        {activeTab === 'personal' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Full Name</p>
                <p className="font-medium text-neutral-900 dark:text-white">{[user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ') || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Date of Birth</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.dateOfBirth ? formatDate(user.dateOfBirth) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Gender</p>
                <p className="font-medium capitalize text-neutral-900 dark:text-white">{user.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Nationality</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.nationality || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Country of Residence</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.countryOfResidence || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Marital Status</p>
                <p className="font-medium capitalize text-neutral-900 dark:text-white">{user.maritalStatus || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Email</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Mobile Number</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.mobileNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Alternative Phone</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.alternativePhone || 'N/A'}</p>
              </div>
            </div>
            
            <h3 className="text-lg font-bold mb-4 mt-8 text-neutral-900 dark:text-white">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Home Address</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.homeAddress || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">City</p>
                <p className="font-medium capitalize text-neutral-900 dark:text-white">{user.city || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">State/Province</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.stateProvince || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Zip/Postal Code</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.zipCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Country</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.country || 'N/A'}</p>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Account Details Tab */}
        {activeTab === 'account' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Account Type</p>
                <p className="font-medium capitalize text-neutral-900 dark:text-white">{user.accountType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Account Number</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.accountNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Account Name</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.accountName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Currency</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.currency || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Initial Deposit</p>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {user.currency} {typeof user.initialDeposit === 'number' ? user.initialDeposit.toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Referral Code</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.referralCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Invite Code</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.inviteCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Status</p>
                <p className={`font-medium ${user.isActive ? 'text-success-500' : 'text-error-500'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Last Login</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</p>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Financial Info Tab */}
        {activeTab === 'financial' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Source of Income</p>
                <p className="font-medium capitalize text-neutral-900 dark:text-white">{user.sourceOfIncome ? user.sourceOfIncome.replace('_', ' ') : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Monthly Income Range</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.monthlyIncomeRange || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Employment Status</p>
                <p className="font-medium capitalize text-neutral-900 dark:text-white">{user.employmentStatus || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Employer Name</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.employerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Occupation</p>
                <p className="font-medium capitalize text-neutral-900 dark:text-white">{user.occupation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Tax Identification Number</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.taxIdentificationNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Social Security Number</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.socialSecurityNumber || 'N/A'}</p>
              </div>
            </div>
            
            <h3 className="text-lg font-bold mb-4 mt-8 text-neutral-900 dark:text-white">Bank Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Bank Name</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.bankName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Bank Address</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.bankAddress || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">IBAN Number</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.ibanNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Routing Number</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.routingNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">SWIFT/BIC</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.swiftBic || 'N/A'}</p>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Security Settings Tab */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Security Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Two-Factor Authentication</p>
                <p className={`font-medium ${user.enableTwoFactor ? 'text-success-500' : 'text-error-500'}`}>
                  {user.enableTwoFactor ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              {user.enableTwoFactor && (
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Two-Factor Method</p>
                  <p className="font-medium capitalize text-neutral-900 dark:text-white">{user.twoFactorMethod || 'N/A'}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Account Lock Status</p>
                <p className={`font-medium ${user.isLocked ? 'text-error-500' : 'text-success-500'}`}>
                  {user.isLocked ? 'Locked' : 'Unlocked'}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Login Attempts</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.loginAttempts ? user.loginAttempts.length : '0'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Security Question</p>
                <p className="font-medium capitalize text-neutral-900 dark:text-white">{user.securityQuestion ? user.securityQuestion.replace('_', ' ') : 'N/A'}</p>
              </div>
            </div>
            
            <div className="mt-8 border-t border-neutral-200 dark:border-neutral-700 pt-6">
              <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Account Actions</h3>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  className={`px-4 py-2 ${user.isActive ? 'bg-error-500 hover:bg-error-600' : 'bg-success-500 hover:bg-success-600'} text-white rounded-lg flex items-center`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setConfirmAction({ type: 'activate', visible: true })}
                >
                  {user.isActive ? (
                    <>
                      <Lock size={16} className="mr-2" />
                      Deactivate Account
                    </>
                  ) : (
                    <>
                      <Unlock size={16} className="mr-2" />
                      Activate Account
                    </>
                  )}
                </motion.button>
                
                <motion.button
                  className={`px-4 py-2 ${user.isLocked ? 'bg-success-500 hover:bg-success-600' : 'bg-error-500 hover:bg-error-600'} text-white rounded-lg flex items-center`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setConfirmAction({ type: 'lock', visible: true })}
                >
                  {user.isLocked ? (
                    <>
                      <Unlock size={16} className="mr-2" />
                      Unlock Account
                    </>
                  ) : (
                    <>
                      <Lock size={16} className="mr-2" />
                      Lock Account
                    </>
                  )}
                </motion.button>
                
                <motion.button
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/admin/users/${id}/reset-password`)}
                >
                  <Lock size={16} className="mr-2" />
                  Reset Password
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">User Documents</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <h4 className="font-medium mb-3 text-neutral-900 dark:text-white">Government ID</h4>
                <div className="aspect-video bg-neutral-100 dark:bg-neutral-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {user.governmentId ? (
                    <img src={user.governmentId} alt="Government ID" className="w-full h-full object-contain" />
                  ) : (
                    <FileBadge size={48} className="text-neutral-400 dark:text-neutral-500" />
                  )}
                </div>
                <div className="text-sm space-y-2 text-neutral-900 dark:text-white">
                  <p><span className="text-neutral-500 dark:text-neutral-400">ID Type:</span> {user.idType || 'N/A'}</p>
                  <p><span className="text-neutral-500 dark:text-neutral-400">ID Number:</span> {user.idNumber || 'N/A'}</p>
                  <p><span className="text-neutral-500 dark:text-neutral-400">ID Expiry:</span> {user.idExpiryDate ? formatDate(user.idExpiryDate) : 'N/A'}</p>
                </div>
              </div>
              
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <h4 className="font-medium mb-3 text-neutral-900 dark:text-white">Proof of Address</h4>
                <div className="aspect-video bg-neutral-100 dark:bg-neutral-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {user.proofOfAddress ? (
                    <img src={user.proofOfAddress} alt="Proof of Address" className="w-full h-full object-contain" />
                  ) : (
                    <FileBadge size={48} className="text-neutral-400 dark:text-neutral-500" />
                  )}
                </div>
                <div className="text-sm space-y-2 text-neutral-900 dark:text-white">
                  <p><span className="text-neutral-500 dark:text-neutral-400">Document Type:</span> {user.addressDocType || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <h4 className="font-medium mb-3 text-neutral-900 dark:text-white">Selfie with ID</h4>
                <div className="aspect-video bg-neutral-100 dark:bg-neutral-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {user.selfieWithId ? (
                    <img src={user.selfieWithId} alt="Selfie with ID" className="w-full h-full object-contain" />
                  ) : (
                    <User size={48} className="text-neutral-400 dark:text-neutral-500" />
                  )}
                </div>
              </div>
              
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <h4 className="font-medium mb-3 text-neutral-900 dark:text-white">Signature</h4>
                <div className="aspect-video bg-neutral-100 dark:bg-neutral-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {user.signature ? (
                    <img src={user.signature} alt="Signature" className="w-full h-full object-contain" />
                  ) : (
                    <FileCheck size={48} className="text-neutral-400 dark:text-neutral-500" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-8 border-t border-neutral-200 dark:border-neutral-700 pt-6">
              <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">KYC Status Management</h3>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  className={`px-4 py-2 ${user.kycStatus === 'verified' ? 'bg-neutral-400 dark:bg-neutral-600' : 'bg-success-500 hover:bg-success-600'} text-white rounded-lg flex items-center`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={user.kycStatus === 'verified'}
                  onClick={() => setConfirmAction({ type: 'kyc-verify', visible: true })}
                >
                  <ShieldCheck size={16} className="mr-2" />
                  Verify KYC
                </motion.button>
                
                <motion.button
                  className={`px-4 py-2 ${user.kycStatus === 'pending' ? 'bg-neutral-400 dark:bg-neutral-600' : 'bg-secondary-600 hover:bg-secondary-700'} text-white rounded-lg flex items-center`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={user.kycStatus === 'pending'}
                  onClick={() => setConfirmAction({ type: 'kyc-pending', visible: true })}
                >
                  <Calendar size={16} className="mr-2" />
                  Mark as Pending
                </motion.button>
                
                <motion.button
                  className={`px-4 py-2 ${user.kycStatus === 'rejected' ? 'bg-neutral-400 dark:bg-neutral-600' : 'bg-error-500 hover:bg-error-600'} text-white rounded-lg flex items-center`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={user.kycStatus === 'rejected'}
                  onClick={() => setConfirmAction({ type: 'kyc-reject', visible: true })}
                >
                  <Lock size={16} className="mr-2" />
                  Reject KYC
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Confirmation Dialog */}
      {confirmAction && confirmAction.visible && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/60 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-4 text-neutral-900 dark:text-white">Confirm Action</h3>
            {confirmAction.type === 'activate' && (
              <p className="mb-6 text-neutral-700 dark:text-neutral-300">
                Are you sure you want to {user.isActive ? 'deactivate' : 'activate'} this user account?
                {user.isActive ? ' The user will no longer be able to access their account.' : ' The user will regain access to their account.'}
              </p>
            )}
            {confirmAction.type === 'lock' && (
              <p className="mb-6 text-neutral-700 dark:text-neutral-300">
                Are you sure you want to {user.isLocked ? 'unlock' : 'lock'} this user account?
                {user.isLocked ? ' The user will be able to log in again.' : ' The user will be prevented from logging in.'}
              </p>
            )}
            {confirmAction.type === 'kyc-verify' && (
              <p className="mb-6 text-neutral-700 dark:text-neutral-300">
                Are you sure you want to verify this user's KYC? This will grant them full access to all platform features.
              </p>
            )}
            {confirmAction.type === 'kyc-pending' && (
              <p className="mb-6 text-neutral-700 dark:text-neutral-300">
                Are you sure you want to mark this user's KYC as pending? This will limit their access to some platform features.
              </p>
            )}
            {confirmAction.type === 'kyc-reject' && (
              <p className="mb-6 text-neutral-700 dark:text-neutral-300">
                Are you sure you want to reject this user's KYC? This will significantly restrict their account functionality.
              </p>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded hover:bg-neutral-300 dark:hover:bg-neutral-600"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
                onClick={() => {
                  if (confirmAction.type === 'activate') {
                    activateDeactivate();
                  } else if (confirmAction.type === 'lock') {
                    lockUnlock();
                  } else if (confirmAction.type === 'kyc-verify') {
                    changeKycStatus('verified');
                  } else if (confirmAction.type === 'kyc-pending') {
                    changeKycStatus('pending');
                  } else if (confirmAction.type === 'kyc-reject') {
                    changeKycStatus('rejected');
                  }
                }}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Render UserTransfer below the details section */}
      <div className="mt-8">
        <UserTransfer />
      </div>
    </motion.div>
  );
};

export default UserDetail;