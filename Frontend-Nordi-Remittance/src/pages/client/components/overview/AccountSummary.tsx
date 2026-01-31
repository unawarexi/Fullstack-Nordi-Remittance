import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, 
  DollarSign, 
  CreditCard, 
  ChevronDown, 
  ChevronRight,
  Eye, 
  EyeOff,
  Bitcoin,
  BarChart4
} from "lucide-react";

// Sample data structure for accounts
const accountsData = [
  {
    id: "savings1",
    name: "Primary Savings",
    number: "****5678",
    balance: 12450.75,
    currency: "USD",
    icon: <Wallet size={18} />,
    color: "bg-indigo-100 text-indigo-600"
  },
  {
    id: "checking1",
    name: "Everyday Checking",
    number: "****1234",
    balance: 3850.50,
    currency: "USD",
    icon: <DollarSign size={18} />,
    color: "bg-purple-100 text-purple-600"
  },
  {
    id: "business1",
    name: "Business Account",
    number: "****7890",
    balance: 24680.33,
    currency: "USD",
    icon: <BarChart4 size={18} />,
    color: "bg-pink-100 text-pink-600"
  },
  {
    id: "crypto1",
    name: "Crypto Wallet",
    number: "****9876",
    balance: 0.45,
    secondaryBalance: "16,425.00",
    currency: "BTC",
    secondaryCurrency: "USD",
    icon: <Bitcoin size={18} />,
    color: "bg-amber-100 text-amber-600"
  }
];

// Animation variants
const accountCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ 
    opacity: 1, 
    y: 0,
    transition: { 
      delay: i * 0.1,
      duration: 0.3,
      ease: "easeOut"
    }
  })
};

const AccountSummaryPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  
  // Calculate net worth
  const netWorth = accountsData.reduce((sum, account) => {
    // For crypto or other non-USD accounts, use the secondary balance in USD
    const balanceInUSD = account.secondaryBalance 
      ? parseFloat(account.secondaryBalance.replace(/,/g, '')) 
      : account.balance;
    
    return sum + balanceInUSD;
  }, 0);

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm p-4 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-indigo-900">Account Summary</h2>
          <p className="text-sm text-purple-500">Available balances across accounts</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
          </motion.button>
          <motion.button
            className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </motion.button>
        </div>
      </div>

      {/* Net Worth Display */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-purple-700">Total Net Worth</p>
            <h3 className="text-2xl font-bold text-indigo-900">
              {showBalance ? `$${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••'}
            </h3>
          </div>
          <motion.div 
            className="bg-white p-3 rounded-full shadow-sm"
            whileHover={{ scale: 1.05 }}
          >
            <CreditCard size={24} className="text-purple-500" />
          </motion.div>
        </div>
      </div>

      {/* Individual Accounts */}
      <motion.div 
        className="space-y-3"
        animate={{ height: isExpanded ? "auto" : "80px" }}
        initial={{ height: "80px" }}
        transition={{ duration: 0.3 }}
        style={{ overflow: "hidden" }}
      >
        {accountsData.map((account, index) => (
          <motion.div
            key={account.id}
            className="bg-white border border-indigo-100 rounded-lg p-3 flex justify-between items-center hover:shadow-sm transition-shadow"
            custom={index}
            variants={accountCardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ x: 3 }}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${account.color}`}>
                {account.icon}
              </div>
              <div>
                <h4 className="font-medium text-indigo-900">{account.name}</h4>
                <p className="text-xs text-gray-500">{account.number}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-indigo-900">
                {showBalance 
                  ? `${account.balance.toLocaleString()} ${account.currency}`
                  : '••••••'
                }
              </p>
              {account.secondaryBalance && (
                <p className="text-xs text-gray-500">
                  {showBalance ? `≈ $${account.secondaryBalance}` : '••••••'}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* View All Accounts Link */}
      {!isExpanded && (
        <motion.button
          className="w-full text-center text-sm text-purple-600 mt-2 hover:text-purple-800"
          whileHover={{ scale: 1.02 }}
          onClick={() => setIsExpanded(true)}
        >
          View All Accounts
        </motion.button>
      )}
    </motion.div>
  );
};

export default AccountSummaryPanel;