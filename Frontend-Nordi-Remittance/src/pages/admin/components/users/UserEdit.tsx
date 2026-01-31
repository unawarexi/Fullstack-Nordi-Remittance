/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { getUserById, updateUserById } from '@core/api/UserService';

const TABS = [
  { key: 'personal', label: 'Personal Details' },
  { key: 'account', label: 'Account Details' },
  { key: 'financial', label: 'Financial Info' },
  { key: 'security', label: 'Security Settings' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const UserEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) fetchUser(id);
  }, [id]);

  const fetchUser = async (userId: string) => {
    setLoading(true);
    try {
      const data = await getUserById(userId);
      setUser(data.user ? data.user : data);
      setError(null);
    } catch (e) {
      setError('Failed to load user.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setUser((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    if (!user || !id) return;
    setSaving(true);
    setError(null);
    try {
      await updateUserById(id, user);
      setSuccess(true);
      setTimeout(() => navigate(`/admin/users/${id}`), 1200);
    } catch (e) {
      setError('Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="text-red-600 text-5xl mb-4">!</div>
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => navigate('/admin/users')}
          >
            Back to User List
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.div 
      className="container mx-auto py-6 px-4 max-w-4xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="flex justify-between items-center mb-6" variants={itemVariants}>
        <div className="flex items-center">
          <button 
            className="p-2 rounded-full hover:bg-gray-100 mr-4"
            onClick={() => navigate(`/admin/users/${id}`)}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Edit User</h1>
            <p className="text-gray-500">Update user information</p>
          </div>
        </div>
        <motion.button
          className={`px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={saving}
          onClick={handleSave}
        >
          <Save size={16} className="mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <motion.div className="flex border-b border-gray-200 mb-6 overflow-x-auto" variants={itemVariants}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <motion.div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6" variants={itemVariants}>
        {activeTab === 'personal' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h3 className="text-lg font-bold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-500 mb-1">First Name</label>
                <input name="firstName" value={user.firstName || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Middle Name</label>
                <input name="middleName" value={user.middleName || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Last Name</label>
                <input name="lastName" value={user.lastName || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Date of Birth</label>
                <input name="dateOfBirth" type="date" value={user.dateOfBirth ? user.dateOfBirth.slice(0,10) : ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Gender</label>
                <select name="gender" value={user.gender || ''} onChange={handleChange} className="input input-bordered w-full">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Nationality</label>
                <input name="nationality" value={user.nationality || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Country of Residence</label>
                <input name="countryOfResidence" value={user.countryOfResidence || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Marital Status</label>
                <select name="maritalStatus" value={user.maritalStatus || ''} onChange={handleChange} className="input input-bordered w-full">
                  <option value="">Select</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email</label>
                <input name="email" value={user.email || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Mobile Number</label>
                <input name="mobileNumber" value={user.mobileNumber || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Alternative Phone</label>
                <input name="alternativePhone" value={user.alternativePhone || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
            </div>
            <h3 className="text-lg font-bold mb-4 mt-8">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Home Address</label>
                <input name="homeAddress" value={user.homeAddress || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">City</label>
                <input name="city" value={user.city || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">State/Province</label>
                <input name="stateProvince" value={user.stateProvince || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Zip/Postal Code</label>
                <input name="zipCode" value={user.zipCode || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Country</label>
                <input name="country" value={user.country || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'account' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h3 className="text-lg font-bold mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Account Type</label>
                <input name="accountType" value={user.accountType || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Account Number</label>
                <input name="accountNumber" value={user.accountNumber || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Account Name</label>
                <input name="accountName" value={user.accountName || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Currency</label>
                <input name="currency" value={user.currency || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Initial Deposit</label>
                <input name="initialDeposit" type="number" value={user.initialDeposit || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Referral Code</label>
                <input name="referralCode" value={user.referralCode || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Invite Code</label>
                <input name="inviteCode" value={user.inviteCode || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'financial' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h3 className="text-lg font-bold mb-4">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Source of Income</label>
                <input name="sourceOfIncome" value={user.sourceOfIncome || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Monthly Income Range</label>
                <input name="monthlyIncomeRange" value={user.monthlyIncomeRange || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Employment Status</label>
                <input name="employmentStatus" value={user.employmentStatus || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Employer Name</label>
                <input name="employerName" value={user.employerName || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Occupation</label>
                <input name="occupation" value={user.occupation || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Tax Identification Number</label>
                <input name="taxIdentificationNumber" value={user.taxIdentificationNumber || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Social Security Number</label>
                <input name="socialSecurityNumber" value={user.socialSecurityNumber || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
            </div>
            <h3 className="text-lg font-bold mb-4 mt-8">Bank Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Bank Name</label>
                <input name="bankName" value={user.bankName || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Bank Address</label>
                <input name="bankAddress" value={user.bankAddress || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">IBAN Number</label>
                <input name="ibanNumber" value={user.ibanNumber || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Routing Number</label>
                <input name="routingNumber" value={user.routingNumber || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">SWIFT/BIC</label>
                <input name="swiftBic" value={user.swiftBic || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h3 className="text-lg font-bold mb-4">Security Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Enable Two-Factor</label>
                <input type="checkbox" name="enableTwoFactor" checked={!!user.enableTwoFactor} onChange={handleChange} className="mr-2" />
                <span>{user.enableTwoFactor ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Two-Factor Method</label>
                <input name="twoFactorMethod" value={user.twoFactorMethod || ''} onChange={handleChange} className="input input-bordered w-full" disabled={!user.enableTwoFactor} />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Security Question</label>
                <input name="securityQuestion" value={user.securityQuestion || ''} onChange={handleChange} className="input input-bordered w-full" />
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Success Message */}
      {success && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-green-600 text-4xl mb-2">✓</div>
            <div className="font-bold mb-2">User updated successfully!</div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default UserEdit;
