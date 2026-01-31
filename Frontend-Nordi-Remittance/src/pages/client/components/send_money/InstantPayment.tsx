/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Send,
  
  Check,
 
  User,
  CreditCard,
  DollarSign,
  FileText,
  Clock,
  Zap,
  ArrowRight,
  HelpCircle,
  Star,
  Repeat,
 Lock,
  X,
  Loader,
} from "lucide-react";

// Mock data for recent recipients
const recentRecipients = [
  { id: 1, name: "John Smith", accountNumber: "****4382", bankName: "Chase", avatar: "JS" },
  { id: 2, name: "Emma Watson", accountNumber: "****5291", bankName: "Wells Fargo", avatar: "EW" },
  { id: 3, name: "Michael Johnson", accountNumber: "****3764", bankName: "Bank of America", avatar: "MJ" },
  { id: 4, name: "Sarah Davis", accountNumber: "****9231", bankName: "Citibank", avatar: "SD" },
];

// Mock data for transaction limits
const limits = {
  instant: {
    perTransaction: 5000,
    daily: 10000,
    remaining: 8500,
  }
};

// Validation schema using Yup
const InstantPaymentSchema = Yup.object().shape({
  recipientName: Yup.string()
    .required("Recipient name is required"),
  accountNumber: Yup.string()
    .required("Account number is required")
    .matches(/^\d{10,12}$/, "Account number must be 10-12 digits"),
  bankName: Yup.string()
    .required("Bank name is required"),
  amount: Yup.number()
    .required("Amount is required")
    .positive("Amount must be positive")
    .max(limits.instant.perTransaction, `Maximum per transaction is $${limits.instant.perTransaction}`)
    .test(
      "daily-limit",
      `Daily limit of $${limits.instant.daily} will be exceeded`,
      function(value) {
        return value <= limits.instant.remaining;
      }
    ),
  description: Yup.string()
    .max(100, "Description cannot exceed 100 characters"),
  securityCode: Yup.string()
    .required("Security code is required")
    .matches(/^\d{6}$/, "Security code must be 6 digits"),
});

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const cardVariants = {
  initial: { opacity: 0, y: 10, scale: 0.95 },
  in: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    y: -5,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transition: { type: "spring", stiffness: 300, damping: 15 }
  },
  tap: { scale: 0.98 }
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const InstantPayment: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  
  // Generate a random transaction ID
  useEffect(() => {
    const generateTransactionId = () => {
      return `TXN${Math.floor(100000000 + Math.random() * 900000000)}`;
    };
    
    setTransactionId(generateTransactionId());
  }, [transferSuccess]);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    setLoading(true);
    
    // Simulate API call for processing payment
    setTimeout(() => {
      setLoading(false);
      setSubmitting(false);
      setStep(2);
      setTransferSuccess(true);
    }, 2000);
  };

  const handleSelectRecipient = (recipient: any) => {
    setSelectedRecipient(recipient);
  };

  const resetForm = () => {
    setStep(1);
    setTransferSuccess(false);
    setSelectedRecipient(null);
  };

  return (
    <motion.div
      className="p-6 max-w-4xl mx-auto bg-white rounded-2xl shadow-sm"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-indigo-900">Instant Payment</h1>
          <p className="text-sm text-purple-500">Transfer funds instantly to any account</p>
        </div>
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 flex items-center justify-center text-white">
            <Zap size={20} />
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <motion.div 
            className={`flex flex-col items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}
            animate={{ scale: step === 1 ? 1.05 : 1 }}
          >
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
              <Send size={18} />
            </div>
            <span className="text-xs mt-1">Details</span>
          </motion.div>
          
          <motion.div 
            className="flex-1 h-1 mx-2"
            initial={{ backgroundColor: "#E2E8F0" }}
            animate={{ backgroundColor: step >= 2 ? "#818CF8" : "#E2E8F0" }}
          />
          
          <motion.div 
            className={`flex flex-col items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}
            animate={{ scale: step === 2 ? 1.05 : 1 }}
          >
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
              <Check size={18} />
            </div>
            <span className="text-xs mt-1">Confirmation</span>
          </motion.div>
        </div>
      </div>

      {/* Content based on step */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
          >
            {/* Recent Recipients */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-indigo-900 mb-3">Recent Recipients</h2>
              <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-indigo-200">
                {recentRecipients.map((recipient) => (
                  <motion.div
                    key={recipient.id}
                    className={`flex flex-col items-center p-3 rounded-xl cursor-pointer min-w-[100px] ${
                      selectedRecipient?.id === recipient.id ? 'bg-indigo-100 border-2 border-indigo-300' : 'bg-gray-50'
                    }`}
                    variants={cardVariants}
                    initial="initial"
                    animate="in"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => handleSelectRecipient(recipient)}
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center text-white font-medium mb-2">
                      {recipient.avatar}
                    </div>
                    <div className="text-xs font-medium text-center">{recipient.name}</div>
                    <div className="text-xs text-gray-500">{recipient.accountNumber}</div>
                  </motion.div>
                ))}
                <motion.div
                  className="flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer min-w-[100px] bg-gray-50"
                  variants={cardVariants}
                  initial="initial"
                  animate="in"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mb-2">
                    <User size={18} />
                  </div>
                  <div className="text-xs font-medium">New Recipient</div>
                </motion.div>
              </div>
            </div>

            {/* Transfer limits info */}
            <div className="bg-indigo-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Clock size={16} className="text-indigo-600 mr-2" />
                  <span className="text-sm font-medium text-indigo-800">Instant Transfer Limits</span>
                </div>
                <HelpCircle size={16} className="text-indigo-400" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-indigo-500 mb-1">Per Transaction</div>
                  <div className="text-sm font-semibold text-indigo-900">${limits.instant.perTransaction.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-indigo-500 mb-1">Daily Limit</div>
                  <div className="text-sm font-semibold text-indigo-900">${limits.instant.daily.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-indigo-500 mb-1">Remaining Today</div>
                  <div className="text-sm font-semibold text-indigo-900">${limits.instant.remaining.toLocaleString()}</div>
                </div>
              </div>
            </div>
            
            {/* Payment Form */}
            <Formik
              initialValues={{
                recipientName: selectedRecipient?.name || "",
                accountNumber: selectedRecipient?.accountNumber?.replace(/\*+/g, "") || "",
                bankName: selectedRecipient?.bankName || "",
                amount: "",
                description: "",
                securityCode: "",
              }}
              validationSchema={InstantPaymentSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting, errors, touched, values }) => (
                <Form className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label htmlFor="recipientName" className="block text-sm font-medium text-indigo-900">
                        Recipient Name
                      </label>
                      <div className="relative">
                        <Field
                          type="text"
                          name="recipientName"
                          id="recipientName"
                          className={`
                            mt-1 block w-full pl-10 pr-3 py-2 text-base border-gray-300 
                            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                            sm:text-sm rounded-lg ${errors.recipientName && touched.recipientName ? 'border-red-300' : ''}
                          `}
                          placeholder="Enter recipient name"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={16} className="text-indigo-500" />
                        </div>
                        <ErrorMessage name="recipientName" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="accountNumber" className="block text-sm font-medium text-indigo-900">
                        Account Number
                      </label>
                      <div className="relative">
                        <Field
                          type="text"
                          name="accountNumber"
                          id="accountNumber"
                          className={`
                            mt-1 block w-full pl-10 pr-3 py-2 text-base border-gray-300 
                            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                            sm:text-sm rounded-lg ${errors.accountNumber && touched.accountNumber ? 'border-red-300' : ''}
                          `}
                          placeholder="Enter account number"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CreditCard size={16} className="text-indigo-500" />
                        </div>
                        <ErrorMessage name="accountNumber" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="bankName" className="block text-sm font-medium text-indigo-900">
                        Bank Name
                      </label>
                      <div className="relative">
                        <Field
                          type="text"
                          name="bankName"
                          id="bankName"
                          className={`
                            mt-1 block w-full pl-10 pr-3 py-2 text-base border-gray-300 
                            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                            sm:text-sm rounded-lg ${errors.bankName && touched.bankName ? 'border-red-300' : ''}
                          `}
                          placeholder="Enter bank name"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileText size={16} className="text-indigo-500" />
                        </div>
                        <ErrorMessage name="bankName" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="amount" className="block text-sm font-medium text-indigo-900">
                        Amount
                      </label>
                      <div className="relative">
                        <Field
                          type="number"
                          name="amount"
                          id="amount"
                          className={`
                            mt-1 block w-full pl-10 pr-3 py-2 text-base border-gray-300 
                            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                            sm:text-sm rounded-lg ${errors.amount && touched.amount ? 'border-red-300' : ''}
                          `}
                          placeholder="Enter amount"
                          step="0.01"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign size={16} className="text-indigo-500" />
                        </div>
                        <ErrorMessage name="amount" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="description" className="block text-sm font-medium text-indigo-900">
                        Description (Optional)
                      </label>
                      <div className="relative">
                        <Field
                          type="text"
                          name="description"
                          id="description"
                          className={`
                            mt-1 block w-full pl-10 pr-3 py-2 text-base border-gray-300 
                            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                            sm:text-sm rounded-lg ${errors.description && touched.description ? 'border-red-300' : ''}
                          `}
                          placeholder="Enter payment description"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileText size={16} className="text-indigo-500" />
                        </div>
                        <ErrorMessage name="description" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="securityCode" className="block text-sm font-medium text-indigo-900">
                        Security Code
                      </label>
                      <div className="relative">
                        <Field
                          type="password"
                          name="securityCode"
                          id="securityCode"
                          className={`
                            mt-1 block w-full pl-10 pr-3 py-2 text-base border-gray-300 
                            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                            sm:text-sm rounded-lg ${errors.securityCode && touched.securityCode ? 'border-red-300' : ''}
                          `}
                          placeholder="Enter 6-digit security code"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock size={16} className="text-indigo-500" />
                        </div>
                        <ErrorMessage name="securityCode" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        You can find your security code in the mobile app or SMS
                      </p>
                    </div>
                  </div>

                  {/* Fees and estimated time */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Transaction Fee</span>
                      <span className="text-sm font-medium text-indigo-900">$0.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Estimated Arrival Time</span>
                      <span className="text-sm font-medium text-green-600">Instant</span>
                    </div>
                  </div>

                  {/* Submit button */}
                  <div className="flex justify-end">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className={`
                        flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 
                        text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all
                        ${isSubmitting ? 'opacity-70' : ''}
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting || loading ? (
                        <>
                          <Loader size={18} className="animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Send Payment
                          <ArrowRight size={18} className="ml-2" />
                        </>
                      )}
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
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            className="max-w-lg mx-auto"
          >
            {transferSuccess ? (
              <motion.div 
                className="text-center"
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                >
                  <Check size={40} />
                </motion.div>
                
                <motion.h2 
                  className="text-2xl font-bold text-indigo-900 mb-2"
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                >
                  Payment Successful!
                </motion.h2>
                
                <motion.p 
                  className="text-gray-500 mb-8"
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                >
                  Your funds have been sent instantly and should arrive in the recipient's account immediately.
                </motion.p>
                
                <motion.div 
                  className="bg-gray-50 rounded-xl p-6 mb-8"
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Transaction ID</span>
                      <span className="text-sm font-medium text-indigo-900">{transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Recipient</span>
                      <span className="text-sm font-medium text-indigo-900">John Smith</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Amount</span>
                      <span className="text-sm font-medium text-indigo-900">$1,500.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Fee</span>
                      <span className="text-sm font-medium text-indigo-900">$0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Date & Time</span>
                      <span className="text-sm font-medium text-indigo-900">{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status</span>
                      <span className="text-sm font-medium text-green-600">Completed</span>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex space-x-4 justify-center"
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                >
                  <motion.button
                    onClick={resetForm}
                    className="px-6 py-2 border border-indigo-300 text-indigo-600 rounded-lg flex items-center"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(79, 70, 229, 0.05)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Repeat size={16} className="mr-2" />
                    New Payment
                  </motion.button>
                  
                  <motion.button
                    className="px-6 py-2 border border-indigo-300 text-indigo-600 rounded-lg flex items-center"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(79, 70, 229, 0.05)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FileText size={16} className="mr-2" />
                    Download Receipt
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : (
              <div className="text-center">
                <motion.div
                  className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                >
                  <X size={40} />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-indigo-900 mb-2">Payment Failed</h2>
                <p className="text-gray-500 mb-6">
                  We couldn't process your payment. Please try again or contact support.
                </p>
                
                <div className="flex space-x-4 justify-center">
                  <motion.button
                    onClick={() => setStep(1)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowRight size={16} className="mr-2" />
                    Try Again
                  </motion.button>
                  
                  <motion.button
                    className="px-6 py-2 border border-indigo-300 text-indigo-600 rounded-lg flex items-center"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(79, 70, 229, 0.05)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <HelpCircle size={16} className="mr-2" />
                    Get Help
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Support and Help */}
      <div className="mt-12 pt-6 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Need help? <span className="text-indigo-600 cursor-pointer">Contact Support</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-500">Rate this service</div>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={16} 
                  className="text-indigo-200 cursor-pointer hover:text-indigo-400"
                  fill="currentColor"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InstantPayment;