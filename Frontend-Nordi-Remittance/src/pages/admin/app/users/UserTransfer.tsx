/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
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
import useThemeStore from '@store/theme.store';
import { useUserFinancialData, type UserFinancialData } from '../../domain/useUserFinancialData';
import { Card as UICard } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Modal } from '@components/ui/Modal';
import { Spinner } from '@components/ui/Spinner';

// Main component
const UserTransfer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();
  const { userData, loading, error, updateFinancialData } = useUserFinancialData(id || '');
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
    
    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount)) {
      setAlert({type: 'error', message: 'Please enter a valid amount'});
      return;
    }
    
    try {
      updateFinancialData((prev: UserFinancialData) => {
        const updated = { ...prev };
        let successMessage = '';

        switch (modalType) {
          case 'addCardFunds': {
            updated.cards = updated.cards.map(card =>
              card.id === modalData.id ? { ...card, balance: card.balance + numAmount } : card
            );
            successMessage = `Added $${numAmount.toFixed(2)} to ${modalData.cardName}`;
            break;
          }
          case 'removeCardFunds': {
            const card = updated.cards.find(c => c.id === modalData.id);
            if (card && card.balance < numAmount) throw new Error('Insufficient funds');
            updated.cards = updated.cards.map(card =>
              card.id === modalData.id ? { ...card, balance: card.balance - numAmount } : card
            );
            successMessage = `Removed $${numAmount.toFixed(2)} from ${modalData.cardName}`;
            break;
          }
          case 'upgradeCard': {
            updated.cards = updated.cards.map(card =>
              card.id === modalData.id ? { ...card, limit: card.limit + numAmount } : card
            );
            successMessage = `Upgraded ${modalData.cardName} with increased limit of $${numAmount.toFixed(2)}`;
            break;
          }
          case 'addBankFunds': {
            updated.bankAccounts = updated.bankAccounts.map(acct =>
              acct.id === modalData.id ? { ...acct, balance: acct.balance + numAmount } : acct
            );
            successMessage = `Added $${numAmount.toFixed(2)} to ${modalData.accountName}`;
            break;
          }
          case 'removeBankFunds': {
            const acct = updated.bankAccounts.find(a => a.id === modalData.id);
            if (acct && acct.balance < numAmount) throw new Error('Insufficient funds');
            updated.bankAccounts = updated.bankAccounts.map(acct =>
              acct.id === modalData.id ? { ...acct, balance: acct.balance - numAmount } : acct
            );
            successMessage = `Removed $${numAmount.toFixed(2)} from ${modalData.accountName}`;
            break;
          }
          case 'clearLoanDebt': {
            updated.loans = updated.loans.map(loan => {
              if (loan.id !== modalData.id) return loan;
              if (numAmount > loan.remainingAmount) return { ...loan, remainingAmount: 0, status: 'paid' as const };
              return { ...loan, remainingAmount: loan.remainingAmount - numAmount };
            });
            successMessage = `Payment applied to ${modalData.loanType} loan`;
            break;
          }
          case 'addInvestment': {
            updated.investments = updated.investments.map(inv =>
              inv.id === modalData.id ? { ...inv, amount: inv.amount + numAmount, currentValue: inv.currentValue + numAmount } : inv
            );
            successMessage = `Added $${numAmount.toFixed(2)} to investment`;
            break;
          }
          case 'addCryptoFunds': {
            const cryptoAmount = numAmount / 39000;
            updated.cryptoWallets = updated.cryptoWallets.map(w =>
              w.id === modalData.id ? { ...w, balance: w.balance + cryptoAmount, dollarValue: w.dollarValue + numAmount } : w
            );
            successMessage = `Added $${numAmount.toFixed(2)} to ${modalData.currency} wallet`;
            break;
          }
          case 'removeCryptoFunds': {
            const wallet = updated.cryptoWallets.find(w => w.id === modalData.id);
            if (wallet && wallet.dollarValue < numAmount) throw new Error('Insufficient funds');
            const cryptoAmount = numAmount / 39000;
            updated.cryptoWallets = updated.cryptoWallets.map(w =>
              w.id === modalData.id ? { ...w, balance: w.balance - cryptoAmount, dollarValue: w.dollarValue - numAmount } : w
            );
            successMessage = `Removed $${numAmount.toFixed(2)} from ${modalData.currency} wallet`;
            break;
          }
          default:
            throw new Error('Unknown action type');
        }

        setTimeout(() => {
          setAlert({type: 'success', message: successMessage});
          setTimeout(() => setAlert(null), 5000);
        }, 0);

        return updated;
      });
      
      closeModal();
    } catch (err: any) {
      setAlert({type: 'error', message: err.message || 'An error occurred'});
    }
  };

  const handleStatusChange = (type: string, itemId: string, newStatus: string) => {
    try {
      updateFinancialData((prev: UserFinancialData) => {
        const updated = { ...prev };
        let successMessage = '';
        
        switch (type) {
          case 'card':
            updated.cards = updated.cards.map(card =>
              card.id === itemId ? { ...card, status: newStatus as any } : card
            );
            successMessage = `Card status updated to ${newStatus}`;
            break;
          case 'bank':
            updated.bankAccounts = updated.bankAccounts.map(acct =>
              acct.id === itemId ? { ...acct, status: newStatus as any } : acct
            );
            successMessage = `Bank account status updated to ${newStatus}`;
            break;
          case 'loan':
            updated.loans = updated.loans.map(loan =>
              loan.id === itemId ? { ...loan, status: newStatus as any } : loan
            );
            successMessage = `Loan status updated to ${newStatus}`;
            break;
          case 'investment':
            updated.investments = updated.investments.map(inv =>
              inv.id === itemId ? { ...inv, status: newStatus as any } : inv
            );
            successMessage = `Investment status updated to ${newStatus}`;
            break;
          case 'crypto':
            updated.cryptoWallets = updated.cryptoWallets.map(w =>
              w.id === itemId ? { ...w, status: newStatus as any } : w
            );
            successMessage = `Crypto wallet status updated to ${newStatus}`;
            break;
          default:
            throw new Error('Unknown type');
        }

        setTimeout(() => {
          setAlert({type: 'success', message: successMessage});
          setTimeout(() => setAlert(null), 5000);
        }, 0);

        return updated;
      });
    } catch (err: any) {
      setAlert({type: 'error', message: err.message || 'An error occurred'});
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

  const getStatusVariant = (status: string): 'success' | 'error' | 'warning' | 'info' | 'default' | 'primary' => {
    switch(status.toLowerCase()) {
      case 'active': return 'success';
      case 'blocked': case 'defaulted': case 'failed': return 'error';
      case 'pending': case 'paused': case 'suspended': return 'warning';
      case 'paid': case 'completed': return 'info';
      case 'matured': return 'primary';
      default: return 'default';
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

  // Theme-aware class helpers
  const bg = isDarkMode ? 'bg-neutral-900' : 'bg-slate-50';
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = isDarkMode ? 'text-neutral-400' : 'text-slate-500';
  const textMuted = isDarkMode ? 'text-neutral-500' : 'text-slate-400';
  const borderColor = isDarkMode ? 'border-neutral-700' : 'border-slate-200';
  const borderColorAlt = isDarkMode ? 'border-neutral-600' : 'border-slate-300';
  const hoverBg = isDarkMode ? 'hover:bg-neutral-700' : 'hover:bg-slate-100';
  const tableBg = isDarkMode ? 'bg-neutral-800' : 'bg-slate-50';
  const tableRowBg = isDarkMode ? 'bg-neutral-800' : 'bg-slate-50';
  const dividerColor = isDarkMode ? 'divide-neutral-700' : 'divide-slate-200';

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${bg}`}>
        <Spinner size="lg" variant="primary" label="Loading user financial data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${bg}`}>
        <UICard size="lg" className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h2 className={`text-xl font-bold mb-2 ${textPrimary}`}>Error</h2>
          <p className={`${textSecondary} mb-4`}>{error}</p>
          <Button variant="primary" onClick={() => navigate(`/admin/users/${id}`)}>
            Back to User Details
          </Button>
        </UICard>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${bg}`}>
        <UICard size="lg" className="text-center max-w-md">
          <h2 className={`text-xl font-bold mb-2 ${textPrimary}`}>User Financial Data Not Found</h2>
          <p className={`${textSecondary} mb-4`}>The requested user's financial information could not be found.</p>
          <Button variant="primary" onClick={() => navigate(`/admin/users/${id}`)}>
            Back to User Details
          </Button>
        </UICard>
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
            className={`p-2 rounded-full ${hoverBg} mr-4`}
            onClick={() => navigate(`/admin/users/${id}`)}
          >
            <ArrowLeft size={20} className={textPrimary} />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>User Financial Management</h1>
            <p className={textSecondary}>
              Manage funds and financial products for {userData.firstName} {userData.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${borderColor}`}>
            {userData.profilePicture ? (
              <img src={userData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full ${isDarkMode ? 'bg-neutral-700' : 'bg-slate-200'} flex items-center justify-center`}>
                <User size={20} className={textMuted} />
              </div>
            )}
          </div>
          <div>
            <p className={`font-medium text-sm ${textPrimary}`}>{userData.firstName} {userData.lastName}</p>
            <p className={`${textSecondary} text-xs`}>{userData.email}</p>
          </div>
        </div>
      </motion.div>

      {/* Alert message */}
      {alert && (
        <motion.div 
          className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
            alert.type === 'success' 
              ? (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800') 
              : (isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800')
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
        className={`flex border-b ${borderColor} mb-6 overflow-x-auto`}
        variants={itemVariants}
      >
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'cards' ? (isDarkMode ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600') : `border-transparent ${textSecondary} ${hoverBg}`}`}
          onClick={() => setActiveTab('cards')}
        >
          <div className="flex items-center">
            <CreditCard size={16} className="mr-2" />
            Cards
          </div>
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'bank' ? (isDarkMode ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600') : `border-transparent ${textSecondary} ${hoverBg}`}`}
          onClick={() => setActiveTab('bank')}
        >
          <div className="flex items-center">
            <BanknoteIcon size={16} className="mr-2" />
            Bank Accounts
          </div>
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'loans' ? (isDarkMode ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600') : `border-transparent ${textSecondary} ${hoverBg}`}`}
          onClick={() => setActiveTab('loans')}
        >
          <div className="flex items-center">
            <Database size={16} className="mr-2" />
            Loans
          </div>
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'investments' ? (isDarkMode ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600') : `border-transparent ${textSecondary} ${hoverBg}`}`}
          onClick={() => setActiveTab('investments')}
        >
          <div className="flex items-center">
            <BarChart3 size={16} className="mr-2" />
            Investments
          </div>
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'crypto' ? (isDarkMode ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600') : `border-transparent ${textSecondary} ${hoverBg}`}`}
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
              <UICard 
                key={card.id}
                
                size="md"
                isHoverable
                className={`${
                  card.status === 'blocked' ? (isDarkMode ? 'border-red-800' : 'border-red-200') : 
                  card.status === 'expired' ? borderColorAlt : ''
                }`}
              >
               <div className="flex justify-between items-start mb-4">
  <div>
    <h3 className={`font-medium text-lg ${textPrimary}`}>{card.cardName}</h3>
    <p className={`${textSecondary} text-sm`}>{card.cardNumber}</p>
  </div>
  <Badge variant={getStatusVariant(card.status)} size="sm">
    {card.status}
  </Badge>
</div>

<div className="mb-4">
  <div className={`text-sm ${textSecondary} mb-1`}>Balance</div>
  <div className={`text-2xl font-semibold ${textPrimary}`}>{formatCurrency(card.balance)}</div>
</div>

<div className="grid grid-cols-3 gap-4 mb-6 text-sm">
  <div>
    <div className={textSecondary}>Type</div>
    <div className={`font-medium capitalize ${textPrimary}`}>{card.cardType}</div>
  </div>
  <div>
    <div className={textSecondary}>Expires</div>
    <div className={`font-medium ${textPrimary}`}>{card.expiryDate}</div>
  </div>
  <div>
    <div className={textSecondary}>Limit</div>
    <div className={`font-medium ${textPrimary}`}>{formatCurrency(card.limit)}</div>
  </div>
</div>

<div className="flex flex-wrap gap-2">
  <Button
    size="xs"
    variant={card.status === 'active' ? 'success' : 'ghost'}
    onClick={() => openModal('addCardFunds', card)}
    disabled={card.status !== 'active'}
  >
    <ArrowDownRight size={14} className="mr-1" />
    Add Funds
  </Button>
  <Button
    size="xs"
    variant={card.status === 'active' ? 'danger' : 'ghost'}
    onClick={() => openModal('removeCardFunds', card)}
    disabled={card.status !== 'active'}
  >
    <ArrowUpRight size={14} className="mr-1" />
    Remove Funds
  </Button>
  <Button
    size="xs"
    variant={card.status === 'active' && card.cardType === 'credit' ? 'primary' : 'ghost'}
    onClick={() => openModal('upgradeCard', card)}
    disabled={card.status !== 'active' || card.cardType !== 'credit'}
  >
    <ArrowUpRight size={14} className="mr-1" />
    Upgrade Limit
  </Button>
</div>

<div className={`mt-4 pt-4 border-t ${borderColor}`}>
  <div className="flex justify-between items-center mb-2">
    <span className={`text-sm font-medium ${textPrimary}`}>Status Control</span>
  </div>
  <div className="flex gap-2">
    {card.status !== 'active' && (
      <Button size="xs" variant="success" onClick={() => handleStatusChange('card', card.id, 'active')}>
        <Check size={12} className="mr-1" />
        Activate
      </Button>
    )}
    {card.status !== 'blocked' && (
      <Button size="xs" variant="danger" onClick={() => handleStatusChange('card', card.id, 'blocked')}>
        <Ban size={12} className="mr-1" />
        Block
      </Button>
    )}
  </div>
</div>
</UICard>
            ))}
          </div>
          
          <UICard size="md">
            <h3 className={`font-medium text-lg mb-4 ${textPrimary}`}>Recent Card Transactions</h3>
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${dividerColor}`}>
                <thead className={tableBg}>
                  <tr>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>Date</th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>Description</th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>Amount</th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>Status</th>
                  </tr>
                </thead>
                <tbody className={`${tableRowBg} divide-y ${dividerColor}`}>
                  {userData.cards.flatMap(card => card.transactions).slice(0, 5).map((transaction) => (
                    <tr key={transaction.id}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${textSecondary}`}>{formatDate(transaction.date)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${textPrimary}`}>{transaction.description}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.type === 'credit' ? (isDarkMode ? 'text-green-400' : 'text-green-700') : (isDarkMode ? 'text-red-400' : 'text-red-700')}`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge variant={getStatusVariant(transaction.status)} size="sm">{transaction.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </UICard>
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
              <UICard 
                key={account.id}
                
                size="md"
                isHoverable
                className={`${
                  account.status === 'blocked' ? (isDarkMode ? 'border-red-800' : 'border-red-200') : 
                  account.status === 'suspended' ? (isDarkMode ? 'border-orange-800' : 'border-orange-200') : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`font-medium text-lg ${textPrimary}`}>{account.accountName}</h3>
                    <p className={`${textSecondary} text-sm`}>{account.accountNumber}</p>
                  </div>
                  <Badge variant={getStatusVariant(account.status)} size="sm">{account.status}</Badge>
                </div>

                <div className="mb-4">
                  <div className={`text-sm ${textSecondary} mb-1`}>Balance</div>
                  <div className={`text-2xl font-semibold ${textPrimary}`}>{formatCurrency(account.balance)}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <div className={textSecondary}>Bank</div>
                    <div className={`font-medium ${textPrimary}`}>{account.bankName}</div>
                  </div>
                  <div>
                    <div className={textSecondary}>Type</div>
                    <div className={`font-medium capitalize ${textPrimary}`}>{account.accountType}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="xs" variant={account.status === 'active' ? 'success' : 'ghost'} onClick={() => openModal('addBankFunds', account)} disabled={account.status !== 'active'}>
                    <ArrowDownRight size={14} className="mr-1" />Add Funds
                  </Button>
                  <Button size="xs" variant={account.status === 'active' ? 'danger' : 'ghost'} onClick={() => openModal('removeBankFunds', account)} disabled={account.status !== 'active'}>
                    <ArrowUpRight size={14} className="mr-1" />Remove Funds
                  </Button>
                </div>

                <div className={`mt-4 pt-4 border-t ${borderColor}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${textPrimary}`}>Status Control</span>
                  </div>
                  <div className="flex gap-2">
                    {account.status !== 'active' && (
                      <Button size="xs" variant="success" onClick={() => handleStatusChange('bank', account.id, 'active')}>
                        <Check size={12} className="mr-1" />Activate
                      </Button>
                    )}
                    {account.status !== 'blocked' && (
                      <Button size="xs" variant="danger" onClick={() => handleStatusChange('bank', account.id, 'blocked')}>
                        <Ban size={12} className="mr-1" />Block
                      </Button>
                    )}
                    {account.status !== 'suspended' && (
                      <Button size="xs" variant="outline" onClick={() => handleStatusChange('bank', account.id, 'suspended')}>
                        <Pause size={12} className="mr-1" />Suspend
                      </Button>
                    )}
                  </div>
                </div>
              </UICard>
            ))}
          </div>
          
          <UICard size="md">
            <h3 className={`font-medium text-lg mb-4 ${textPrimary}`}>Recent Bank Transactions</h3>
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${dividerColor}`}>
                <thead className={tableBg}>
                  <tr>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>Date</th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>Description</th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>Amount</th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>Status</th>
                  </tr>
                </thead>
                <tbody className={`${tableRowBg} divide-y ${dividerColor}`}>
                  {userData.bankAccounts.flatMap(acct => acct.transactions).slice(0, 5).map((transaction) => (
                    <tr key={transaction.id}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${textSecondary}`}>{formatDate(transaction.date)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${textPrimary}`}>{transaction.description}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.type === 'credit' ? (isDarkMode ? 'text-green-400' : 'text-green-700') : (isDarkMode ? 'text-red-400' : 'text-red-700')}`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge variant={getStatusVariant(transaction.status)} size="sm">{transaction.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </UICard>
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
              <UICard 
                key={loan.id}
                
                size="md"
                isHoverable
                className={`${
                  loan.status === 'defaulted' ? (isDarkMode ? 'border-red-800' : 'border-red-200') : 
                  loan.status === 'paused' ? (isDarkMode ? 'border-orange-800' : 'border-orange-200') : 
                  loan.status === 'paid' ? (isDarkMode ? 'border-green-800' : 'border-green-200') : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`font-medium text-lg capitalize ${textPrimary}`}>{loan.loanType} Loan</h3>
                    <p className={`${textSecondary} text-sm`}>
                      Term: {loan.term} years at {loan.interestRate}% APR
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(loan.status)} size="sm">{loan.status}</Badge>
                </div>

                <div className="mb-4">
                  <div className={`text-sm ${textSecondary} mb-1`}>Remaining Amount</div>
                  <div className={`text-2xl font-semibold ${textPrimary}`}>{formatCurrency(loan.remainingAmount)}</div>
                  <div className={`text-xs ${textSecondary} mt-1`}>
                    Original Amount: {formatCurrency(loan.amount)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                  <div>
                    <div className={textSecondary}>Monthly Payment</div>
                    <div className={`font-medium ${textPrimary}`}>{formatCurrency(loan.monthlyPayment)}</div>
                  </div>
                  <div>
                    <div className={textSecondary}>Start Date</div>
                    <div className={`font-medium ${textPrimary}`}>{formatDate(loan.startDate).split(',')[0]}</div>
                  </div>
                  <div>
                    <div className={textSecondary}>End Date</div>
                    <div className={`font-medium ${textPrimary}`}>{formatDate(loan.endDate).split(',')[0]}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="xs"
                    variant={loan.status === 'active' || loan.status === 'paused' ? 'success' : 'ghost'}
                    onClick={() => openModal('clearLoanDebt', loan)}
                    disabled={loan.status !== 'active' && loan.status !== 'paused'}
                  >
                    <DollarSign size={14} className="mr-1" />Make Payment
                  </Button>
                </div>

                <div className={`mt-4 pt-4 border-t ${borderColor}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${textPrimary}`}>Status Control</span>
                  </div>
                  <div className="flex gap-2">
                    {(loan.status !== 'active' && loan.status !== 'paid') && (
                      <Button size="xs" variant="success" onClick={() => handleStatusChange('loan', loan.id, 'active')}>
                        <Check size={12} className="mr-1" />Activate
                      </Button>
                    )}
                    {loan.status !== 'paused' && loan.status !== 'paid' && (
                      <Button size="xs" variant="outline" onClick={() => handleStatusChange('loan', loan.id, 'paused')}>
                        <Pause size={12} className="mr-1" />Pause
                      </Button>
                    )}
                    {loan.status !== 'defaulted' && loan.status !== 'paid' && (
                      <Button size="xs" variant="danger" onClick={() => handleStatusChange('loan', loan.id, 'defaulted')}>
                        <AlertTriangle size={12} className="mr-1" />Mark Defaulted
                      </Button>
                    )}
                  </div>
                </div>
              </UICard>
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
              <UICard
                key={investment.id}
                
                size="md"
                isHoverable
                className={`${
                  investment.status === 'withdrawn' ? borderColorAlt : 
                  investment.status === 'matured' ? (isDarkMode ? 'border-purple-800' : 'border-purple-200') : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`font-medium text-lg ${textPrimary}`}>{investment.investmentType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h3>
                    <p className={`${textSecondary} text-sm`}>
                      Started: {formatDate(investment.startDate).split(',')[0]}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(investment.status)} size="sm">
                    {investment.status}
                  </Badge>
                </div>

                <div className="mb-4">
                  <div className={`text-sm ${textSecondary} mb-1`}>Current Value</div>
                  <div className={`text-2xl font-semibold ${textPrimary}`}>{formatCurrency(investment.currentValue)}</div>
                  <div className={`text-xs ${textSecondary} mt-1`}>
                    Initial Investment: {formatCurrency(investment.amount)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <div className={textSecondary}>Interest Rate</div>
                    <div className={`font-medium ${textPrimary}`}>{investment.interestRate}%</div>
                  </div>
                  <div>
                    <div className={textSecondary}>Expected Return</div>
                    <div className={`font-medium ${textPrimary}`}>{formatCurrency(investment.expectedReturn)}</div>
                  </div>
                  {investment.endDate && (
                    <div>
                      <div className={textSecondary}>End Date</div>
                      <div className={`font-medium ${textPrimary}`}>{formatDate(investment.endDate).split(',')[0]}</div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="xs"
                    variant={investment.status === 'active' ? 'success' : 'ghost'}
                    onClick={() => openModal('addInvestment', investment)}
                    disabled={investment.status !== 'active'}
                  >
                    <ArrowDownRight size={14} className="mr-1" />
                    Add Funds
                  </Button>
                </div>

                <div className={`mt-4 pt-4 border-t ${borderColor}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${textPrimary}`}>Status Control</span>
                  </div>
                  <div className="flex gap-2">
                    {investment.status !== 'active' && investment.status !== 'withdrawn' && (
                      <Button size="xs" variant="success" onClick={() => handleStatusChange('investment', investment.id, 'active')}>
                        <Check size={12} className="mr-1" />
                        Activate
                      </Button>
                    )}
                    {investment.status !== 'matured' && investment.status !== 'withdrawn' && (
                      <Button size="xs" variant="primary" onClick={() => handleStatusChange('investment', investment.id, 'matured')}>
                        <Clock size={12} className="mr-1" />
                        Mark Matured
                      </Button>
                    )}
                    {investment.status !== 'withdrawn' && (
                      <Button size="xs" variant="outline" onClick={() => handleStatusChange('investment', investment.id, 'withdrawn')}>
                        <Wallet size={12} className="mr-1" />
                        Mark Withdrawn
                      </Button>
                    )}
                  </div>
                </div>
              </UICard>
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
              <UICard
                key={wallet.id}
                
                size="md"
                isHoverable
                className={`${
                  wallet.status === 'blocked' ? (isDarkMode ? 'border-red-800' : 'border-red-200') : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`font-medium text-lg ${textPrimary}`}>{wallet.currency} Wallet</h3>
                    <p className={`${textSecondary} text-sm text-ellipsis overflow-hidden`} title={wallet.walletAddress}>
                      {wallet.walletAddress}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(wallet.status)} size="sm">
                    {wallet.status}
                  </Badge>
                </div>

                <div className="mb-4">
                  <div className={`text-sm ${textSecondary} mb-1`}>Balance</div>
                  <div className="flex items-baseline">
                    <span className={`text-2xl font-semibold ${textPrimary}`}>{wallet.balance.toFixed(8)}</span>
                    <span className={`ml-1 text-lg ${textPrimary}`}>{wallet.currency}</span>
                  </div>
                  <div className={`text-sm ${textSecondary} mt-1`}>
                    ≈ {formatCurrency(wallet.dollarValue)}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="xs"
                    variant={wallet.status === 'active' ? 'success' : 'ghost'}
                    onClick={() => openModal('addCryptoFunds', wallet)}
                    disabled={wallet.status !== 'active'}
                  >
                    <ArrowDownRight size={14} className="mr-1" />
                    Add Funds
                  </Button>
                  <Button
                    size="xs"
                    variant={wallet.status === 'active' ? 'danger' : 'ghost'}
                    onClick={() => openModal('removeCryptoFunds', wallet)}
                    disabled={wallet.status !== 'active'}
                  >
                    <ArrowUpRight size={14} className="mr-1" />
                    Remove Funds
                  </Button>
                </div>

                <div className={`mt-4 pt-4 border-t ${borderColor}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${textPrimary}`}>Status Control</span>
                  </div>
                  <div className="flex gap-2">
                    {wallet.status !== 'active' && (
                      <Button size="xs" variant="success" onClick={() => handleStatusChange('crypto', wallet.id, 'active')}>
                        <Check size={12} className="mr-1" />
                        Activate
                      </Button>
                    )}
                    {wallet.status !== 'blocked' && (
                      <Button size="xs" variant="danger" onClick={() => handleStatusChange('crypto', wallet.id, 'blocked')}>
                        <Ban size={12} className="mr-1" />
                        Block
                      </Button>
                    )}
                  </div>
                </div>
              </UICard>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Modal */}
      {modalOpen && (
        <div className={`fixed inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-slate-950/50'} flex items-center justify-center z-50`}>
          <motion.div 
            className={`${isDarkMode ? 'bg-neutral-900' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}  
            transition={{ duration: 0.3 }}
          >
            <h2 className={`text-xl font-semibold mb-4 ${textPrimary}`}>
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
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className={`${textMuted} sm:text-sm`}>$</span>
                  </div>
                  <Input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="0.01"
                    step="0.01"
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
                {modalType === 'clearLoanDebt' && (
                  <p className={`text-xs ${textMuted} mt-1`}>
                    Remaining balance: {formatCurrency(modalData.remainingAmount)}
                  </p>
                )}
              </div>
              
              <div className="mb-4">
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  className={`block w-full py-2 px-3 border ${borderColor} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isDarkMode ? 'bg-neutral-800 text-white' : 'bg-white text-slate-900'}`}
                  placeholder="Add a note"
                ></textarea>
              </div>
              
              {(modalType === 'addCardFunds' || modalType === 'addBankFunds' || modalType === 'removeBankFunds' || modalType === 'removeCardFunds') && (
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                    Transfer Type
                  </label>
                  <select
                    name="transferType"
                    value={formData.transferType}
                    onChange={handleInputChange}
                    className={`block w-full py-2 px-3 border ${borderColor} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isDarkMode ? 'bg-neutral-800 text-white' : 'bg-white text-slate-900'}`}
                  >
                    <option value="instant">Instant Transfer</option>
                    <option value="scheduled">Scheduled Transfer</option>
                  </select>
                </div>
              )}
              
              {formData.transferType === 'scheduled' && (
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                    Scheduled Date
                  </label>
                  <Input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="outline" onClick={closeModal} type="button">
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Confirm
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default UserTransfer;