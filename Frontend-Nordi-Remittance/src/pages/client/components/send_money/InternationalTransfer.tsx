/* eslint-disable @typescript-eslint/no-explicit-any */
    import React, { useState } from "react";
    import { motion, AnimatePresence } from "framer-motion";
    import { Formik, Form, Field} from "formik";
    import * as Yup from "yup";
    import Countries from "@core/data/Countries";
    import {
    ArrowRight,
    User,
    Building,
 
    DollarSign,
    FileText,
    Clock,
    CheckCircle,

    ChevronDown,
    ChevronUp,
    Search,
    Globe,
   
    AlertTriangle,
    ArrowLeft,

    Link,
    Printer,
    RefreshCw,
    Share2,
    Copy,
    Info,
    ChevronsDown,
    ChevronsUp,
    HelpCircle,
    ExternalLink,
    } from "lucide-react";

    // Mock data for accounts and currencies
    const myAccounts = [
    { id: "1", name: "Premium Current Account", number: "****2345", balance: 5280.42, currency: "USD" },
    { id: "2", name: "Savings Account", number: "****7890", balance: 12750.18, currency: "USD" },
    { id: "3", name: "Joint Account", number: "****5432", balance: 3650.00, currency: "USD" },
    ];

    const currencies = [
    { code: "USD", name: "US Dollar", flag: "🇺🇸", symbol: "$" },
    { code: "EUR", name: "Euro", flag: "🇪🇺", symbol: "€" },
    { code: "GBP", name: "British Pound", flag: "🇬🇧", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", symbol: "¥" },
    { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", symbol: "$" },
    { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", symbol: "$" },
    { code: "CHF", name: "Swiss Franc", flag: "🇨🇭", symbol: "CHF" },
    { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳", symbol: "¥" },
    { code: "INR", name: "Indian Rupee", flag: "🇮🇳", symbol: "₹" },
    { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬", symbol: "$" },
    ];

    const transferPurposes = [
    { id: "family", name: "Family Support" },
    { id: "business", name: "Business Payment" },
    { id: "education", name: "Education Fees" },
    { id: "investment", name: "Investment" },
    { id: "property", name: "Property Purchase" },
    { id: "medical", name: "Medical Expenses" },
    { id: "gift", name: "Gift" },
    { id: "other", name: "Other" },
    ];

    const deliveryOptions = [
    { id: "standard", name: "Standard (2-3 Business Days)", fee: 15.00 },
    { id: "express", name: "Express (1 Business Day)", fee: 30.00 },
    { id: "same-day", name: "Same Day (Within Hours)", fee: 50.00 },
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

    // Exchange rate info (mock)
    const exchangeRateInfo = {
    rate: 0.85,
    lastUpdated: new Date().toLocaleString(),
    fee: 2.5, // percentage
    };

    // Transfer validation schema
    const internationalWireSchema = Yup.object().shape({
    fromAccount: Yup.string().required("Please select an account"),
    recipientName: Yup.string()
        .required("Recipient name is required")
        .min(2, "Name must be at least 2 characters"),
    recipientAccountNumber: Yup.string()
        .required("Account number is required")
        .matches(/^[A-Za-z0-9\s]+$/, "Invalid format"),
    bankName: Yup.string()
        .required("Bank name is required")
        .min(2, "Bank name must be at least 2 characters"),
    swiftCode: Yup.string()
        .required("SWIFT/BIC code is required")
        .matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, "Invalid SWIFT/BIC format"),
    bankAddress: Yup.string()
        .required("Bank address is required"),
    country: Yup.string()
        .required("Country is required"),
    amount: Yup.number()
        .required("Please enter an amount")
        .positive("Amount must be positive")
        .max(50000, "Amount exceeds daily limit of $50,000"),
    currency: Yup.string()
        .required("Please select a currency"),
    purpose: Yup.string()
        .required("Please select a purpose for the transfer"),
    deliveryOption: Yup.string()
        .required("Please select a delivery option"),
    reference: Yup.string()
        .max(140, "Reference cannot exceed 140 characters"),
    agreeTos: Yup.boolean()
        .oneOf([true], "You must agree to the terms of service"),
    agreeCompliance: Yup.boolean()
        .oneOf([true], "You must acknowledge compliance with international regulations")
    });

    // Main component
    const InternationalWire: React.FC = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<any>(null);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [selectedCurrency, setSelectedCurrency] = useState<any>(null);
    const [selectedCountry, setSelectedCountry] = useState<any>(null);
    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [showExchangeRateInfo, setShowExchangeRateInfo] = useState(false);
    const [transferSuccess, setTransferSuccess] = useState(false);
    const [referenceNumber, setReferenceNumber] = useState("");
    const [expandedSection, setExpandedSection] = useState<string | null>("details");
    const [searchCountry, setSearchCountry] = useState("");
    const [searchCurrency, setSearchCurrency] = useState("");

    // Calculate converted amount based on exchange rate
    const calculateConvertedAmount = (amount: number, toCurrency: string) => {
        if (toCurrency === "USD") return amount;
        return amount * exchangeRateInfo.rate;
    };

    // Calculate total fees
    const calculateTotalFees = (amount: number, deliveryOption: string) => {
        const selectedOption = deliveryOptions.find(option => option.id === deliveryOption);
        const deliveryFee = selectedOption ? selectedOption.fee : 0;
        const exchangeFee = (toCurrency: string) => {
        if (toCurrency === "USD") return 0;
        return (amount * exchangeRateInfo.fee) / 100;
        };
        
        return {
        deliveryFee,
        exchangeFee: exchangeFee(formData?.currency || "USD"),
        total: deliveryFee + exchangeFee(formData?.currency || "USD")
        };
    };

    // Function to handle form submission
    const handleSubmit = (values: any) => {
        if (step === 1) {
        // Move to confirmation step
        setFormData(values);
        setStep(2);
        // Find selected account and currency
        const account = myAccounts.find(acc => acc.id === values.fromAccount);
        const currency = currencies.find(curr => curr.code === values.currency);
        const country = Countries.find(c => c.code === values.country);
        setSelectedAccount(account);
        setSelectedCurrency(currency);
        setSelectedCountry(country);
        } else if (step === 2) {
        // Process the transfer (simulate API call)
        setTimeout(() => {
            setTransferSuccess(true);
            setReferenceNumber(`INTL${Math.floor(Math.random() * 10000000)}`);
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

    // Filter countries based on search
    const filteredCountries = Countries.filter(country => 
        country.name.toLowerCase().includes(searchCountry.toLowerCase())
    );

    // Filter currencies based on search
    const filteredCurrencies = currencies.filter(currency => 
        currency.name.toLowerCase().includes(searchCurrency.toLowerCase()) || 
        currency.code.toLowerCase().includes(searchCurrency.toLowerCase())
    );

    // Find selected delivery option
    const getSelectedDeliveryOption = () => {
        return deliveryOptions.find(option => option.id === formData?.deliveryOption);
    };

    // Find selected purpose
    const getSelectedPurpose = () => {
        return transferPurposes.find(purpose => purpose.id === formData?.purpose);
    };

    const SafeError = ({ error }: { error: unknown }) => {
        return typeof error === "string" ? (
          <div className="text-red-500 text-sm mt-1">{error}</div>
        ) : null;
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
            <h1 className="text-2xl font-bold text-indigo-900 dark:text-white">International Wire Transfer</h1>
            <p className="text-purple-600">Send money securely to bank accounts worldwide</p>
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
                <h2 className="text-lg font-semibold text-indigo-900 mb-4">International Transfer Details</h2>
                
                <Formik
                    initialValues={{
                    fromAccount: "",
                    recipientName: "",
                    recipientAccountNumber: "",
                    bankName: "",
                    swiftCode: "",
                    bankAddress: "",
                    country: "",
                    amount: "",
                    currency: "USD",
                    purpose: "",
                    deliveryOption: "standard",
                    reference: "",
                    intermediaryBank: "",
                    agreeTos: false,
                    agreeCompliance: false
                    }}
                    validationSchema={internationalWireSchema}
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
                            {touched.fromAccount && <SafeError error={errors.fromAccount} />}
                        </div>
                        </div>
                        
                        {/* Recipient Details */}
                        <div className="bg-purple-50 rounded-lg p-4">
                        <h3 className="font-medium text-purple-800 mb-3">Recipient Information</h3>
                        
                        <div className="space-y-4 bg-white p-4 rounded-lg">
                            <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Full Name</label>
                            <div className="relative">
                            <User size={16} className="absolute left-3 top-3 text-gray-400" />

                        </div>
    <Field 
    type="text"
    name="recipientName"
    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
    placeholder="Enter recipient's full name"
    />
    {touched.recipientName && <SafeError error={errors.recipientName} />}
    </div>

    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number / IBAN</label>
    <div className="relative">
        <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
        <Field 
        type="text"
        name="recipientAccountNumber"
        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Enter account number or IBAN"
        />
        {touched.recipientAccountNumber&& <SafeError error={errors.recipientAccountNumber} />}
    </div>
    </div>

    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
    <div className="relative">
        <Building size={16} className="absolute left-3 top-3 text-gray-400" />
        <Field 
        type="text"
        name="bankName"
        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Enter recipient's bank name"
        />
        {touched.bankName && <SafeError error={errors.bankName} />}
    </div>
    </div>

    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">SWIFT/BIC Code</label>
    <div className="relative">
        <Link size={16} className="absolute left-3 top-3 text-gray-400" />
        <Field 
        type="text"
        name="swiftCode"
        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Enter SWIFT/BIC code"
        />
        {touched.swiftCode && <SafeError error={errors.swiftCode} />}
    </div>
    </div>

    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Address</label>
    <div className="relative">
        <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
        <Field 
        as="textarea"
        name="bankAddress"
        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Enter bank's full address"
        rows={3}
        />
        {touched.bankAddress&& <SafeError error={errors.bankAddress} />}
    </div>
    </div>

    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
    <div className="relative">
        <div 
        className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 flex items-center justify-between p-2 cursor-pointer"
        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
        >
        <div className="flex items-center">
            <Globe size={16} className="text-gray-400 mr-2" />
            {selectedCountry ? (
            <span>{selectedCountry.flag} {selectedCountry.name}</span>
            ) : (
            <span className="text-gray-500">Select recipient country</span>
            )}
        </div>
        {showCountryDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        
        {showCountryDropdown && (
        <div className="absolute z-10 mt-1 w-full bg-slate-50 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            <div className="p-2 sticky top-0 bg-slate-50 border-b">
            <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                type="text"
                value={searchCountry}
                onChange={(e) => setSearchCountry(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search countries"
                />
            </div>
            </div>
            {filteredCountries.map((country) => (
            <div
                key={country.code}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
                onClick={() => {
                setSelectedCountry(country);
                setFieldValue("country", country.code);
                setShowCountryDropdown(false);
                }}
            >
                <div className="flex items-center">
                <span className="mr-2">{country.flag}</span>
                <span className={values.country === country.code ? "font-medium text-indigo-600" : "font-normal"}>
                    {country.name}
                </span>
                </div>
                {values.country === country.code && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                    <CheckCircle size={16} />
                </span>
                )}
            </div>
            ))}
        </div>
        )}
        {touched.country && typeof errors.country === "string" && (
        <div className="text-red-500 text-sm mt-1">{errors.country}</div>
        )}
    </div>
    </div>
    </div>
    </div>

    {/* Transfer Details */}
    <div className="bg-blue-50 rounded-lg p-4">
    <h3 className="font-medium text-blue-800 mb-3">Transfer Details</h3>
    
    <div className="space-y-4 bg-white p-4 rounded-lg">
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
        <div className="relative">
            <DollarSign size={16} className="absolute left-3 top-3 text-gray-400" />
            <Field 
            type="number"
            name="amount"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter amount"
            step="0.01"
            />
            {touched.amount && <SafeError error={errors.amount} />}
        </div>
        <div className="text-xs text-gray-500 mt-1">Daily limit: $50,000.00</div>
        </div>

        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
        <div className="relative">
            <div 
            className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 flex items-center justify-between p-2 cursor-pointer"
            onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
            >
            <div className="flex items-center">
                {selectedCurrency ? (
                <span>{selectedCurrency.flag} {selectedCurrency.code} - {selectedCurrency.name}</span>
                ) : (
                <span className="text-gray-500">Select currency</span>
                )}
            </div>
            {showCurrencyDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            
            {showCurrencyDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                <div className="p-2 sticky top-0 bg-white border-b">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                    type="text"
                    value={searchCurrency}
                    onChange={(e) => setSearchCurrency(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Search currencies"
                    />
                </div>
                </div>
                {filteredCurrencies.map((currency) => (
                <div
                    key={currency.code}
                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
                    onClick={() => {
                    setSelectedCurrency(currency);
                    setFieldValue("currency", currency.code);
                    setShowCurrencyDropdown(false);
                    }}
                >
                    <div className="flex items-center">
                    <span className="mr-2">{currency.flag}</span>
                    <span className={values.currency === currency.code ? "font-medium text-indigo-600" : "font-normal"}>
                        {currency.code} - {currency.name}
                    </span>
                    </div>
                    {values.currency === currency.code && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                        <CheckCircle size={16} />
                    </span>
                    )}
                </div>
                ))}
            </div>
            )}
            {touched.currency && typeof errors.currency === "string" && (
            <div className="text-red-500 text-sm mt-1">{errors.currency}</div>
            )}
        </div>

        {/* Exchange rate info */}
        {values.amount && values.currency && values.currency !== "USD" && (
            <div className="mt-2">
            <div className="flex items-center text-sm">
                <div className="text-gray-600 dark:text-gray-400">
                Exchange Rate: 1 USD = {exchangeRateInfo.rate} {values.currency}
                </div>
                <button
                type="button"
                className="ml-2 text-indigo-600 hover:text-indigo-800 flex items-center"
                onClick={() => setShowExchangeRateInfo(!showExchangeRateInfo)}
                >
                <Info size={14} className="mr-1" />
                <span>Details</span>
                </button>
            </div>
            
            {showExchangeRateInfo && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                <div className="flex justify-between mb-1">
                    <span>Your amount:</span>
                    <span>${parseFloat(values.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between mb-1">
                    <span>Exchange rate:</span>
                    <span>1 USD = {exchangeRateInfo.rate} {values.currency}</span>
                </div>
                <div className="flex justify-between mb-1">
                    <span>Exchange fee ({exchangeRateInfo.fee}%):</span>
                    <span>${((parseFloat(values.amount) * exchangeRateInfo.fee) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-gray-200 pt-1 mt-1">
                    <div className="flex justify-between font-medium">
                    <span>Recipient gets:</span>
                    <span>{selectedCurrency?.symbol}{calculateConvertedAmount(parseFloat(values.amount), values.currency).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                    Rate last updated: {exchangeRateInfo.lastUpdated}
                </div>
                </div>
            )}
            </div>
        )}
        </div>

        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Transfer</label>
        <div className="relative">
            <Field 
            as="select"
            name="purpose"
            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
            >
            <option value="">Select purpose</option>
            {transferPurposes.map(purpose => (
                <option key={purpose.id} value={purpose.id}>{purpose.name}</option>
            ))}
            </Field>
            <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
        </div>
        {touched.purpose && <SafeError error={errors.purpose} />}
        </div>

        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Speed</label>
        <div className="space-y-2">
            {deliveryOptions.map(option => (
            <div 
                key={option.id}
                className={`bg-white rounded-lg p-3 cursor-pointer border ${values.deliveryOption === option.id ? 'border-indigo-600' : 'border-gray-200'}`}
                onClick={() => setFieldValue("deliveryOption", option.id)}
            >
                <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${values.deliveryOption === option.id ? 'bg-indigo-600' : 'border border-gray-400'}`}></div>
                    <div className="ml-3">
                    <div className="font-medium text-gray-900 dark:text-white">{option.name}</div>
                    </div>
                </div>
                <div className="font-semibold text-indigo-900 dark:text-white">${option.fee.toFixed(2)}</div>
                </div>
            </div>
            ))}
            {touched.deliveryOption && <SafeError error={errors.deliveryOption} />}
        </div>
        </div>

        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Reference (Optional)</label>
        <div className="relative">
            <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
            <Field 
            type="text"
            name="reference"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Add a reference for recipient"
            />
        </div>
        <div className="text-xs text-gray-500 mt-1">This will appear on recipient's bank statement</div>
        </div>

        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Intermediary Bank (Optional)</label>
        <div className="relative">
            <Building size={16} className="absolute left-3 top-3 text-gray-400" />
            <Field 
            type="text"
            name="intermediaryBank"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter intermediary bank details if applicable"
            />
        </div>
        </div>
    </div>
    </div>

    {/* Terms and compliance */}
    <div className="bg-gray-50 rounded-lg p-4">
    <div className="space-y-3">
        <div className="flex items-start">
        <div className="flex items-center h-5">
            <Field
            type="checkbox"
            name="agreeTos"
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
        </div>
        <div className="ml-3 text-sm">
            <label htmlFor="agreeTos" className="font-medium text-gray-700">
            I agree to the terms of service and privacy policy
            </label>
            <p className="text-gray-500">
            By proceeding, you agree to our <a href="#" className="text-indigo-600 hover:text-indigo-800">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:text-indigo-800">Privacy Policy</a>
            </p>
            {touched.agreeTos && <SafeError error={errors.agreeTos} />}
        </div>
        </div>

        <div className="flex items-start">
        <div className="flex items-center h-5">
            <Field
            type="checkbox"
            name="agreeCompliance"
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
        </div>
        <div className="ml-3 text-sm">
            <label htmlFor="agreeCompliance" className="font-medium text-gray-700">
            I acknowledge compliance with international regulations
            </label>
            <p className="text-gray-500">
            I confirm this transfer is not related to illegal activities and complies with all applicable laws and regulations
            </p>
            {touched.agreeCompliance && <SafeError error={errors.agreeCompliance} />}
        </div>
        </div>
    </div>
    </div>

    {/* Submit button */}
    <div className="flex justify-end">
    <motion.button
        type="submit"
        className={`flex items-center justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${!isValid || !dirty ? 'opacity-50 cursor-not-allowed' : ''}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={!isValid || !dirty}
    >
        <span>Continue</span>
        <ArrowRight size={16} className="ml-2" />
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
    <h2 className="text-lg font-semibold text-indigo-900 mb-4">Confirm International Transfer</h2>
    
    <div className="space-y-6">
        {/* Transfer summary sections */}
        <div className="space-y-4">
        <div 
            className="border border-gray-200 rounded-lg overflow-hidden"
            onClick={() => toggleSection("details")}
        >
            <div className="flex justify-between items-center p-4 cursor-pointer bg-gray-50">
            <div className="flex items-center">
                <FileText size={20} className="text-indigo-600 mr-2" />
                <h3 className="font-medium text-gray-900 dark:text-white">Transfer Details</h3>
            </div>
            {expandedSection === "details" ? 
                <ChevronsUp size={20} className="text-gray-500" /> : 
                <ChevronsDown size={20} className="text-gray-500" />
            }
            </div>
            
            {expandedSection === "details" && (
            <div className="p-4 bg-white border-t border-gray-200">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div className="col-span-2 sm:col-span-1">
                    <dt className="text-gray-500">From Account</dt>
                    <dd className="font-medium text-gray-900 mt-1">{selectedAccount?.name} ({selectedAccount?.number})</dd>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <dt className="text-gray-500">Amount</dt>
                    <dd className="font-medium text-gray-900 mt-1">${parseFloat(formData.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</dd>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <dt className="text-gray-500">Recipient Gets</dt>
                    <dd className="font-medium text-gray-900 mt-1">
                    {selectedCurrency?.symbol}{calculateConvertedAmount(parseFloat(formData.amount), formData.currency).toLocaleString('en-US', { minimumFractionDigits: 2 })} {formData.currency}
                    </dd>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <dt className="text-gray-500">Purpose</dt>
                    <dd className="font-medium text-gray-900 mt-1">{getSelectedPurpose()?.name}</dd>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <dt className="text-gray-500">Delivery Option</dt>
                    <dd className="font-medium text-gray-900 mt-1">{getSelectedDeliveryOption()?.name}</dd>
                </div>
                {formData.reference && (
                    <div className="col-span-2">
                    <dt className="text-gray-500">Reference</dt>
                    <dd className="font-medium text-gray-900 mt-1">{formData.reference}</dd>
                    </div>
                )}
                </dl>
            </div>
            )}
        </div>

        <div 
            className="border border-gray-200 rounded-lg overflow-hidden"
            onClick={() => toggleSection("recipient")}
        >
            <div className="flex justify-between items-center p-4 cursor-pointer bg-gray-50">
            <div className="flex items-center">
                <User size={20} className="text-purple-600 mr-2" />
                <h3 className="font-medium text-gray-900 dark:text-white">Recipient Information</h3>
            </div>
            {expandedSection === "recipient" ? 
                <ChevronsUp size={20} className="text-gray-500" /> : 
                <ChevronsDown size={20} className="text-gray-500" />
            }
            </div>
            
            {expandedSection === "recipient" && (
            <div className="p-4 bg-white border-t border-gray-200">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div className="col-span-2">
                    <dt className="text-gray-500">Recipient Name</dt>
                    <dd className="font-medium text-gray-900 mt-1">{formData.recipientName}</dd>
                </div>
                <div className="col-span-2">
                    <dt className="text-gray-500">Account Number / IBAN</dt>
                    <dd className="font-medium text-gray-900 mt-1">{formData.recipientAccountNumber}</dd>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <dt className="text-gray-500">Bank Name</dt>
                    <dd className="font-medium text-gray-900 mt-1">{formData.bankName}</dd>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <dt className="text-gray-500">SWIFT/BIC Code</dt>
                    <dd className="font-medium text-gray-900 mt-1">{formData.swiftCode}</dd>
                </div>
                <div className="col-span-2">
                    <dt className="text-gray-500">Bank Address</dt>
                    <dd className="font-medium text-gray-900 mt-1">{formData.bankAddress}</dd>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <dt className="text-gray-500">Country</dt>
                    <dd className="font-medium text-gray-900 mt-1">
                    {selectedCountry?.flag} {selectedCountry?.name}
                    </dd>
                </div>
                {formData.intermediaryBank && (
                    <div className="col-span-2">
                    <dt className="text-gray-500">Intermediary Bank</dt>
                    <dd className="font-medium text-gray-900 mt-1">{formData.intermediaryBank}</dd>
                    </div>
                )}
                </dl>
            </div>
            )}
        </div>

        <div 
            className="border border-gray-200 rounded-lg overflow-hidden"
            onClick={() => toggleSection("fees")}
        >
            <div className="flex justify-between items-center p-4 cursor-pointer bg-gray-50">
            <div className="flex items-center">
                <DollarSign size={20} className="text-green-600 mr-2" />
                <h3 className="font-medium text-gray-900 dark:text-white">Fees & Timing</h3>
            </div>
            {expandedSection === "fees" ? 
                <ChevronsUp size={20} className="text-gray-500" /> : 
                <ChevronsDown size={20} className="text-gray-500" />
            }
            </div>
            
            {expandedSection === "fees" && (
            <div className="p-4 bg-white border-t border-gray-200">
                <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <dt className="text-gray-500">Transfer Amount</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">${parseFloat(formData.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-gray-500">Delivery Fee ({getSelectedDeliveryOption()?.name})</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">${getSelectedDeliveryOption()?.fee.toFixed(2)}</dd>
                </div>
                {formData.currency !== "USD" && (
                    <div className="flex justify-between">
                    <dt className="text-gray-500">Exchange Fee ({exchangeRateInfo.fee}%)</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">${((parseFloat(formData.amount) * exchangeRateInfo.fee) / 100).toFixed(2)}</dd>
                    </div>
                )}
                <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between font-medium">
                    <dt className="text-gray-800">Total Debited</dt>
                    <dd className="text-indigo-600 text-lg">
                        ${(parseFloat(formData.amount) + calculateTotalFees(parseFloat(formData.amount), formData.deliveryOption).total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </dd>
                    </div>
                </div>
                <div className="pt-2">
                    <div className="flex items-center text-sm">
                    <Clock size={16} className="text-indigo-600 mr-2" />
                    <span>Estimated arrival: {
                        formData.deliveryOption === "same-day" ? "Today" :
                        formData.deliveryOption === "express" ? "Tomorrow" :
                        "2-3 business days"
                    }</span>
                    </div>
                </div>
                </dl>
            </div>
            )}
        </div>

        {/* Warning notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
            <AlertTriangle size={20} className="text-yellow-600 mr-2 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">International transfer notice</p>
                <p>Once submitted, this transfer cannot be canceled. Please verify all details are correct before proceeding.</p>
            </div>
            </div>
        </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between">
        <motion.button
            type="button"
            className="flex items-center justify-center py-2 px-6 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBack}
        >
            <ArrowLeft size={16} className="mr-2" />
            <span>Back</span>
        </motion.button>
        
        <motion.button
            type="button"
            className="flex items-center justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSubmit(formData)}
        >
            <span>Confirm Transfer</span>
            <ArrowRight size={16} className="ml-2" />
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
    {transferSuccess ? (
        <motion.div 
        className="text-center py-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        >
        <motion.div variants={fadeInUp}>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <CheckCircle size={32} className="text-green-600" />
            </div>
        </motion.div>
        
        <motion.h2 variants={fadeInUp} className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Transfer Submitted Successfully</motion.h2>
        <motion.p variants={fadeInUp} className="mt-2 text-gray-600 dark:text-gray-400">Your international wire transfer has been submitted for processing</motion.p>
        
        <motion.div variants={fadeInUp} className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-800">
            <div className="flex justify-between mb-2">
                <span>Reference Number:</span>
                <span className="font-semibold">{referenceNumber}</span>
            </div>
            <div className="flex justify-between mb-2">
                <span>Amount Transferred:</span>
                <span className="font-semibold">${parseFloat(formData.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between mb-2">
                <span>Recipient Gets:</span>
                <span className="font-semibold">
                {selectedCurrency?.symbol}{calculateConvertedAmount(parseFloat(formData.amount), formData.currency).toLocaleString('en-US', { minimumFractionDigits: 2 })} {formData.currency}
                </span>
            </div>
            <div className="flex justify-between">
                <span>Estimated Arrival:</span>
                <span className="font-semibold">{
                formData.deliveryOption === "same-day" ? "Today" :
                formData.deliveryOption === "express" ? "Tomorrow" :
                "2-3 business days"
                }</span>
            </div>
            </div>
        </motion.div>
        
        <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap justify-center gap-4">
            <button
            type="button"
            className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => {}}
            >
            <Printer size={16} className="mr-2" />
            <span>Print Receipt</span>
            </button>
            
            <button
            type="button"
            className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => {}}
            >
            <Share2 size={16} className="mr-2" />
            <span>Share Details</span>
            </button>
            
            <button
            type="button"
            className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => {}}
            >
            <Copy size={16} className="mr-2" />
            <span>Copy Reference</span>
            </button>
        </motion.div>
        
        <motion.div variants={fadeInUp} className="mt-8">
            <button
            type="button"
            className="flex items-center justify-center mx-auto py-2 px-6 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handleNewTransfer}
            >
            <RefreshCw size={16} className="mr-2" />
            <span>New Transfer</span>
            </button>
        </motion.div>
        
        <motion.div variants={fadeInUp} className="mt-6 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
            <div className="flex">
            <Info size={16} className="text-blue-600 mr-2 flex-shrink-0" />
            <p>Your transfer is being processed. You will receive an email notification with updates. You can track your transfer status in the "Transaction History" section.</p>
            </div>
        </motion.div>
        </motion.div>
    ) : (
        <div className="text-center py-12">
        <div className="flex justify-center">
            <RefreshCw size={36} className="text-indigo-600 animate-spin" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Processing Your Transfer</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Please wait while we process your international wire transfer...</p>
        </div>
    )}
    </motion.div>
    )}
   
    </AnimatePresence>

    {/* FAQ section */}
    {step === 1 && (
    <motion.div 
    className="mt-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
    variants={fadeInUp}
    initial="initial"
    animate="animate"
    exit="exit"
    >
    <h2 className="text-lg font-semibold text-indigo-900 mb-4">Frequently Asked Questions</h2>
    
    <div className="space-y-4">
        <div className="border-b border-gray-200 pb-4">
        <button
            className="flex justify-between items-center w-full text-left font-medium text-indigo-900 focus:outline-none"
            onClick={() => toggleSection("faq1")}
        >
            <span>How long does an international transfer take?</span>
            {expandedSection === "faq1" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSection === "faq1" && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p>International transfers typically take 2-5 business days to complete, depending on the destination country, intermediary banks involved, and the selected delivery option. Same-day and express options are available for eligible countries at an additional fee.</p>
            </div>
        )}
        </div>
        
        <div className="border-b border-gray-200 pb-4">
        <button
            className="flex justify-between items-center w-full text-left font-medium text-indigo-900 focus:outline-none"
            onClick={() => toggleSection("faq2")}
        >
            <span>What information do I need for an international transfer?</span>
            {expandedSection === "faq2" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSection === "faq2" && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p>You'll need the recipient's full name, bank account number or IBAN, their bank's name, address, and SWIFT/BIC code. For some countries, additional information like routing numbers or sort codes may be required. Providing complete and accurate information helps ensure your transfer is processed without delays.</p>
            </div>
        )}
        </div>
        
        <div className="border-b border-gray-200 pb-4">
        <button
            className="flex justify-between items-center w-full text-left font-medium text-indigo-900 focus:outline-none"
            onClick={() => toggleSection("faq3")}
        >
            <span>What are the fees for international transfers?</span>
            {expandedSection === "faq3" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSection === "faq3" && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p>Fees consist of our service fee (based on delivery speed selected), potential exchange rate margin if currency conversion is involved, and sometimes intermediary bank fees. The exact amount is shown during the transfer process before confirmation. Premium account holders may receive preferential rates and fee waivers.</p>
            </div>
        )}
        </div>
        
        <div>
        <button
            className="flex justify-between items-center w-full text-left font-medium text-indigo-900 focus:outline-none"
            onClick={() => toggleSection("faq4")}
        >
            <span>Can I cancel an international transfer?</span>
            {expandedSection === "faq4" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSection === "faq4" && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p>Once submitted, international transfers can be difficult to cancel as they are processed quickly through the banking system. Contact our customer service immediately if you need to attempt a cancellation. A recall fee may apply, and we cannot guarantee funds can be recovered if the transfer has already been processed by intermediary banks.</p>
            </div>
        )}
        </div>
    </div>
    
    <div className="mt-6 text-center">
        <a href="#" className="text-indigo-600 hover:text-indigo-800 inline-flex items-center font-medium">
        <span>View all FAQs</span>
        <ExternalLink size={14} className="ml-1" />
        </a>
    </div>
    </motion.div>
    )}
    

        {/* Need help section */}
        <motion.div 
        className="mt-6 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-4 flex items-center justify-between"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        exit="exit"
        >
        <div className="flex items-center">
            <div className="rounded-full bg-white p-2 mr-4">
            <HelpCircle size={20} className="text-indigo-600" />
            </div>
            <div>
            <h3 className="font-medium text-indigo-900 dark:text-white">Need assistance?</h3>
            <p className="text-sm text-purple-700">Our international payments team is here to help</p>
            </div>
        </div>
        <button className="px-4 py-2 bg-white text-indigo-600 rounded-md shadow-sm hover:bg-indigo-50 font-medium text-sm">
            Contact Support
        </button>
        
        </motion.div>
        </div>
        </motion.div>
        
    );
};

export default InternationalWire;