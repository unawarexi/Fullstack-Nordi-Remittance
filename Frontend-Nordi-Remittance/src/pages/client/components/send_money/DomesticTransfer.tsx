/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  ArrowRight,
  User,
  Building,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  Star,
  Share2,
  Copy,
  Info,
  Printer,
  ChevronRight,
} from "lucide-react";

// Mock data for accounts and recent beneficiaries
const myAccounts = [
  { id: "1", name: "Premium Current Account", number: "****2345", balance: 5280.42, currency: "USD" },
  { id: "2", name: "Savings Account", number: "****7890", balance: 12750.18, currency: "USD" },
  { id: "3", name: "Joint Account", number: "****5432", balance: 3650.00, currency: "USD" },
];

const recentBeneficiaries = [
  { id: "1", name: "John Smith", accountNumber: "1234567890", bankName: "Chase Bank", star: true },
  { id: "2", name: "Sarah Williams", accountNumber: "0987654321", bankName: "Bank of America", star: false },
  { id: "3", name: "Michael Johnson", accountNumber: "5678901234", bankName: "Wells Fargo", star: true },
  { id: "4", name: "Emma Davis", accountNumber: "3456789012", bankName: "Citibank", star: false },
];

const transferTypes = [
  { id: "standard", name: "Standard (1-2 Business Days)", fee: 0.00 },
  { id: "same-day", name: "Same Day ACH", fee: 5.00 },
  { id: "wire", name: "Wire Transfer (Within Hours)", fee: 25.00 },
];

// Animation variants
const pageVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Transfer validation schema
const transferSchema = Yup.object().shape({
  fromAccount: Yup.string().required("Please select an account"),
  recipientType: Yup.string().required("Please select recipient type"),
  beneficiaryId: Yup.string().when("recipientType", {
    is: "existing",
    then: () => Yup.string().required("Please select a beneficiary")
  }),
  accountName: Yup.string().when("recipientType", {
    is: "new",
    then: () => Yup.string().required("Account holder name is required")
      .min(2, "Name must be at least 2 characters")
      .matches(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces")
  }),
  accountNumber: Yup.string().when("recipientType", {
    is: "new",
    then: () => Yup.string().required("Account number is required")
      .matches(/^\d+$/, "Account number can only contain digits")
      .min(8, "Account number must be at least 8 digits")
  }),
  routingNumber: Yup.string().when("recipientType", {
    is: "new",
    then: () => Yup.string().required("Routing number is required")
      .matches(/^\d{9}$/, "Routing number must be exactly 9 digits")
  }),
  bankName: Yup.string().when("recipientType", {
    is: "new",
    then: () => Yup.string().required("Bank name is required")
  }),
  amount: Yup.number()
    .required("Please enter an amount")
    .positive("Amount must be positive")
    .test("is-below-limit", "Amount exceeds daily transfer limit of $10,000", 
      (value) => value === undefined || value <= 10000)
    .test("has-two-decimals", "Amount can only have two decimal places", 
      (value) => value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())),
  transferType: Yup.string().required("Please select a transfer type"),
  transferDate: Yup.date()
    .required("Please select a transfer date")
    .min(new Date(), "Date cannot be in the past"),
  reference: Yup.string()
    .max(50, "Reference cannot exceed 50 characters"),
  saveBeneficiary: Yup.boolean(),
  agreeTos: Yup.boolean()
    .oneOf([true], "You must agree to the terms of service")
});

