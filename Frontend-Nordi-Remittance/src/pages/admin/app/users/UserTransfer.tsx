/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  Wallet, 
  BanknoteIcon, 
  Database, 
  ArrowUpRight, 
  ArrowDownRight, 

  Clock, 
  AlertTriangle, 
  Ban, 
  Pause, 
  Check, 
  BarChart3, 
  DollarSign, 

  Bitcoin,
 
} from 'lucide-react';
import { getUserById, } from '@core/api/UserService';

// Define interfaces for various financial products
interface CardDetails {
  id: string;
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  cardType: string;
  issueDate: string;
  balance: number;
  limit: number;
  status: 'active' | 'blocked' | 'expired';
  transactions: Transaction[];
}

interface BankAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  accountType: string;
  balance: number;
  status: 'active' | 'blocked' | 'suspended';
  transactions: Transaction[];
}

interface Loan {
  id: string;
  loanType: string;
  amount: number;
  interestRate: number;
  term: number;
  startDate: string;
  endDate: string;
  monthlyPayment: number;
  remainingAmount: number;
  status: 'active' | 'paid' | 'defaulted' | 'paused';
  collateral?: string;
}

interface Investment {
  id: string;
  investmentType: string;
  amount: number;
  startDate: string;
  endDate: string;
  interestRate: number;
  expectedReturn: number;
  currentValue: number;
  status: 'active' | 'matured' | 'withdrawn';
}

interface CryptoWallet {
  id: string;
  walletAddress: string;
  currency: string;
  balance: number;
  dollarValue: number;
  status: 'active' | 'blocked';
}

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
}

interface UserFinancialData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
  cards: CardDetails[];
  bankAccounts: BankAccount[];
  loans: Loan[];
  investments: Investment[];
  cryptoWallets: CryptoWallet[];
}

