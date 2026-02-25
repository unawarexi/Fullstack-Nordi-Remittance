/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Zap,
  Search,
  ChevronRight,
  User,
  Phone,
  Mail,
  DollarSign,
  FileText,
  Clock,
  Check,
  X,
  Loader,
  AlertCircle,
  ArrowRight,
  Lock,
  Star,
  Heart,
  ChevronDown,
  BanknoteIcon,
  Calendar,
  Repeat,
  HelpCircle,
} from "lucide-react";

// Mock data for contacts
const contacts = [
  { id: 1, name: "John Smith", type: "phone", value: "+1 (555) 123-4567", avatar: "JS", recent: true },
  { id: 2, name: "Emma Wilson", type: "email", value: "emma.w@example.com", avatar: "EW", recent: true },
  { id: 3, name: "Michael Johnson", type: "phone", value: "+1 (555) 987-6543", avatar: "MJ", recent: true },
  { id: 4, name: "Sarah Davis", type: "email", value: "sarah.d@example.com", avatar: "SD", recent: false },
  { id: 5, name: "Robert Taylor", type: "phone", value: "+1 (555) 234-5678", avatar: "RT", recent: false },
  { id: 6, name: "Lisa Brown", type: "email", value: "lisa.b@example.com", avatar: "LB", recent: false },
  { id: 7, name: "David Wilson", type: "phone", value: "+1 (555) 345-6789", avatar: "DW", recent: false },
  { id: 8, name: "Jennifer Lopez", type: "email", value: "jennifer.l@example.com", avatar: "JL", recent: false },
];

// Mock data for payment methods
const paymentMethods = [
  { id: 1, name: "From Account", balance: 12450.75, number: "****3456", type: "checking", default: true },
  { id: 2, name: "Savings Account", balance: 8750.25, number: "****7890", type: "savings", default: false },
  { id: 3, name: "Credit Card", balance: 5000, number: "****1234", type: "credit", default: false },
];

// Transaction limits
const limits = {
  quick: {
    perTransaction: 2000,
    daily: 5000,
    remaining: 4500,
  }
};

// P2P Networks
const p2pNetworks = [
  { id: 1, name: "Zelle", icon: "🔵", fee: 0, time: "Instant" },
  { id: 2, name: "Venmo", icon: "🟢", fee: 0, time: "1-3 days" },
  { id: 3, name: "PayPal", icon: "🔷", fee: 0.5, time: "Instant" },
  { id: 4, name: "Cash App", icon: "🟩", fee: 0, time: "1-2 days" },
];

// Form validation schema
const QuickTransferSchema = Yup.object().shape({
  recipientType: Yup.string()
    .required("Recipient type is required"),
  recipientId: Yup.string()
    .when("recipientType", {
      is: "contact",
      then: Yup.string().required("Recipient is required"),
    }),
  recipientPhone: Yup.string()
    .when("recipientType", {
      is: "phone",
      then: Yup.string()
        .required("Phone number is required")
        .matches(/^\+?[1-9]\d{9,14}$/, "Phone number is not valid"),
    }),
  recipientEmail: Yup.string()
    .when("recipientType", {
      is: "email",
      then: Yup.string()
        .required("Email is required")
        .email("Email is not valid"),
    }),
  amount: Yup.number()
    .required("Amount is required")
    .positive("Amount must be positive")
    .max(limits.quick.perTransaction, `Maximum per transaction is $${limits.quick.perTransaction}`)
    .test(
      "daily-limit",
      `Daily limit of $${limits.quick.daily} will be exceeded`,
      function(value) {
        return value <= limits.quick.remaining;
      }
    ),
  paymentMethod: Yup.string()
    .required("Payment method is required"),
  p2pNetwork: Yup.string()
    .required("P2P network is required"),
  memo: Yup.string()
    .max(100, "Memo cannot exceed 100 characters"),
  transferCode: Yup.string()
    .required("Transfer code is required")
    .matches(/^\d{4}$/, "Transfer code must be 4 digits"),
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

const staggerContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07
    }
  }
};