// Main component
const DomesticTransfer: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [showRecentBeneficiaries, setShowRecentBeneficiaries] = useState(true);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>("details");

  // Function to handle form submission
  const handleSubmit = (values: any) => {
    if (step === 1) {
      // Move to confirmation step
      setFormData(values);
      setStep(2);
      // Find the selected account
      const account = myAccounts.find(acc => acc.id === values.fromAccount);
      setSelectedAccount(account);
    } else if (step === 2) {
      // Process the transfer (simulate API call)
      setTimeout(() => {
        setTransferSuccess(true);
        setReferenceNumber(`DOM${Math.floor(Math.random() * 10000000)}`);
        setStep(3);
      }, 1500);
    }
  };

  // Function to handle back button
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  // Function to handle new transfer
  const handleNewTransfer = () => {
    setStep(1);
    setFormData(null);
    setTransferSuccess(false);
    setReferenceNumber("");
  };

  // Function to toggle section expansion
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Find selected recipient for confirmation screen
  const getSelectedBeneficiary = () => {
    if (formData?.recipientType === "existing") {
      return recentBeneficiaries.find(ben => ben.id === formData.beneficiaryId);
    }
    return null;
  };

  // Find selected transfer type for confirmation screen
  const getSelectedTransferType = () => {
    return transferTypes.find(type => type.id === formData?.transferType);
  };

  return (
    <motion.div 
      className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 min-h-screen"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-indigo-900 dark:text-white">Domestic Transfer</h1>
          <p className="text-purple-600">Send money to accounts within the United States</p>
        </div>
        
        {/* Progress steps */}
        <div className="flex items-center mb-8">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600 dark:text-gray-400'}`}>
            1
          </div>
          <div className={`h-1 flex-1 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600 dark:text-gray-400'}`}>
            2
          </div>
          <div className={`h-1 flex-1 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600 dark:text-gray-400'}`}>
            3
          </div>
        </div>
        
        {/* Main content based on step */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
            >
              <h2 className="text-lg font-semibold text-indigo-900 mb-4">Transfer Details</h2>
              
              <Formik
                initialValues={{
                  fromAccount: "",
                  recipientType: "existing",
                  beneficiaryId: "",
                  accountName: "",
                  accountNumber: "",
                  routingNumber: "",
                  bankName: "",
                  amount: "",
                  transferType: "standard",
                  transferDate: new Date().toISOString().split("T")[0],
                  reference: "",
                  saveBeneficiary: false,
                  agreeTos: false
                }}
                validationSchema={transferSchema}
                onSubmit={handleSubmit}
              >
                {({ values, errors, touched, setFieldValue, isValid, dirty }) => (
                  <Form className="space-y-6">
                    {/* From Account Section */}
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h3 className="font-medium text-indigo-800 mb-3">From Account</h3>
                      <div className="space-y-3">
                        {myAccounts.map(account => (
                          <motion.div
                            key={account.id}
                            whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(79, 70, 229, 0.1)" }}
                            whileTap={{ scale: 0.98 }}
                            className={`bg-white rounded-lg p-3 cursor-pointer border ${values.fromAccount === account.id ? 'border-indigo-600' : 'border-transparent'}`}
                            onClick={() => setFieldValue("fromAccount", account.id)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className={`w-4 h-4 rounded-full ${values.fromAccount === account.id ? 'bg-indigo-600' : 'border border-gray-400'}`}></div>
                                <div className="ml-3">
                                  <div className="font-medium text-gray-900 dark:text-white">{account.name}</div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">{account.number}</div>
                                </div>
                              </div>
                              <div className="font-semibold text-indigo-900 dark:text-white">${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                          </motion.div>
                        ))}
                        {touched.fromAccount && errors.fromAccount && (
                          <div className="text-red-500 text-sm mt-1">{errors.fromAccount}</div>
                        )}
                      </div>
                    </div>
                    
                    {/* To Account Section */}
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-medium text-purple-800 mb-3">To Account</h3>
                      
                      {/* Recipient Type Selection */}
                      <div className="flex mb-4 bg-white rounded-lg p-1">
                        <motion.button
                          type="button"
                          className={`flex-1 py-2 px-4 rounded-lg font-medium ${values.recipientType === 'existing' ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFieldValue("recipientType", "existing")}
                        >
                          Existing Recipient
                        </motion.button>
                        <motion.button
                          type="button"
                          className={`flex-1 py-2 px-4 rounded-lg font-medium ${values.recipientType === 'new' ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFieldValue("recipientType", "new")}
                        >
                          New Recipient
                        </motion.button>
                      </div>
                      
                      {/* Existing Recipient */}
                      {values.recipientType === "existing" && (
                        <motion.div
                          variants={fadeInUp}
                          initial="initial"
                          animate="animate"
                          className="space-y-4"
                        >
                          {/* Search and Toggle */}
                          <div className="flex justify-between items-center">
                            <div className="relative flex-1 mr-3">
                              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                              <input 
                                type="text" 
                                placeholder="Search recipients" 
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <motion.button
                              type="button"
                              className="flex items-center px-3 py-2 bg-white rounded-lg border border-gray-300 text-sm font-medium"
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setShowRecentBeneficiaries(!showRecentBeneficiaries)}
                            >
                              {showRecentBeneficiaries ? (
                                <>Recent <ChevronUp size={14} className="ml-1" /></>
                              ) : (
                                <>Recent <ChevronDown size={14} className="ml-1" /></>
                              )}
                            </motion.button>
                          </div>
                          
                          {/* Beneficiaries List */}
                          <AnimatePresence>
                            {showRecentBeneficiaries && (
                              <motion.div
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="space-y-2"
                              >
                                {recentBeneficiaries.map(beneficiary => (
                                  <motion.div
                                    key={beneficiary.id}
                                    variants={fadeInUp}
                                    whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(79, 70, 229, 0.1)" }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`bg-white rounded-lg p-3 cursor-pointer border ${values.beneficiaryId === beneficiary.id ? 'border-indigo-600' : 'border-transparent'}`}
                                    onClick={() => setFieldValue("beneficiaryId", beneficiary.id)}
                                  >
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center">
                                        <div className={`w-4 h-4 rounded-full ${values.beneficiaryId === beneficiary.id ? 'bg-indigo-600' : 'border border-gray-400'}`}></div>
                                        <div className="ml-3">
                                          <div className="flex items-center">
                                            <div className="font-medium text-gray-900 dark:text-white">{beneficiary.name}</div>
                                            {beneficiary.star && <Star size={14} className="ml-2 text-amber-500 fill-amber-500" />}
                                          </div>
                                          <div className="text-sm text-gray-600 dark:text-gray-400">{beneficiary.bankName} - {beneficiary.accountNumber}</div>
                                        </div>
                                      </div>
                                      <Share2 size={16} className="text-indigo-600" />
                                    </div>
                                  </motion.div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                          
                          {touched.beneficiaryId && errors.beneficiaryId && (
                            <div className="text-red-500 text-sm mt-1">{errors.beneficiaryId}</div>
                          )}
                        </motion.div>
                      )}
                      
                      {/* New Recipient */}
                      {values.recipientType === "new" && (
                        <motion.div
                          variants={fadeInUp}
                          initial="initial"
                          animate="animate"
                          className="space-y-4 bg-white p-4 rounded-lg"
                        >
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                            <div className="relative">
                              <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                              <Field 
                                name="accountName" 
                                type="text" 
                                placeholder="Full name of the account holder"
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <ErrorMessage name="accountName" component="div" className="text-red-500 text-sm mt-1" />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                            <div className="relative">
                              <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                              <Field 
                                name="accountNumber" 
                                type="text" 
                                placeholder="Enter account number"
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <ErrorMessage name="accountNumber" component="div" className="text-red-500 text-sm mt-1" />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Routing Number</label>
                            <div className="relative">
                              <Building size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                              <Field 
                                name="routingNumber" 
                                type="text" 
                                placeholder="9-digit routing number"
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <ErrorMessage name="routingNumber" component="div" className="text-red-500 text-sm mt-1" />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                            <div className="relative">
                              <Building size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                              <Field 
                                name="bankName" 
                                type="text" 
                                placeholder="Enter bank name"
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <ErrorMessage name="bankName" component="div" className="text-red-500 text-sm mt-1" />
                          </div>
                          
                          <div className="flex items-center mt-3">
                            <Field 
                              type="checkbox"
                              name="saveBeneficiary"
                              id="saveBeneficiary"
                              className="h-4 w-4 text-indigo-600 rounded"
                            />
                            <label htmlFor="saveBeneficiary" className="ml-2 text-sm text-gray-700">
                              Save this recipient for future transfers
                            </label>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Transfer Details */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-medium text-blue-800 mb-3">Transfer Details</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                          <div className="relative">
                            <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Field 
                              name="amount" 
                              type="text" 
                              placeholder="0.00"
                              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Daily limit: $10,000.00</span>
                            <span>Available: {selectedAccount ? `$${selectedAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'}</span>
                          </div>
                          <ErrorMessage name="amount" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Type</label>
                          <div className="space-y-2">
                            {transferTypes.map(type => (
                              <motion.div
                                key={type.id}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className={`bg-white rounded-lg p-3 cursor-pointer border ${values.transferType === type.id ? 'border-indigo-600' : 'border-transparent'}`}
                                onClick={() => setFieldValue("transferType", type.id)}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <div className={`w-4 h-4 rounded-full ${values.transferType === type.id ? 'bg-indigo-600' : 'border border-gray-400'}`}></div>
                                    <div className="ml-3">
                                      <div className="font-medium text-gray-900 dark:text-white">{type.name}</div>
                                    </div>
                                  </div>
                                  <div className="font-medium text-indigo-600">
                                    {type.fee === 0 ? 'Free' : `$${type.fee.toFixed(2)}`}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                          <ErrorMessage name="transferType" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Date</label>
                          <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Field 
                              name="transferDate" 
                              type="date" 
                              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <ErrorMessage name="transferDate" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Reference (Optional)</label>
                          <div className="relative">
                            <FileText size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Field 
                              as="textarea"
                              name="reference" 
                              placeholder="Add a note for this transfer"
                              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20"
                            />
                          </div>
                          <ErrorMessage name="reference" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Terms and Conditions */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start">
                        <Field 
                          type="checkbox"
                          name="agreeTos"
                          id="agreeTos"
                          className="h-4 w-4 mt-1 text-indigo-600 rounded"
                        />
                        <label htmlFor="agreeTos" className="ml-2 text-sm text-gray-700">
                          I understand and agree to the Domestic Transfer <span className="text-indigo-600 font-medium">Terms of Service</span> and 
                          <span className="text-indigo-600 font-medium"> Privacy Policy</span>.
                        </label>
                      </div>
                      <ErrorMessage name="agreeTos" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end">
                      <motion.button
                        type="submit"
                        className={`px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r ${isValid && dirty ? 'from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' : 'from-gray-400 to-gray-500 cursor-not-allowed'}`}
                        whileHover={isValid && dirty ? { y: -2 } : {}}
                        whileTap={isValid && dirty ? { scale: 0.98 } : {}}
                        disabled={!isValid || !dirty}
                      >
                        Continue <ArrowRight size={16} className="inline ml-2" />
                      </motion.button>
                    </div>
                  </Form>
                )}
              </Formik>
            </motion.div>
          )}
          
          {step === 2 && (
            <motion.div
              key="step2"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
            >
              <h2 className="text-lg font-semibold text-indigo-900 mb-4">Confirm Your Transfer</h2>
              
              <div className="mb-6 bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-indigo-800 font-medium">Transfer Amount</div>
                  <div className="text-xl font-bold text-indigo-900 dark:text-white">${parseFloat(formData.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600 dark:text-gray-400">Fee</div>
                  <div className="text-gray-800 font-medium">
                    ${getSelectedTransferType()?.fee.toFixed(2)}
                  </div>
                </div>
                
                <div className="mt-4 pt-2 border-t border-indigo-200 flex items-center justify-between">
                  <div className="text-sm font-medium text-indigo-800">Total</div>
                  <div className="text-lg font-bold text-indigo-900 dark:text-white">
                    ${(parseFloat(formData.amount) + (getSelectedTransferType()?.fee || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Collapsible Sections */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Transfer Details Section */}
                  <div
                    className="cursor-pointer bg-white hover:bg-indigo-50 transition-colors"
                    onClick={() => toggleSection("details")}
                  >
                    <div className="flex items-center justify-between p-4">
                      <div className="font-medium text-indigo-900 dark:text-white">Transfer Details</div>
                      {expandedSection === "details" ? (
                        <ChevronUp size={18} className="text-indigo-600" />
                      ) : (
                        <ChevronDown size={18} className="text-indigo-600" />
                      )}
                    </div>
                  </div>
                  
                  {expandedSection === "details" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-indigo-50 p-4"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Transfer Type</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{getSelectedTransferType()?.name}</div>
                        </div>
                        <div className="flex justify-between">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Transfer Date</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(formData.transferDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Reference</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formData.reference || "No reference provided"}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* From Account Section */}
                  <div
                    className="cursor-pointer bg-white hover:bg-indigo-50 transition-colors border-t border-gray-200"
                    onClick={() => toggleSection("from")}
                  >
                    <div className="flex items-center justify-between p-4">
                      <div className="font-medium text-indigo-900 dark:text-white">From Account</div>
                      {expandedSection === "from" ? (
                        <ChevronUp size={18} className="text-indigo-600" />
                      ) : (
                        <ChevronDown size={18} className="text-indigo-600" />
                      )}
                    </div>
                  </div>
                  
                  {expandedSection === "from" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-indigo-50 p-4"
                    >
                      <div className="bg-white p-3 rounded-lg">
                        <div className="font-medium text-gray-900 dark:text-white">{selectedAccount?.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{selectedAccount?.number}</div>
                        <div className="font-semibold text-indigo-900 dark:text-white">${selectedAccount?.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* To Account Section */}
                  <div
                    className="cursor-pointer bg-white hover:bg-indigo-50 transition-colors border-t border-gray-200"
                    onClick={() => toggleSection("to")}
                  >
                    <div className="flex items-center justify-between p-4">
                      <div className="font-medium text-indigo-900 dark:text-white">To Account</div>
                      {expandedSection === "to" ? (
                        <ChevronUp size={18} className="text-indigo-600" />
                      ) : (
                        <ChevronDown size={18} className="text-indigo-600" />
                      )}
                    </div>
                  </div>
                  
                  {expandedSection === "to" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-indigo-50 p-4"
                    >
                      {formData.recipientType === "existing" ? (
                        <div className="bg-white p-3 rounded-lg">
                          <div className="font-medium text-gray-900 dark:text-white">{getSelectedBeneficiary()?.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{getSelectedBeneficiary()?.bankName}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Account: {getSelectedBeneficiary()?.accountNumber}</div>
                        </div>
                      ) : (
                        <div className="bg-white p-3 rounded-lg">
                          <div className="font-medium text-gray-900 dark:text-white">{formData.accountName}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{formData.bankName}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Account: {formData.accountNumber}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Routing: {formData.routingNumber}</div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
                
                {/* Security Note */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex">
                  <AlertCircle size={20} className="text-amber-500 shrink-0 mt-1" />
                  <div className="ml-3 text-sm text-amber-800">
                    <p className="font-medium">Security Notice</p>
                    <p className="mt-1">We will never ask for your PIN or full password. Verify that you are sending money to a trusted recipient. Bank transfers cannot be canceled once processed.</p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-between mt-6">
                  <motion.button
                    type="button"
                    className="px-6 py-3 rounded-lg font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBack}
                  >
                    Back
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    className="px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSubmit(formData)}
                  >
                    Confirm Transfer <ArrowRight size={16} className="inline ml-2" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
          
          {step === 3 && (
            <motion.div
              key="step3"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4"
                >
                  <CheckCircle size={40} className="text-green-600" />
                </motion.div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Transfer Successful!</h2>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Your money is on its way! You'll receive a confirmation email with the transaction details.
                </p>
              </div>
              
              <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm text-indigo-800 font-medium">Transfer Amount</div>
                  <div className="text-lg font-bold text-indigo-900 dark:text-white">${parseFloat(formData.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-indigo-800 font-medium">Reference Number</div>
                  <div className="text-sm font-medium text-indigo-900 flex items-center">
                    {referenceNumber}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="ml-2 text-indigo-600"
                      onClick={() => navigator.clipboard.writeText(referenceNumber)}
                    >
                      <Copy size={14} />
                    </motion.button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <Clock size={18} className="text-indigo-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Estimated Arrival</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {getSelectedTransferType()?.id === "standard" 
                          ? "1-2 business days" 
                          : getSelectedTransferType()?.id === "same-day" 
                          ? "Today by 5:00 PM" 
                          : "Within 3 hours"}
                      </div>
                    </div>
                  </div>
                  <Info size={16} className="text-indigo-600" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <RefreshCw size={18} className="text-indigo-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Status Updates</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        You'll receive notifications about this transfer
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-indigo-600" />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 rounded-lg font-medium text-indigo-700 bg-indigo-100 flex items-center justify-center"
                >
                  <Printer size={16} className="mr-2" /> Save Receipt
                </motion.button>
                
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 rounded-lg font-medium text-indigo-700 bg-indigo-100 flex items-center justify-center"
                >
                  <Share2 size={16} className="mr-2" /> Share Details
                </motion.button>
              </div>
              
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNewTransfer}
                className="w-full px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Make Another Transfer
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DomesticTransfer;