// Main component
const UserTransfer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserFinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('cards');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string>('');
  const [modalData, setModalData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    amount: '',
    description: '',
    transferType: 'instant',
    scheduledDate: '',
    id: '',
  });
  
  // Alert state
  const [alert, setAlert] = useState<{type: string; message: string} | null>(null);

  useEffect(() => {
    if (id) {
      fetchUserFinancialData(id);
    }
  }, [id]);

  const fetchUserFinancialData = async (userId: string) => {
    setLoading(true);
    try {
      // In a real application, this would be a dedicated API endpoint
      // For now, we'll simulate by using the existing API and transforming the data
      const response = await getUserById(userId);
      const user = response.user ? response.user : response;
      
      // Transform or supplement the user data with financial information
      // In a real application, this would come from the API
      const enhancedUserData: UserFinancialData = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture || '',
        
        // Sample data for demonstration
        cards: [
          {
            id: 'card1',
            cardNumber: '4532 **** **** 1234',
            cardName: 'Visa Platinum',
            expiryDate: '12/26',
            cvv: '***',
            cardType: 'credit',
            issueDate: '12/21',
            balance: 2350.75,
            limit: 10000,
            status: 'active',
            transactions: generateTransactions(5, 'card')
          },
          {
            id: 'card2',
            cardNumber: '5412 **** **** 8765',
            cardName: 'Mastercard Gold',
            expiryDate: '09/25',
            cvv: '***',
            cardType: 'debit',
            issueDate: '09/22',
            balance: 1250.50,
            limit: 0,
            status: 'active',
            transactions: generateTransactions(3, 'card')
          },
          {
            id: 'card3',
            cardNumber: '3782 **** **** 1005',
            cardName: 'Amex Business',
            expiryDate: '05/24',
            cvv: '****',
            cardType: 'credit',
            issueDate: '05/21',
            balance: 4750.25,
            limit: 15000,
            status: 'blocked',
            transactions: generateTransactions(4, 'card')
          }
        ],
        
        bankAccounts: [
          {
            id: 'acct1',
            accountNumber: '1234567890',
            accountName: 'Premium Checking',
            bankName: 'Global Bank',
            accountType: 'checking',
            balance: 12456.78,
            status: 'active',
            transactions: generateTransactions(6, 'bank')
          },
          {
            id: 'acct2',
            accountNumber: '0987654321',
            accountName: 'High-Yield Savings',
            bankName: 'Global Bank',
            accountType: 'savings',
            balance: 45678.90,
            status: 'active',
            transactions: generateTransactions(4, 'bank')
          }
        ],
        
        loans: [
          {
            id: 'loan1',
            loanType: 'mortgage',
            amount: 350000,
            interestRate: 3.5,
            term: 30,
            startDate: '2020-06-15',
            endDate: '2050-06-15',
            monthlyPayment: 1568.42,
            remainingAmount: 325678.45,
            status: 'active'
          },
          {
            id: 'loan2',
            loanType: 'personal',
            amount: 25000,
            interestRate: 8.2,
            term: 5,
            startDate: '2022-03-10',
            endDate: '2027-03-10',
            monthlyPayment: 508.33,
            remainingAmount: 19750.25,
            status: 'active'
          }
        ],
        
        investments: [
          {
            id: 'inv1',
            investmentType: 'stock_portfolio',
            amount: 50000,
            startDate: '2022-01-15',
            endDate: '',
            interestRate: 0,
            expectedReturn: 7.5,
            currentValue: 54250.75,
            status: 'active'
          },
          {
            id: 'inv2',
            investmentType: 'certificate_of_deposit',
            amount: 25000,
            startDate: '2023-05-20',
            endDate: '2025-05-20',
            interestRate: 4.2,
            expectedReturn: 2125.50,
            currentValue: 26050.25,
            status: 'active'
          }
        ],
        
        cryptoWallets: [
          {
            id: 'crypto1',
            walletAddress: '0x72A53cDa2Cf8Bq5c7A...',
            currency: 'BTC',
            balance: 0.75,
            dollarValue: 29250.45,
            status: 'active'
          },
          {
            id: 'crypto2',
            walletAddress: '0x83B64dEa3Dx9Ap6b2B...',
            currency: 'ETH',
            balance: 12.5,
            dollarValue: 23750.80,
            status: 'active'
          }
        ]
      };
      
      setUserData(enhancedUserData);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch user financial data:', error);
      setError('Failed to load user financial information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate random transactions for demo purposes
  function generateTransactions(count: number, type: string): Transaction[] {
    const transactions: Transaction[] = [];
    const descriptions = type === 'card' 
      ? ['Amazon Purchase', 'Restaurant Payment', 'Grocery Store', 'Online Subscription', 'Gas Station', 'Department Store'] 
      : ['Direct Deposit', 'Bill Payment', 'Wire Transfer', 'ATM Withdrawal', 'Online Transfer', 'Check Deposit'];
    
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      transactions.push({
        id: `trans${Math.random().toString(36).substring(2, 9)}`,
        date: date.toISOString(),
        amount: parseFloat((Math.random() * 1000).toFixed(2)),
        type: Math.random() > 0.5 ? 'credit' : 'debit',
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        status: Math.random() > 0.2 ? 'completed' : (Math.random() > 0.5 ? 'pending' : 'failed'),
        reference: `REF${Math.floor(Math.random() * 10000000)}`
      });
    }
    
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const openModal = (type: string, data: any = null) => {
    setModalType(type);
    setModalData(data);
    setFormData({
      ...formData,
      amount: '',
      description: '',
      transferType: 'instant',
      scheduledDate: '',
      id: data?.id || ''
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType('');
    setModalData(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real application, these would be API calls
    // For this demo, we'll update the state directly
    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount)) {
      setAlert({type: 'error', message: 'Please enter a valid amount'});
      return;
    }
    
    const updatedUserData = { ...userData };
    let successMessage = '';
    
    try {
      switch (modalType) {
        case 'addCardFunds': {
          const cardIndex = updatedUserData.cards.findIndex(card => card.id === modalData.id);
          if (cardIndex !== -1) {
            updatedUserData.cards[cardIndex].balance += numAmount;
            successMessage = `Added $${numAmount.toFixed(2)} to ${modalData.cardName}`;
          }
          break;
        }
        case 'removeCardFunds': {
          const cardIndex = updatedUserData.cards.findIndex(card => card.id === modalData.id);
          if (cardIndex !== -1) {
            if (updatedUserData.cards[cardIndex].balance < numAmount) {
              throw new Error('Insufficient funds');
            }
            updatedUserData.cards[cardIndex].balance -= numAmount;
            successMessage = `Removed $${numAmount.toFixed(2)} from ${modalData.cardName}`;
          }
          break;
        }
        case 'upgradeCard': {
          const cardIndex = updatedUserData.cards.findIndex(card => card.id === modalData.id);
          if (cardIndex !== -1) {
            updatedUserData.cards[cardIndex].limit += numAmount;
            successMessage = `Upgraded ${modalData.cardName} with increased limit of $${numAmount.toFixed(2)}`;
          }
          break;
        }
        case 'addBankFunds': {
          const acctIndex = updatedUserData.bankAccounts.findIndex(acct => acct.id === modalData.id);
          if (acctIndex !== -1) {
            updatedUserData.bankAccounts[acctIndex].balance += numAmount;
            successMessage = `Added $${numAmount.toFixed(2)} to ${modalData.accountName}`;
          }
          break;
        }
        case 'removeBankFunds': {
          const acctIndex = updatedUserData.bankAccounts.findIndex(acct => acct.id === modalData.id);
          if (acctIndex !== -1) {
            if (updatedUserData.bankAccounts[acctIndex].balance < numAmount) {
              throw new Error('Insufficient funds');
            }
            updatedUserData.bankAccounts[acctIndex].balance -= numAmount;
            successMessage = `Removed $${numAmount.toFixed(2)} from ${modalData.accountName}`;
          }
          break;
        }
        case 'clearLoanDebt': {
          const loanIndex = updatedUserData.loans.findIndex(loan => loan.id === modalData.id);
          if (loanIndex !== -1) {
            if (numAmount > updatedUserData.loans[loanIndex].remainingAmount) {
              updatedUserData.loans[loanIndex].remainingAmount = 0;
              updatedUserData.loans[loanIndex].status = 'paid';
              successMessage = `Paid off the entire loan for ${modalData.loanType}`;
            } else {
              updatedUserData.loans[loanIndex].remainingAmount -= numAmount;
              successMessage = `Reduced $${numAmount.toFixed(2)} from ${modalData.loanType} loan`;
            }
          }
          break;
        }
        case 'addInvestment': {
          const invIndex = updatedUserData.investments.findIndex(inv => inv.id === modalData.id);
          if (invIndex !== -1) {
            updatedUserData.investments[invIndex].amount += numAmount;
            updatedUserData.investments[invIndex].currentValue += numAmount;
            successMessage = `Added $${numAmount.toFixed(2)} to ${modalData.investmentType} investment`;
          }
          break;
        }
        case 'addCryptoFunds': {
          const cryptoIndex = updatedUserData.cryptoWallets.findIndex(crypto => crypto.id === modalData.id);
          if (cryptoIndex !== -1) {
            const cryptoAmount = numAmount / 39000; // Simplified conversion for BTC
            updatedUserData.cryptoWallets[cryptoIndex].balance += cryptoAmount;
            updatedUserData.cryptoWallets[cryptoIndex].dollarValue += numAmount;
            successMessage = `Added $${numAmount.toFixed(2)} (${cryptoAmount.toFixed(8)} ${modalData.currency}) to wallet`;
          }
          break;
        }
        case 'removeCryptoFunds': {
          const cryptoIndex = updatedUserData.cryptoWallets.findIndex(crypto => crypto.id === modalData.id);
          if (cryptoIndex !== -1) {
            if (updatedUserData.cryptoWallets[cryptoIndex].dollarValue < numAmount) {
              throw new Error('Insufficient funds');
            }
            const cryptoAmount = numAmount / 39000; // Simplified conversion for BTC
            updatedUserData.cryptoWallets[cryptoIndex].balance -= cryptoAmount;
            updatedUserData.cryptoWallets[cryptoIndex].dollarValue -= numAmount;
            successMessage = `Removed $${numAmount.toFixed(2)} (${cryptoAmount.toFixed(8)} ${modalData.currency}) from wallet`;
          }
          break;
        }
        default:
          throw new Error('Unknown action type');
      }
      
      // Update the state with the modified data
      setUserData(updatedUserData);
      
      // Close the modal and show success message
      closeModal();
      setAlert({type: 'success', message: successMessage});
      
      // Reset alert after 5 seconds
      setTimeout(() => {
        setAlert(null);
      }, 5000);
      
    } catch (error) {
      setAlert({type: 'error', message: error.message || 'An error occurred'});
    }
  };

  const handleStatusChange = (type: string, id: string, newStatus: string) => {
    const updatedUserData = { ...userData };
    let successMessage = '';
    
    try {
      switch (type) {
        case 'card': {
          const cardIndex = updatedUserData.cards.findIndex(card => card.id === id);
          if (cardIndex !== -1) {
            updatedUserData.cards[cardIndex].status = newStatus as any;
            successMessage = `Card status updated to ${newStatus}`;
          }
          break;
        }
        case 'bank': {
          const acctIndex = updatedUserData.bankAccounts.findIndex(acct => acct.id === id);
          if (acctIndex !== -1) {
            updatedUserData.bankAccounts[acctIndex].status = newStatus as any;
            successMessage = `Bank account status updated to ${newStatus}`;
          }
          break;
        }
        case 'loan': {
          const loanIndex = updatedUserData.loans.findIndex(loan => loan.id === id);
          if (loanIndex !== -1) {
            updatedUserData.loans[loanIndex].status = newStatus as any;
            successMessage = `Loan status updated to ${newStatus}`;
          }
          break;
        }
        case 'investment': {
          const invIndex = updatedUserData.investments.findIndex(inv => inv.id === id);
          if (invIndex !== -1) {
            updatedUserData.investments[invIndex].status = newStatus as any;
            successMessage = `Investment status updated to ${newStatus}`;
          }
          break;
        }
        case 'crypto': {
          const cryptoIndex = updatedUserData.cryptoWallets.findIndex(crypto => crypto.id === id);
          if (cryptoIndex !== -1) {
            updatedUserData.cryptoWallets[cryptoIndex].status = newStatus as any;
            successMessage = `Crypto wallet status updated to ${newStatus}`;
          }
          break;
        }
        default:
          throw new Error('Unknown type');
      }
      
      // Update the state with the modified data
      setUserData(updatedUserData);
      setAlert({type: 'success', message: successMessage});
      
      // Reset alert after 5 seconds
      setTimeout(() => {
        setAlert(null);
      }, 5000);
      
    } catch (error) {
      setAlert({type: 'error', message: error.message || 'An error occurred'});
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'blocked':
      case 'defaulted':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'expired':
      case 'withdrawn':
        return 'bg-slate-100 text-slate-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
      case 'suspended':
        return 'bg-orange-100 text-orange-800';
      case 'matured':
        return 'bg-purple-100 text-purple-800';
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
          <p className="text-slate-600">Loading user financial data...</p>
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
            onClick={() => navigate(`/admin/users/${id}`)}
          >
            Back to User Details
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center max-w-md p-6 bg-slate-50 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">User Financial Data Not Found</h2>
          <p className="text-slate-600 mb-4">The requested user's financial information could not be found.</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-slate-50 rounded-lg hover:bg-blue-700"
            onClick={() => navigate(`/admin/users/${id}`)}
          >
            Back to User Details
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
            onClick={() => navigate(`/admin/users/${id}`)}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">User Financial Management</h1>
            <p className="text-slate-500">
              Manage funds and financial products for {userData.firstName} {userData.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200">
            {userData.profilePicture ? (
              <img src={userData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                <User size={20} className="text-slate-400" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-sm">{userData.firstName} {userData.lastName}</p>
            <p className="text-slate-500 text-xs">{userData.email}</p>
          </div>
        </div>
      </motion.div>

      {/* Alert message */}
      {alert && (
        <motion.div 
          className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
            alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center">
            {alert.type === 'success' ? (
              <Check size={20} className="mr-2" />
            ) : (
              <AlertTriangle size={20} className="mr-2" />
            )}
            <span>{alert.message}</span>
          </div>
          <button onClick={() => setAlert(null)} className="text-sm font-medium">
            Dismiss
          </button>
        </motion.div>
      )}
      
      {/* Tabs Navigation */}
      <motion.div 
        className="flex border-b border-slate-200 mb-6 overflow-x-auto"
        variants={itemVariants}
      >
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'cards' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('cards')}
        >
          <div className="flex items-center">
            <CreditCard size={16} className="mr-2" />
            Cards
          </div>
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'bank' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('bank')}
        >
          <div className="flex items-center">
            <BanknoteIcon size={16} className="mr-2" />
            Bank Accounts
          </div>
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'loans' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('loans')}
        >
          <div className="flex items-center">
            <Database size={16} className="mr-2" />
            Loans
          </div>
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'investments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('investments')}
        >
          <div className="flex items-center">
            <BarChart3 size={16} className="mr-2" />
            Investments
          </div>
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'crypto' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('crypto')}
        >
          <div className="flex items-center">
            <Bitcoin size={16} className="mr-2" />
            Crypto Wallets
          </div>
        </button>
      </motion.div>
      
      {/* Cards Tab */}
      {activeTab === 'cards' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {userData.cards.map((card) => (
              <motion.div 
                key={card.id}
                className={`bg-slate-50 rounded-lg shadow-sm p-6 border border-slate-200 ${
                  card.status === 'blocked' ? 'bg-slate-50 border-red-200' : 
                  card.status === 'expired' ? 'bg-slate-50 border-slate-300' : ''
                }`}
                whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              >
               <div className="flex justify-between items-start mb-4">
  <div>
    <h3 className="font-medium text-lg">{card.cardName}</h3>
    <p className="text-slate-500 text-sm">{card.cardNumber}</p>
  </div>
  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(card.status)}`}>
    {card.status}
  </span>
</div>

<div className="mb-4">
  <div className="text-sm text-slate-500 mb-1">Balance</div>
  <div className="text-2xl font-semibold">{formatCurrency(card.balance)}</div>
</div>

<div className="grid grid-cols-3 gap-4 mb-6 text-sm">
  <div>
    <div className="text-slate-500">Type</div>
    <div className="font-medium capitalize">{card.cardType}</div>
  </div>
  <div>
    <div className="text-slate-500">Expires</div>
    <div className="font-medium">{card.expiryDate}</div>
  </div>
  <div>
    <div className="text-slate-500">Limit</div>
    <div className="font-medium">{formatCurrency(card.limit)}</div>
  </div>
</div>

<div className="flex flex-wrap gap-2">
  <button
    onClick={() => openModal('addCardFunds', card)}
    disabled={card.status !== 'active'}
    className={`px-3 py-2 text-xs rounded-md flex items-center ${
      card.status === 'active' 
        ? 'bg-green-50 text-green-700 hover:bg-green-100' 
        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
    }`}
  >
    <ArrowDownRight size={14} className="mr-1" />
    Add Funds
  </button>
  <button
    onClick={() => openModal('removeCardFunds', card)}
    disabled={card.status !== 'active'}
    className={`px-3 py-2 text-xs rounded-md flex items-center ${
      card.status === 'active' 
        ? 'bg-red-50 text-red-700 hover:bg-red-100' 
        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
    }`}
  >
    <ArrowUpRight size={14} className="mr-1" />
    Remove Funds
  </button>
  <button
    onClick={() => openModal('upgradeCard', card)}
    disabled={card.status !== 'active' || card.cardType !== 'credit'}
    className={`px-3 py-2 text-xs rounded-md flex items-center ${
      card.status === 'active' && card.cardType === 'credit'
        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
    }`}
  >
    <ArrowUpRight size={14} className="mr-1" />
    Upgrade Limit
  </button>
</div>

<div className="mt-4 pt-4 border-t border-slate-200">
  <div className="flex justify-between items-center mb-2">
    <span className="text-sm font-medium">Status Control</span>
  </div>
  <div className="flex gap-2">
    {card.status !== 'active' && (
      <button
        onClick={() => handleStatusChange('card', card.id, 'active')}
        className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded-md hover:bg-green-100 flex items-center"
      >
        <Check size={12} className="mr-1" />
        Activate
      </button>
    )}
    {card.status !== 'blocked' && (
      <button
        onClick={() => handleStatusChange('card', card.id, 'blocked')}
        className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded-md hover:bg-red-100 flex items-center"
      >
        <Ban size={12} className="mr-1" />
        Block
      </button>
    )}
  </div>
</div>
</motion.div>
            ))}
          </div>
          
          <div className="bg-slate-50 rounded-lg shadow-sm p-6 border border-slate-200">
            <h3 className="font-medium text-lg mb-4">Recent Card Transactions</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-50 divide-y divide-slate-200">
                  {userData.cards.flatMap(card => card.transactions).slice(0, 5).map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {transaction.description}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        transaction.type === 'credit' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Bank Accounts Tab */}
      {activeTab === 'bank' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {userData.bankAccounts.map((account) => (
              <motion.div 
                key={account.id}
                className={`bg-slate-50 rounded-lg shadow-sm p-6 border border-slate-200 ${
                  account.status === 'blocked' ? 'bg-slate-50 border-red-200' : 
                  account.status === 'suspended' ? 'bg-slate-50 border-orange-200' : ''
                }`}
                whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-lg">{account.accountName}</h3>
                    <p className="text-slate-500 text-sm">{account.accountNumber}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(account.status)}`}>
                    {account.status}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-slate-500 mb-1">Balance</div>
                  <div className="text-2xl font-semibold">{formatCurrency(account.balance)}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <div className="text-slate-500">Bank</div>
                    <div className="font-medium">{account.bankName}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Type</div>
                    <div className="font-medium capitalize">{account.accountType}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openModal('addBankFunds', account)}
                    disabled={account.status !== 'active'}
                    className={`px-3 py-2 text-xs rounded-md flex items-center ${
                      account.status === 'active' 
                        ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <ArrowDownRight size={14} className="mr-1" />
                    Add Funds
                  </button>
                  <button
                    onClick={() => openModal('removeBankFunds', account)}
                    disabled={account.status !== 'active'}
                    className={`px-3 py-2 text-xs rounded-md flex items-center ${
                      account.status === 'active' 
                        ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUpRight size={14} className="mr-1" />
                    Remove Funds
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Status Control</span>
                  </div>
                  <div className="flex gap-2">
                    {account.status !== 'active' && (
                      <button
                        onClick={() => handleStatusChange('bank', account.id, 'active')}
                        className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded-md hover:bg-green-100 flex items-center"
                      >
                        <Check size={12} className="mr-1" />
                        Activate
                      </button>
                    )}
                    {account.status !== 'blocked' && (
                      <button
                        onClick={() => handleStatusChange('bank', account.id, 'blocked')}
                        className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded-md hover:bg-red-100 flex items-center"
                      >
                        <Ban size={12} className="mr-1" />
                        Block
                      </button>
                    )}
                    {account.status !== 'suspended' && (
                      <button
                        onClick={() => handleStatusChange('bank', account.id, 'suspended')}
                        className="px-3 py-1 text-xs bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 flex items-center"
                      >
                        <Pause size={12} className="mr-1" />
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="bg-slate-50 rounded-lg shadow-sm p-6 border border-slate-200">
            <h3 className="font-medium text-lg mb-4">Recent Bank Transactions</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-50 divide-y divide-slate-200">
                  {userData.bankAccounts.flatMap(acct => acct.transactions).slice(0, 5).map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {transaction.description}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        transaction.type === 'credit' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Loans Tab */}
      {activeTab === 'loans' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userData.loans.map((loan) => (
              <motion.div 
                key={loan.id}
                className={`bg-slate-50 rounded-lg shadow-sm p-6 border border-slate-200 ${
                  loan.status === 'defaulted' ? 'bg-slate-50 border-red-200' : 
                  loan.status === 'paused' ? 'bg-slate-50 border-orange-200' : 
                  loan.status === 'paid' ? 'bg-slate-50 border-green-200' : ''
                }`}
                whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-lg capitalize">{loan.loanType} Loan</h3>
                    <p className="text-slate-500 text-sm">
                      Term: {loan.term} years at {loan.interestRate}% APR
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(loan.status)}`}>
                    {loan.status}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-slate-500 mb-1">Remaining Amount</div>
                  <div className="text-2xl font-semibold">{formatCurrency(loan.remainingAmount)}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Original Amount: {formatCurrency(loan.amount)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                  <div>
                    <div className="text-slate-500">Monthly Payment</div>
                    <div className="font-medium">{formatCurrency(loan.monthlyPayment)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Start Date</div>
                    <div className="font-medium">{formatDate(loan.startDate).split(',')[0]}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">End Date</div>
                    <div className="font-medium">{formatDate(loan.endDate).split(',')[0]}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('clearLoanDebt', loan)}
                    disabled={loan.status !== 'active' && loan.status !== 'paused'}
                    className={`px-3 py-2 text-xs rounded-md flex items-center ${
                      loan.status === 'active' || loan.status === 'paused'
                        ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <DollarSign size={14} className="mr-1" />
                    Make Payment
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Status Control</span>
                  </div>
                  <div className="flex gap-2">
                    {(loan.status !== 'active' && loan.status !== 'paid') && (
                      <button
                        onClick={() => handleStatusChange('loan', loan.id, 'active')}
                        className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded-md hover:bg-green-100 flex items-center"
                      >
                        <Check size={12} className="mr-1" />
                        Activate
                      </button>
                    )}
                    {loan.status !== 'paused' && loan.status !== 'paid' && (
                      <button
                        onClick={() => handleStatusChange('loan', loan.id, 'paused')}
                        className="px-3 py-1 text-xs bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 flex items-center"
                      >
                        <Pause size={12} className="mr-1" />
                        Pause
                      </button>
                    )}
                    {loan.status !== 'defaulted' && loan.status !== 'paid' && (
                      <button
                        onClick={() => handleStatusChange('loan', loan.id, 'defaulted')}
                        className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded-md hover:bg-red-100 flex items-center"
                      >
                        <AlertTriangle size={12} className="mr-1" />
                        Mark Defaulted
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Investments Tab */}
      {activeTab === 'investments' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userData.investments.map((investment) => (
              <motion.div 
                key={investment.id}
                className={`bg-slate-50 rounded-lg shadow-sm p-6 border border-slate-200 ${
                  investment.status === 'withdrawn' ? 'bg-slate-50 border-slate-300' : 
                  investment.status === 'matured' ? 'bg-slate-50 border-purple-200' : ''
                }`}
                whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-lg">{investment.investmentType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h3>
                    <p className="text-slate-500 text-sm">
                      Started: {formatDate(investment.startDate).split(',')[0]}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(investment.status)}`}>
                    {investment.status}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-slate-500 mb-1">Current Value</div>
                  <div className="text-2xl font-semibold">{formatCurrency(investment.currentValue)}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Initial Investment: {formatCurrency(investment.amount)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <div className="text-slate-500">Interest Rate</div>
                    <div className="font-medium">{investment.interestRate}%</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Expected Return</div>
                    <div className="font-medium">{formatCurrency(investment.expectedReturn)}</div>
                  </div>
                  {investment.endDate && (
                    <div>
                      <div className="text-slate-500">End Date</div>
                      <div className="font-medium">{formatDate(investment.endDate).split(',')[0]}</div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('addInvestment', investment)}
                    disabled={investment.status !== 'active'}
                    className={`px-3 py-2 text-xs rounded-md flex items-center ${
                      investment.status === 'active'
                        ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <ArrowDownRight size={14} className="mr-1" />
                    Add Funds
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Status Control</span>
                  </div>
                  <div className="flex gap-2">
                    {investment.status !== 'active' && investment.status !== 'withdrawn' && (
                      <button
                        onClick={() => handleStatusChange('investment', investment.id, 'active')}
                        className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded-md hover:bg-green-100 flex items-center"
                      >
                        <Check size={12} className="mr-1" />
                        Activate
                      </button>
                    )}
                    {investment.status !== 'matured' && investment.status !== 'withdrawn' && (
                      <button
                        onClick={() => handleStatusChange('investment', investment.id, 'matured')}
                        className="px-3 py-1 text-xs bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 flex items-center"
                      >
                        <Clock size={12} className="mr-1" />
                        Mark Matured
                      </button>
                    )}
                    {investment.status !== 'withdrawn' && (
                      <button
                        onClick={() => handleStatusChange('investment', investment.id, 'withdrawn')}
                        className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 flex items-center"
                      >
                        <Wallet size={12} className="mr-1" />
                        Mark Withdrawn
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Crypto Tab */}
      {activeTab === 'crypto' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userData.cryptoWallets.map((wallet) => (
              <motion.div 
                key={wallet.id}
                className={`bg-slate-50 rounded-lg shadow-sm p-6 border border-slate-200 ${
                  wallet.status === 'blocked' ? 'bg-slate-50 border-red-200' : ''
                }`}
                whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-lg">{wallet.currency} Wallet</h3>
                    <p className="text-slate-500 text-sm text-ellipsis overflow-hidden" title={wallet.walletAddress}>
                      {wallet.walletAddress}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(wallet.status)}`}>
                    {wallet.status}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-slate-500 mb-1">Balance</div>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-semibold">{wallet.balance.toFixed(8)}</span>
                    <span className="ml-1 text-lg">{wallet.currency}</span>
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    ≈ {formatCurrency(wallet.dollarValue)}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('addCryptoFunds', wallet)}
                    disabled={wallet.status !== 'active'}
                    className={`px-3 py-2 text-xs rounded-md flex items-center ${
                      wallet.status === 'active'
                        ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <ArrowDownRight size={14} className="mr-1" />
                    Add Funds
                  </button>
                  <button
                    onClick={() => openModal('removeCryptoFunds', wallet)}
                    disabled={wallet.status !== 'active'}
                    className={`px-3 py-2 text-xs rounded-md flex items-center ${
                      wallet.status === 'active'
                        ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUpRight size={14} className="mr-1" />
                    Remove Funds
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Status Control</span>
                  </div>
                  <div className="flex gap-2">
                    {wallet.status !== 'active' && (
                      <button
                        onClick={() => handleStatusChange('crypto', wallet.id, 'active')}
                        className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded-md hover:bg-green-100 flex items-center"
                      >
                        <Check size={12} className="mr-1" />
                        Activate
                      </button>
                    )}
                    {wallet.status !== 'blocked' && (
                      <button
                        onClick={() => handleStatusChange('crypto', wallet.id, 'blocked')}
                        className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded-md hover:bg-red-100 flex items-center"
                      >
                        <Ban size={12} className="mr-1" />
                        Block
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950 bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-slate-50 rounded-lg p-6 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}  
            transition={{ duration: 0.3 }}
         
          >
            <h2 className="text-xl font-semibold mb-4">
              {modalType === 'addCardFunds' && `Add Funds to ${modalData.cardName}`}
              {modalType === 'removeCardFunds' && `Remove Funds from ${modalData.cardName}`}
              {modalType === 'upgradeCard' && `Upgrade Limit for ${modalData.cardName}`}
              {modalType === 'addBankFunds' && `Add Funds to ${modalData.accountName}`}
              {modalType === 'removeBankFunds' && `Remove Funds from ${modalData.accountName}`}
              {modalType === 'clearLoanDebt' && `Make Payment on ${modalData.loanType} Loan`}
              {modalType === 'addInvestment' && `Add Funds to ${modalData.investmentType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`}
              {modalType === 'addCryptoFunds' && `Add Funds to ${modalData.currency} Wallet`}
              {modalType === 'removeCryptoFunds' && `Remove Funds from ${modalData.currency} Wallet`}
            </h2>
            
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="0.01"
                    step="0.01"
                    className="pl-7 block w-full py-2 px-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
                {modalType === 'clearLoanDebt' && (
                  <p className="text-xs text-slate-500 mt-1">
                    Remaining balance: {formatCurrency(modalData.remainingAmount)}
                  </p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  className="block w-full py-2 px-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Add a note"
                ></textarea>
              </div>
              
              {(modalType === 'addCardFunds' || modalType === 'addBankFunds' || modalType === 'removeBankFunds' || modalType === 'removeCardFunds') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Transfer Type
                  </label>
                  <select
                    name="transferType"
                    value={formData.transferType}
                    onChange={handleInputChange}
                    className="block w-full py-2 px-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="instant">Instant Transfer</option>
                    <option value="scheduled">Scheduled Transfer</option>
                  </select>
                </div>
              )}
              
              {formData.transferType === 'scheduled' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="block w-full py-2 px-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              )}
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-300 rounded-md hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-slate-50 bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default UserTransfer;