const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const QuickTransfer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [recipientType, setRecipientType] = useState<"contact" | "phone" | "email">("contact");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethods[0]);
  const [selectedP2PNetwork, setSelectedP2PNetwork] = useState(p2pNetworks[0]);
  const [filteredContacts, setFilteredContacts] = useState(contacts);
  const [recentContacts, setRecentContacts] = useState(contacts.filter(c => c.recent));
  
  // Filter contacts based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchTerm]);

  // Generate transaction ID
  useEffect(() => {
    const generateTransactionId = () => {
      return `QT${Math.floor(100000000 + Math.random() * 900000000)}`;
    };
    
    setTransactionId(generateTransactionId());
  }, [transferSuccess]);

  const handleSelectContact = (contact: any) => {
    setSelectedContact(contact);
    setRecipientType("contact");
  };

  const handleSelectRecipientType = (type: "contact" | "phone" | "email") => {
    setRecipientType(type);
    if (type !== "contact") {
      setSelectedContact(null);
    }
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    setLoading(true);
    
    // Simulate API call for processing transfer
    setTimeout(() => {
      setLoading(false);
      setSubmitting(false);
      setStep(2);
      setTransferSuccess(true);
    }, 2000);
  };

  const resetForm = () => {
    setStep(1);
    setTransferSuccess(false);
    setSelectedContact(null);
    setSearchTerm("");
  };

  const handleSelectPaymentMethod = (paymentMethod: any) => {
    setSelectedPaymentMethod(paymentMethod);
  };

  const handleSelectP2PNetwork = (network: any) => {
    setSelectedP2PNetwork(network);
  };

  return (
    <motion.div
      className="p-6 max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-indigo-900 dark:text-white">Quick Transfer</h1>
          <p className="text-sm text-purple-500">Send money to contacts or mobile numbers</p>
        </div>
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white">
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
              <User size={18} />
            </div>
            <span className="text-xs mt-1">Recipient</span>
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
            {/* Recipient Selection */}
            <div className="mb-8">
              <div className="flex space-x-2 mb-6">
                <motion.button
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium 
                    ${recipientType === "contact" ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => handleSelectRecipientType("contact")}
                  whileHover={{ backgroundColor: recipientType === "contact" ? "#C7D2FE" : "#F3F4F6" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center">
                    <User size={16} className="mr-2" />
                    From Contacts
                  </div>
                </motion.button>
                
                <motion.button
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium 
                    ${recipientType === "phone" ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => handleSelectRecipientType("phone")}
                  whileHover={{ backgroundColor: recipientType === "phone" ? "#C7D2FE" : "#F3F4F6" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center">
                    <Phone size={16} className="mr-2" />
                    Phone Number
                  </div>
                </motion.button>
                
                <motion.button
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium 
                    ${recipientType === "email" ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => handleSelectRecipientType("email")}
                  whileHover={{ backgroundColor: recipientType === "email" ? "#C7D2FE" : "#F3F4F6" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center">
                    <Mail size={16} className="mr-2" />
                    Email Address
                  </div>
                </motion.button>
              </div>

              {/* Contact selection interface */}
              {recipientType === "contact" && (
                <div>
                  {/* Search bar */}
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Search contacts by name or number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Recent contacts */}
                  {searchTerm === "" && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-indigo-900 mb-3">Recent Recipients</h3>
                      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-indigo-200">
                        {recentContacts.map((contact) => (
                          <motion.div
                            key={contact.id}
                            className={`flex flex-col items-center p-3 rounded-xl cursor-pointer min-w-[90px] ${
                              selectedContact?.id === contact.id ? 'bg-indigo-100 border-2 border-indigo-300' : 'bg-gray-50'
                            }`}
                            variants={cardVariants}
                            initial="initial"
                            animate="in"
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => handleSelectContact(contact)}
                          >
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white font-medium mb-2">
                              {contact.avatar}
                            </div>
                            <div className="text-xs font-medium text-center">{contact.name}</div>
                            <div className="text-xs text-gray-500 truncate w-full text-center">
                              {contact.type === "phone" ? "📱" : "✉️"} {contact.value.substring(0, 10) + "..."}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All contacts */}
                  <div>
                    <h3 className="text-sm font-semibold text-indigo-900 mb-3">
                      {searchTerm === "" ? "All Contacts" : `Search Results (${filteredContacts.length})`}
                    </h3>
                    
                    <div className="bg-gray-50 rounded-xl p-2 max-h-64 overflow-y-auto">
                      {filteredContacts.length > 0 ? (
                        <motion.div
                          variants={staggerContainerVariants}
                          initial="hidden"
                          animate="show"
                          className="space-y-2"
                        >
                          {filteredContacts.map((contact) => (
                            <motion.div
                              key={contact.id}
                              variants={staggerItemVariants}
                              className={`flex items-center p-3 rounded-lg cursor-pointer ${
                                selectedContact?.id === contact.id ? 'bg-indigo-100' : 'hover:bg-gray-100'
                              }`}
                              onClick={() => handleSelectContact(contact)}
                            >
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white font-medium mr-3">
                                {contact.avatar}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-indigo-900 dark:text-white">{contact.name}</div>
                                <div className="text-xs text-gray-500 flex items-center">
                                  {contact.type === "phone" ? (
                                    <Phone size={12} className="mr-1" />
                                  ) : (
                                    <Mail size={12} className="mr-1" />
                                  )}
                                  {contact.value}
                                </div>
                              </div>
                              <div>
                                <ChevronRight size={18} className="text-gray-400" />
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <div className="py-4 text-center text-gray-500">
                          No contacts found matching your search
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Transfer Form */}
              <Formik
                initialValues={{
                  recipientType: recipientType,
                  recipientId: selectedContact?.id || "",
                  recipientPhone: "",
                  recipientEmail: "",
                  amount: "",
                  paymentMethod: selectedPaymentMethod.id,
                  p2pNetwork: selectedP2PNetwork.id,
                  memo: "",
                  transferCode: "",
                }}
                validationSchema={QuickTransferSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ isSubmitting, errors, touched, values, setFieldValue }) => (
                  <Form className="space-y-6 mt-8">
                    {/* Recipient details for phone */}
                    {recipientType === "phone" && (
                      <div className="space-y-1">
                        <label htmlFor="recipientPhone" className="block text-sm font-medium text-indigo-900 dark:text-white">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Field
                            type="text"
                            name="recipientPhone"
                            id="recipientPhone"
                            className={`
                              mt-1 block w-full pl-10 pr-3 py-2 text-base border-gray-300 
                              focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                              sm:text-sm rounded-lg ${errors.recipientPhone && touched.recipientPhone ? 'border-red-300' : ''}
                            `}
                            placeholder="Enter recipient's phone number"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone size={16} className="text-indigo-500" />
                          </div>
                          <ErrorMessage name="recipientPhone" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                      </div>
                    )}

                    {/* Recipient details for email */}
                    {recipientType === "email" && (
                      <div className="space-y-1">
                        <label htmlFor="recipientEmail" className="block text-sm font-medium text-indigo-900 dark:text-white">
                          Email Address
                        </label>
                        <div className="relative">
                          <Field
                            type="email"
                            name="recipientEmail"
                            id="recipientEmail"
                            className={`
                              mt-1 block w-full pl-10 pr-3 py-2 text-base border-gray-300 
                              focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                              sm:text-sm rounded-lg ${errors.recipientEmail && touched.recipientEmail ? 'border-red-300' : ''}
                            `}
                            placeholder="Enter recipient's email address"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={16} className="text-indigo-500" />
                          </div>
                          <ErrorMessage name="recipientEmail" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                      </div>
                    )}

                    {/* Selected recipient display */}
                    {recipientType === "contact" && selectedContact && (
                      <div className="bg-indigo-50 p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white font-medium mr-3">
                            {selectedContact.avatar}
                          </div>
                          <div>
                            <div className="font-medium text-indigo-900 dark:text-white">{selectedContact.name}</div>
                            <div className="text-xs text-gray-600 flex items-center">
                              {selectedContact.type === "phone" ? (
                                <Phone size={12} className="mr-1" />
                              ) : (
                                <Mail size={12} className="mr-1" />
                              )}
                              {selectedContact.value}
                            </div>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setSelectedContact(null)}
                          className="text-indigo-500 hover:text-indigo-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}

                    {/* Transfer limits info */}
                    <div className="bg-indigo-50 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Clock size={16} className="text-indigo-600 mr-2" />
                          <span className="text-sm font-medium text-indigo-800">Quick Transfer Limits</span>
                        </div>
                        <HelpCircle size={16} className="text-indigo-400" />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-indigo-500 mb-1">Per Transaction</div>
                          <div className="text-sm font-semibold text-indigo-900 dark:text-white">${limits.quick.perTransaction.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-indigo-500 mb-1">Daily Limit</div>
                          <div className="text-sm font-semibold text-indigo-900 dark:text-white">${limits.quick.daily.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-indigo-500 mb-1">Remaining Today</div>
                          <div className="text-sm font-semibold text-indigo-900 dark:text-white">${limits.quick.remaining.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Amount */}
                      <div className="space-y-1">
                        <label htmlFor="amount" className="block text-sm font-medium text-indigo-900 dark:text-white">
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

                      {/* Payment Method */}
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-indigo-900 dark:text-white">
                          From Account
                        </label>
                        <div className="mt-1">
                          <Field name="paymentMethod">
                            {({ field, form }) => (
                              <div className="bg-gray-50 rounded-lg overflow-hidden">
                                {paymentMethods.map((method) => (
                                  <motion.div
                                    key={method.id}
                                    className={`flex items-center p-3 cursor-pointer ${
                                      parseInt(field.value) === method.id 
                                        ? 'bg-indigo-100 border-l-4 border-indigo-500' 
                                        : 'hover:bg-gray-100 border-l-4 border-transparent'
                                    }`}
                                    onClick={() => {
                                      form.setFieldValue(field.name, method.id);
                                      handleSelectPaymentMethod(method);
                                    }}
                                    whileHover={{ x: 3 }}
                                    whileTap={{ scale: 0.99 }}
                                  >
                                    <div className="flex-1">
                                      <div className="font-medium text-indigo-900 dark:text-white">{method.name}</div>
                                      <div className="text-xs text-gray-500 flex items-center justify-between">
                                        <span>{method.number}</span>
                                        <span className="font-semibold text-indigo-700">${method.balance.toLocaleString()}</span>
                                      </div>
                                    </div>
                                    <div className="ml-3">
                                      {parseInt(field.value) === method.id && (
                                        <Check size={16} className="text-indigo-600" />
                                      )}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </Field>
                          <ErrorMessage name="paymentMethod" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                      </div>

                      {/* P2P Network */}
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-indigo-900 dark:text-white">
                          Transfer Method
                        </label>
                        <div className="mt-1">
                          <Field name="p2pNetwork">
                            {({ field, form }) => (
                              <div className="grid grid-cols-2 gap-3">
                                {p2pNetworks.map((network) => (
                                  <motion.div
                                    key={network.id}
                                    className={`
                                      flex items-center p-3 rounded-lg cursor-pointer border
                                      ${parseInt(field.value) === network.id 
                                        ? 'bg-indigo-50 border-indigo-300' 
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                      }
                                    `}
                                    onClick={() => {
                                      form.setFieldValue(field.name, network.id);
                                      handleSelectP2PNetwork(network);
                                    }}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <div className="mr-3">{network.icon}</div>
                                    <div className="flex-1">
                                      <div className="font-medium text-indigo-900 dark:text-white">{network.name}</div>
                                      <div className="text-xs flex justify-between">
                                        <span className="text-gray-500">Fee: {network.fee > 0 ? `${network.fee}%` : 'Free'}</span>
                                        <span className="text-indigo-600">{network.time}</span>
                                        </div>
                                        </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </Field>
                          <ErrorMessage name="p2pNetwork" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                      </div>

                      {/* Memo */}
                      <div className="space-y-1">
                        <label htmlFor="memo" className="block text-sm font-medium text-indigo-900 dark:text-white">
                          Memo (Optional)
                        </label>
                        <div className="relative">
                          <Field
                            as="textarea"
                            name="memo"
                            id="memo"
                            rows={2}
                            className="mt-1 block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
                            placeholder="What's this payment for?"
                          />
                          <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
                            <FileText size={16} className="text-indigo-500" />
                          </div>
                          <ErrorMessage name="memo" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                      </div>
                    </div>

                    {/* Transfer security code */}
                    <div className="space-y-1 max-w-xs mx-auto mt-6">
                      <label htmlFor="transferCode" className="block text-sm font-medium text-indigo-900 text-center">
                        Enter your 4-digit transfer code
                      </label>
                      <div className="relative mt-2">
                        <Field
                          type="password"
                          name="transferCode"
                          id="transferCode"
                          className={`
                            block w-full pl-10 pr-3 py-2 text-center text-base border-gray-300 
                            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                            sm:text-sm rounded-lg ${errors.transferCode && touched.transferCode ? 'border-red-300' : ''}
                          `}
                          placeholder="Enter 4-digit code"
                          maxLength={4}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock size={16} className="text-indigo-500" />
                        </div>
                        <ErrorMessage name="transferCode" component="div" className="text-red-500 text-xs mt-1 text-center" />
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-1">
                        This code helps protect your account
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-5">
                      <motion.button
                        type="submit"
                        className={`
                          w-full py-3 px-4 rounded-xl text-white font-medium
                          ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}
                          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                          flex items-center justify-center
                        `}
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader size={20} className="animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Send Money
                            <ArrowRight size={18} className="ml-2" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            className="bg-white p-6 rounded-2xl"
          >
            {/* Confirmation Screen */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="mx-auto mb-4"
              >
                {transferSuccess ? (
                  <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check size={40} className="text-green-500" />
                  </div>
                ) : (
                  <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle size={40} className="text-red-500" />
                  </div>
                )}
              </motion.div>
              <h2 className="text-2xl font-bold text-indigo-900 mb-2">
                {transferSuccess ? "Transfer Successful!" : "Transfer Failed"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {transferSuccess
                  ? "Your money is on its way to the recipient."
                  : "There was an issue processing your transfer. Please try again."}
              </p>
            </div>

            {transferSuccess && (
              <motion.div
                variants={staggerContainerVariants}
                initial="hidden"
                animate="show"
              >
                {/* Transaction Details */}
                <div className="bg-indigo-50 rounded-xl p-6 mb-6">
                  <h3 className="text-sm font-semibold text-indigo-900 mb-4 flex items-center">
                    <FileText size={16} className="mr-2" />
                    Transaction Details
                  </h3>

                  <motion.div variants={staggerItemVariants} className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-indigo-100">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</span>
                      <span className="text-sm font-medium text-indigo-900 dark:text-white">{transactionId}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-indigo-100">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Date & Time</span>
                      <span className="text-sm font-medium text-indigo-900 dark:text-white">
                        {new Date().toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-indigo-100">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                      <span className="text-sm font-medium text-indigo-900 dark:text-white">
                        ${parseFloat("0").toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-indigo-100">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Recipient</span>
                      <span className="text-sm font-medium text-indigo-900 dark:text-white">
                        {selectedContact?.name || "Recipient"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-indigo-100">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Payment Method</span>
                      <span className="text-sm font-medium text-indigo-900 dark:text-white">
                        {selectedPaymentMethod?.name}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-indigo-100">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Network</span>
                      <span className="text-sm font-medium text-indigo-900 dark:text-white">
                        {selectedP2PNetwork?.name}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                      <span className="text-sm font-medium bg-green-100 text-green-800 py-1 px-3 rounded-full">
                        Complete
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Receipt Options */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-indigo-900 flex items-center">
                      <Mail size={16} className="mr-2" />
                      Receipt Options
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.button
                      className="flex items-center justify-center py-3 px-4 border border-indigo-300 rounded-xl bg-white text-indigo-800 hover:bg-indigo-50"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Mail size={18} className="mr-2" />
                      Email Receipt
                    </motion.button>

                    <motion.button
                      className="flex items-center justify-center py-3 px-4 border border-indigo-300 rounded-xl bg-white text-indigo-800 hover:bg-indigo-50"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Phone size={18} className="mr-2" />
                      Text Receipt
                    </motion.button>
                  </div>
                </div>

                {/* Save contact and favorite options */}
                {recipientType !== "contact" && (
                  <motion.div variants={staggerItemVariants} className="mb-8">
                    <div className="bg-indigo-50 rounded-xl p-4">
                      <div className="flex space-x-4">
                        <motion.button
                          className="flex-1 flex items-center justify-center py-3 px-4 bg-white border border-indigo-300 rounded-lg text-indigo-800 hover:bg-indigo-50"
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <User size={18} className="mr-2" />
                          Save as Contact
                        </motion.button>

                        <motion.button
                          className="flex-1 flex items-center justify-center py-3 px-4 bg-white border border-indigo-300 rounded-lg text-indigo-800 hover:bg-indigo-50"
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Star size={18} className="mr-2" />
                          Add to Favorites
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col space-y-4 mt-8">
              <motion.button
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={resetForm}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {transferSuccess ? "Make Another Transfer" : "Try Again"}
              </motion.button>

              {transferSuccess && (
                <motion.button
                  className="w-full py-3 px-4 rounded-xl border border-indigo-300 bg-white text-indigo-800 font-medium hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center">
                    <Calendar size={18} className="mr-2" />
                    Schedule Recurring Payment
                  </div>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rate limits and legal info */}
      <div className="mt-8 text-xs text-gray-500">
        <div className="flex items-center mb-2">
          <Lock size={12} className="mr-1" />
          <span>Your information is secured with end-to-end encryption</span>
        </div>
        <p>
          Quick Transfers are subject to daily and transaction limits. All transfers are subject to review and could be delayed or stopped if suspicious activity is detected. See Terms and Conditions for more details.
        </p>
      </div>
    </motion.div>
  );
};

export default QuickTransfer;