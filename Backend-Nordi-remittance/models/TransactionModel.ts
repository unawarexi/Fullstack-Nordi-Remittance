import mongoose from 'mongoose';

const { Schema } = mongoose;

const TransactionSchema = new Schema({
  wallet: { type: Schema.Types.ObjectId, ref: 'Wallets', required: true },
  type: { 
    type: String, 
    enum: ['deposit', 'withdrawal', 'transfer', 'payment', 'refund', 'fee', 'reversal', 'exchange'], 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['cards', 'bankAccounts', 'cryptoWallets', 'loans', 'investments'],
    required: true 
  },
  categoryItemId: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'cancelled', 'reversed'], 
    default: 'pending' 
  },
  description: { type: String },
  referenceNumber: { 
    type: String, 
    required: true, 
    unique: true,
  },
  initiatedBy: { type: String, ref: 'Users', required: true },
  recipientWallet: { type: Schema.Types.ObjectId, ref: 'Wallets' },
  recipientAccountNumber: { type: String },
  recipientBankName: { type: String },
  recipientName: { type: String },
  exchangeRate: { type: Number },
  fee: { type: Number },
  feeCurrency: { type: String },
  meta: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  failedReason: { type: String },
  reversalReason: { type: String },
  scheduledFor: { type: Date },
  isInternational: { type: Boolean, default: false },
  channel: { type: String, enum: ['web', 'mobile', 'api', 'branch', 'atm'] },
  ipAddress: { type: String },
  userAgent: { type: String }
});

// Create indexes for performance
TransactionSchema.index({ wallet: 1 });
TransactionSchema.index({ referenceNumber: 1 }, { unique: true });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ initiatedBy: 1 });
TransactionSchema.index({ category: 1 });
TransactionSchema.index({ categoryItemId: 1 });
TransactionSchema.index({ createdAt: -1 }); // For time-based sorting
TransactionSchema.index({ wallet: 1, status: 1 }); // Common compound lookup
TransactionSchema.index({ wallet: 1, category: 1 }); // Common compound lookup

const Transactions = mongoose.model('Transactions', TransactionSchema);
export default Transactions;