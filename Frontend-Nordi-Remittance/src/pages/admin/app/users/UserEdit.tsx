/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { useUserDetail } from '../../domain/useUserDetail';
import useThemeStore from '@store/theme.store';
import { Input, Select, Card, CardContent, Button, Modal } from '@components/ui';
import { Spinner } from '@components/ui';

const TABS = [
  { key: 'personal', label: 'Personal Details' },
  { key: 'account', label: 'Account Details' },
  { key: 'financial', label: 'Financial Info' },
  { key: 'security', label: 'Security Settings' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const MARITAL_STATUS_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
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
  const { isDarkMode } = useThemeStore();
  const { user: fetchedUser, isLoading, updateUser, isUpdating } = useUserDetail(id || '');
  const [formData, setFormData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (fetchedUser && !formData) {
      setFormData({ ...fetchedUser });
    }
  }, [fetchedUser, formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData || !id) return;
    updateUser(formData);
    setSuccess(true);
    setTimeout(() => navigate(`/admin/users/${id}`), 1200);
  };

  const user = formData;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <Spinner size="lg" variant="primary" label="Loading user..." />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <Card variant="elevated" size="lg" className="max-w-md text-center">
          <CardContent>
            <div className="text-error-500 text-5xl mb-4">!</div>
            <h2 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">User Not Found</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">Could not load user details.</p>
            <Button variant="primary" onClick={() => navigate('/admin/users/all')}>
              Back to User List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 mr-4 text-neutral-700 dark:text-neutral-300"
            onClick={() => navigate(`/admin/users/${id}`)}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Edit User</h1>
            <p className="text-neutral-500 dark:text-neutral-400">Update user information</p>
          </div>
        </div>
        <Button
          variant="primary"
          leftIcon={<Save size={16} />}
          isLoading={isUpdating}
          onClick={handleSave}
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </Button>
      </motion.div>

      {/* Tabs */}
      <motion.div className="flex border-b border-neutral-200 dark:border-neutral-700 mb-6 overflow-x-auto" variants={itemVariants}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-primary-500 text-primary-500' : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <Card variant="elevated" size="lg" className="mb-6">
        <CardContent>
        {activeTab === 'personal' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="First Name" name="firstName" value={user.firstName || ''} onChange={handleChange} />
              <Input label="Middle Name" name="middleName" value={user.middleName || ''} onChange={handleChange} />
              <Input label="Last Name" name="lastName" value={user.lastName || ''} onChange={handleChange} />
              <Input label="Date of Birth" name="dateOfBirth" type="date" value={user.dateOfBirth ? user.dateOfBirth.slice(0,10) : ''} onChange={handleChange} />
              <Select label="Gender" options={GENDER_OPTIONS} value={user.gender || ''} onChange={handleSelectChange('gender')} />
              <Input label="Nationality" name="nationality" value={user.nationality || ''} onChange={handleChange} />
              <Input label="Country of Residence" name="countryOfResidence" value={user.countryOfResidence || ''} onChange={handleChange} />
              <Select label="Marital Status" options={MARITAL_STATUS_OPTIONS} value={user.maritalStatus || ''} onChange={handleSelectChange('maritalStatus')} />
              <Input label="Email" name="email" value={user.email || ''} onChange={handleChange} />
              <Input label="Mobile Number" name="mobileNumber" value={user.mobileNumber || ''} onChange={handleChange} />
              <Input label="Alternative Phone" name="alternativePhone" value={user.alternativePhone || ''} onChange={handleChange} />
            </div>
            <h3 className="text-lg font-bold mb-4 mt-8 text-neutral-900 dark:text-white">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Home Address" name="homeAddress" value={user.homeAddress || ''} onChange={handleChange} />
              <Input label="City" name="city" value={user.city || ''} onChange={handleChange} />
              <Input label="State/Province" name="stateProvince" value={user.stateProvince || ''} onChange={handleChange} />
              <Input label="Zip/Postal Code" name="zipCode" value={user.zipCode || ''} onChange={handleChange} />
              <Input label="Country" name="country" value={user.country || ''} onChange={handleChange} />
            </div>
          </motion.div>
        )}

        {activeTab === 'account' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Account Type" name="accountType" value={user.accountType || ''} onChange={handleChange} />
              <Input label="Account Number" name="accountNumber" value={user.accountNumber || ''} onChange={handleChange} />
              <Input label="Account Name" name="accountName" value={user.accountName || ''} onChange={handleChange} />
              <Input label="Currency" name="currency" value={user.currency || ''} onChange={handleChange} />
              <Input label="Initial Deposit" name="initialDeposit" type="number" value={user.initialDeposit || ''} onChange={handleChange} />
              <Input label="Referral Code" name="referralCode" value={user.referralCode || ''} onChange={handleChange} />
              <Input label="Invite Code" name="inviteCode" value={user.inviteCode || ''} onChange={handleChange} />
            </div>
          </motion.div>
        )}

        {activeTab === 'financial' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Source of Income" name="sourceOfIncome" value={user.sourceOfIncome || ''} onChange={handleChange} />
              <Input label="Monthly Income Range" name="monthlyIncomeRange" value={user.monthlyIncomeRange || ''} onChange={handleChange} />
              <Input label="Employment Status" name="employmentStatus" value={user.employmentStatus || ''} onChange={handleChange} />
              <Input label="Employer Name" name="employerName" value={user.employerName || ''} onChange={handleChange} />
              <Input label="Occupation" name="occupation" value={user.occupation || ''} onChange={handleChange} />
              <Input label="Tax Identification Number" name="taxIdentificationNumber" value={user.taxIdentificationNumber || ''} onChange={handleChange} />
              <Input label="Social Security Number" name="socialSecurityNumber" value={user.socialSecurityNumber || ''} onChange={handleChange} />
            </div>
            <h3 className="text-lg font-bold mb-4 mt-8 text-neutral-900 dark:text-white">Bank Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Bank Name" name="bankName" value={user.bankName || ''} onChange={handleChange} />
              <Input label="Bank Address" name="bankAddress" value={user.bankAddress || ''} onChange={handleChange} />
              <Input label="IBAN Number" name="ibanNumber" value={user.ibanNumber || ''} onChange={handleChange} />
              <Input label="Routing Number" name="routingNumber" value={user.routingNumber || ''} onChange={handleChange} />
              <Input label="SWIFT/BIC" name="swiftBic" value={user.swiftBic || ''} onChange={handleChange} />
            </div>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Security Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Enable Two-Factor</label>
                <div className="flex items-center h-10">
                  <input type="checkbox" name="enableTwoFactor" checked={!!user.enableTwoFactor} onChange={handleChange} className="mr-2 h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 text-primary-500 focus:ring-primary-500" />
                  <span className="text-neutral-700 dark:text-neutral-300">{user.enableTwoFactor ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
              <Input label="Two-Factor Method" name="twoFactorMethod" value={user.twoFactorMethod || ''} onChange={handleChange} disabled={!user.enableTwoFactor} />
              <Input label="Security Question" name="securityQuestion" value={user.securityQuestion || ''} onChange={handleChange} />
            </div>
          </motion.div>
        )}
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Modal isOpen={success} onClose={() => setSuccess(false)} size="sm" showCloseButton={false}>
        <div className="p-6 text-center">
          <div className="text-success-500 text-4xl mb-2">✓</div>
          <div className="font-bold mb-2 text-neutral-900 dark:text-white">User updated successfully!</div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default UserEdit;
