/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar,  ShieldCheck, Edit, Lock, Unlock, FileCheck, FileBadge } from 'lucide-react';
import { getUserById, updateUserById } from '@core/api/UserService';
import UserTransfer from './UserTransfer';

interface UserDetails {
  _id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  countryOfResidence: string;
  maritalStatus: string;
  profilePicture: string;
  governmentId: string;
  idType: string;
  idNumber: string;
  idExpiryDate: string;
  proofOfAddress: string;
  addressDocType: string;
  socialSecurityNumber: string;
  taxIdentificationNumber: string;
  email: string;
  mobileNumber: string;
  alternativePhone: string;
  homeAddress: string;
  city: string;
  securityQuestion: string;
  stateProvince: string;
  zipCode: string;
  country: string;
  accountType: string;
  currency: string;
  sourceOfIncome: string;
  monthlyIncomeRange: string;
  initialDeposit: number;
  employmentStatus: string;
  employerName: string;
  occupation: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankAddress: string;
  ibanNumber: string;
  routingNumber: string;
  swiftBic: string;
  enableTwoFactor: boolean;
  twoFactorMethod: string;
  referralCode: string;
  selfieWithId: string;
  signature: string;
  inviteCode: string;
  isActive: boolean;
  kycStatus: string;
  lastLogin: string | null;
  isLocked: boolean;
  loginAttempts: any[];
}

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: string; visible: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (id) {
      fetchUserDetails(id);
    }
  }, [id]);

  const fetchUserDetails = async (userId: string) => {
    setLoading(true);
    try {
      const data = await getUserById(userId);
      setUser(data.user ? data.user : data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      setError('Failed to load user details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateDeactivate = async () => {
    if (!user || !id) return;
    
    try {
      await updateUserById(id, { isActive: !user.isActive });
      setUser({ ...user, isActive: !user.isActive });
      setConfirmAction(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleLockUnlock = async () => {
    if (!user || !id) return;
    
    try {
      await updateUserById(id, { isLocked: !user.isLocked });
      setUser({ ...user, isLocked: !user.isLocked });
      setConfirmAction(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleKycStatusChange = async (status: string) => {
    if (!user || !id) return;
    
    try {
      await updateUserById(id, { kycStatus: status });
      setUser({ ...user, kycStatus: status });
      setConfirmAction(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-slate-100 text-slate-800';
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center max-w-md p-6 bg-slate-50 rounded-lg shadow-md">
          <div className="text-red-600 text-5xl mb-4">!</div>
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-slate-50 rounded-lg hover:bg-blue-700"
            onClick={() => navigate('/admin/users')}
          >
            Back to User List
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center max-w-md p-6 bg-slate-50 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">User Not Found</h2>
          <p className="text-slate-600 mb-4">The requested user could not be found.</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-slate-50 rounded-lg hover:bg-blue-700"
            onClick={() => navigate('/admin/users')}
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
            className="p-2 rounded-full hover:bg-slate-100 mr-4"
            onClick={() => navigate('/admin/users')}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">User Details</h1>
            <p className="text-slate-500">Manage and view user information</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <motion.button
            className="px-4 py-2 bg-yellow-500 text-slate-50 rounded-lg flex items-center"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/admin/users/${id}/edit`)}
          >
            <Edit size={16} className="mr-2" />
            Edit User
          </motion.button>
          <motion.button
            className={`px-4 py-2 ${user.isActive ? 'bg-red-600' : 'bg-green-600'} text-slate-50 rounded-lg flex items-center`}
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
        className="bg-slate-50 rounded-lg shadow-sm p-6 mb-6 border border-slate-200"
        variants={itemVariants}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 md:mb-0 md:mr-6 flex-shrink-0 border-2 border-slate-200">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                <User size={40} className="text-slate-400" />
              </div>
            )}
          </div>
          
          <div className="text-center md:text-left flex-grow">
            <h2 className="text-xl font-bold mb-1">
              {[user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ') || 'N/A'}
            </h2>
            <p className="text-slate-500 mb-3">{user.email || 'N/A'}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(user.kycStatus)}`}>
                KYC: {user.kycStatus ? user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1) : 'N/A'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs ${user.isLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {user.isLocked ? 'Locked' : 'Unlocked'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                {user.accountType ? user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1) : 'N/A'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Account Number</p>
                <p className="font-medium">{user.accountNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-500">Last Login</p>
                <p className="font-medium">{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</p>
              </div>
              <div>
                <p className="text-slate-500">Currency</p>
                <p className="font-medium">{user.currency || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs">ID Number</span>
              <span className="font-medium">{user.idNumber || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs">ID Type</span>
              <span className="font-medium capitalize">{user.idType ? user.idType.replace('_', ' ') : 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs">ID Expiry</span>
              <span className="font-medium">{user.idExpiryDate ? formatDate(user.idExpiryDate) : 'N/A'}</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Tabs Navigation */}
      <motion.div 
        className="flex border-b border-slate-200 mb-6 overflow-x-auto"
        variants={itemVariants}
      >
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'personal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('personal')}
        >
          Personal Details
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'account' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('account')}
        >
          Account Details
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'financial' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('financial')}
        >
          Financial Info
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'security' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('security')}
        >
          Security Settings
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </button>
      </motion.div>
      
      {/* Tab Content */}
      <motion.div 
        className="bg-slate-50 rounded-lg shadow-sm p-6 border border-slate-200 mb-6"
        variants={itemVariants}
      >
        {/* Personal Details Tab */}
        {activeTab === 'personal' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-bold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Full Name</p>
                <p className="font-medium">{[user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ') || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Date of Birth</p>
                <p className="font-medium">{user.dateOfBirth ? formatDate(user.dateOfBirth) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Gender</p>
                <p className="font-medium capitalize">{user.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Nationality</p>
                <p className="font-medium">{user.nationality || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Country of Residence</p>
                <p className="font-medium">{user.countryOfResidence || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Marital Status</p>
                <p className="font-medium capitalize">{user.maritalStatus || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Email</p>
                <p className="font-medium">{user.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Mobile Number</p>
                <p className="font-medium">{user.mobileNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Alternative Phone</p>
                <p className="font-medium">{user.alternativePhone || 'N/A'}</p>
              </div>
            </div>
            
            <h3 className="text-lg font-bold mb-4 mt-8">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Home Address</p>
                <p className="font-medium">{user.homeAddress || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">City</p>
                <p className="font-medium capitalize">{user.city || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">State/Province</p>
                <p className="font-medium">{user.stateProvince || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Zip/Postal Code</p>
                <p className="font-medium">{user.zipCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Country</p>
                <p className="font-medium">{user.country || 'N/A'}</p>
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
            <h3 className="text-lg font-bold mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Account Type</p>
                <p className="font-medium capitalize">{user.accountType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Account Number</p>
                <p className="font-medium">{user.accountNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Account Name</p>
                <p className="font-medium">{user.accountName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Currency</p>
                <p className="font-medium">{user.currency || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Initial Deposit</p>
                <p className="font-medium">
                  {user.currency} {typeof user.initialDeposit === 'number' ? user.initialDeposit.toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Referral Code</p>
                <p className="font-medium">{user.referralCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Invite Code</p>
                <p className="font-medium">{user.inviteCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Status</p>
                <p className={`font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Last Login</p>
                <p className="font-medium">{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</p>
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
            <h3 className="text-lg font-bold mb-4">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Source of Income</p>
                <p className="font-medium capitalize">{user.sourceOfIncome ? user.sourceOfIncome.replace('_', ' ') : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Monthly Income Range</p>
                <p className="font-medium">{user.monthlyIncomeRange || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Employment Status</p>
                <p className="font-medium capitalize">{user.employmentStatus || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Employer Name</p>
                <p className="font-medium">{user.employerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Occupation</p>
                <p className="font-medium capitalize">{user.occupation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Tax Identification Number</p>
                <p className="font-medium">{user.taxIdentificationNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Social Security Number</p>
                <p className="font-medium">{user.socialSecurityNumber || 'N/A'}</p>
              </div>
            </div>
            
            <h3 className="text-lg font-bold mb-4 mt-8">Bank Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Bank Name</p>
                <p className="font-medium">{user.bankName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Bank Address</p>
                <p className="font-medium">{user.bankAddress || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">IBAN Number</p>
                <p className="font-medium">{user.ibanNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Routing Number</p>
                <p className="font-medium">{user.routingNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">SWIFT/BIC</p>
                <p className="font-medium">{user.swiftBic || 'N/A'}</p>
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
            <h3 className="text-lg font-bold mb-4">Security Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Two-Factor Authentication</p>
                <p className={`font-medium ${user.enableTwoFactor ? 'text-green-600' : 'text-red-600'}`}>
                  {user.enableTwoFactor ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              {user.enableTwoFactor && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Two-Factor Method</p>
                  <p className="font-medium capitalize">{user.twoFactorMethod || 'N/A'}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-slate-500 mb-1">Account Lock Status</p>
                <p className={`font-medium ${user.isLocked ? 'text-red-600' : 'text-green-600'}`}>
                  {user.isLocked ? 'Locked' : 'Unlocked'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Login Attempts</p>
                <p className="font-medium">{user.loginAttempts ? user.loginAttempts.length : '0'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Security Question</p>
                <p className="font-medium capitalize">{user.securityQuestion ? user.securityQuestion.replace('_', ' ') : 'N/A'}</p>
              </div>
            </div>
            
            <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="text-lg font-bold mb-4">Account Actions</h3>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  className={`px-4 py-2 ${user.isActive ? 'bg-red-600' : 'bg-green-600'} text-slate-50 rounded-lg flex items-center`}
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
                  className={`px-4 py-2 ${user.isLocked ? 'bg-green-600' : 'bg-red-600'} text-slate-50 rounded-lg flex items-center`}
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
                  className="px-4 py-2 bg-blue-600 text-slate-50 rounded-lg flex items-center"
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
            <h3 className="text-lg font-bold mb-4">User Documents</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-medium mb-3">Government ID</h4>
                <div className="aspect-video bg-slate-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {user.governmentId ? (
                    <img src={user.governmentId} alt="Government ID" className="w-full h-full object-contain" />
                  ) : (
                    <FileBadge size={48} className="text-slate-400" />
                  )}
                </div>
                <div className="text-sm space-y-2">
                  <p><span className="text-slate-500">ID Type:</span> {user.idType || 'N/A'}</p>
                  <p><span className="text-slate-500">ID Number:</span> {user.idNumber || 'N/A'}</p>
                  <p><span className="text-slate-500">ID Expiry:</span> {user.idExpiryDate ? formatDate(user.idExpiryDate) : 'N/A'}</p>
                </div>
              </div>
              
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-medium mb-3">Proof of Address</h4>
                <div className="aspect-video bg-slate-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {user.proofOfAddress ? (
                    <img src={user.proofOfAddress} alt="Proof of Address" className="w-full h-full object-contain" />
                  ) : (
                    <FileBadge size={48} className="text-slate-400" />
                  )}
                </div>
                <div className="text-sm space-y-2">
                  <p><span className="text-slate-500">Document Type:</span> {user.addressDocType || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-medium mb-3">Selfie with ID</h4>
                <div className="aspect-video bg-slate-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {user.selfieWithId ? (
                    <img src={user.selfieWithId} alt="Selfie with ID" className="w-full h-full object-contain" />
                  ) : (
                    <User size={48} className="text-slate-400" />
                  )}
                </div>
              </div>
              
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-medium mb-3">Signature</h4>
                <div className="aspect-video bg-slate-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {user.signature ? (
                    <img src={user.signature} alt="Signature" className="w-full h-full object-contain" />
                  ) : (
                    <FileCheck size={48} className="text-slate-400" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="text-lg font-bold mb-4">KYC Status Management</h3>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  className={`px-4 py-2 ${user.kycStatus === 'verified' ? 'bg-slate-400' : 'bg-green-600'} text-slate-50 rounded-lg flex items-center`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={user.kycStatus === 'verified'}
                  onClick={() => setConfirmAction({ type: 'kyc-verify', visible: true })}
                >
                  <ShieldCheck size={16} className="mr-2" />
                  Verify KYC
                </motion.button>
                
                <motion.button
                  className={`px-4 py-2 ${user.kycStatus === 'pending' ? 'bg-slate-400' : 'bg-yellow-600'} text-slate-50 rounded-lg flex items-center`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={user.kycStatus === 'pending'}
                  onClick={() => setConfirmAction({ type: 'kyc-pending', visible: true })}
                >
                  <Calendar size={16} className="mr-2" />
                  Mark as Pending
                </motion.button>
                
                <motion.button
                  className={`px-4 py-2 ${user.kycStatus === 'rejected' ? 'bg-slate-400' : 'bg-red-600'} text-slate-50 rounded-lg flex items-center`}
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
        <div className="fixed inset-0 bg-slate-800 bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-slate-50 rounded-lg shadow-lg p-6 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-4">Confirm Action</h3>
            {confirmAction.type === 'activate' && (
              <p className="mb-6">
                Are you sure you want to {user.isActive ? 'deactivate' : 'activate'} this user account?
                {user.isActive ? ' The user will no longer be able to access their account.' : ' The user will regain access to their account.'}
              </p>
            )}
            {confirmAction.type === 'lock' && (
              <p className="mb-6">
                Are you sure you want to {user.isLocked ? 'unlock' : 'lock'} this user account?
                {user.isLocked ? ' The user will be able to log in again.' : ' The user will be prevented from logging in.'}
              </p>
            )}
            {confirmAction.type === 'kyc-verify' && (
              <p className="mb-6">
                Are you sure you want to verify this user's KYC? This will grant them full access to all platform features.
              </p>
            )}
            {confirmAction.type === 'kyc-pending' && (
              <p className="mb-6">
                Are you sure you want to mark this user's KYC as pending? This will limit their access to some platform features.
              </p>
            )}
            {confirmAction.type === 'kyc-reject' && (
              <p className="mb-6">
                Are you sure you want to reject this user's KYC? This will significantly restrict their account functionality.
              </p>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded hover:bg-slate-300"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-slate-50 rounded hover:bg-blue-700"
                onClick={() => {
                  if (confirmAction.type === 'activate') {
                    handleActivateDeactivate();
                  } else if (confirmAction.type === 'lock') {
                    handleLockUnlock();
                  } else if (confirmAction.type === 'kyc-verify') {
                    handleKycStatusChange('verified');
                  } else if (confirmAction.type === 'kyc-pending') {
                    handleKycStatusChange('pending');
                  } else if (confirmAction.type === 'kyc-reject') {
                    handleKycStatusChange('rejected');
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