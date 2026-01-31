// ============================================================================
// CARD CONTROLLER
// ============================================================================

import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import type { AuthenticatedRequest } from '../types/index.js';
import { Cards, CardTokens, CardTransactions, CardControls, CardLimits } from '../models/CardsModel.js';
import { Wallets, LedgerEntries } from '../models/AccountsModel.js';
import Users from '../models/UserModel.js';
import Transactions from '../models/TransactionModel.js';
import { generateCardNumber, generateCVV, generateReferenceNumber } from '../core/helpers/generator.js';
import { encrypt, decrypt, maskCardNumber } from '../core/helpers/crypto.helper.js';
import { sendSuccess, sendCreated, sendPaginated } from '../core/helpers/response.helper.js';
import { UnauthorizedError, ValidationError, NotFoundError, ForbiddenError } from '../core/errors/AppError.js';
import { sendTemplatedMail } from '../services/Mailer.service.js';
import EmailContentGenerator from '../core/mail/Mail-content.js';

// Initialize email content generator
const emailGenerator = new EmailContentGenerator();

// Helper functions for wallet balance operations (Map-based)
function getWalletBalance(wallet: any, currency: string): number {
  if (wallet.balances instanceof Map) {
    return wallet.balances.get(currency) || 0;
  }
  if (wallet.balances && typeof wallet.balances === 'object') {
    return wallet.balances[currency] || 0;
  }
  return 0;
}

function updateWalletBalance(wallet: any, currency: string, newBalance: number): void {
  if (wallet.balances instanceof Map) {
    wallet.balances.set(currency, newBalance);
  } else if (wallet.balances && typeof wallet.balances === 'object') {
    wallet.balances[currency] = newBalance;
  } else {
    wallet.balances = new Map([[currency, newBalance]]);
  }
}

function getWalletCurrency(wallet: any): string {
  if (wallet.balances instanceof Map) {
    const keys = Array.from(wallet.balances.keys());
    return keys.length > 0 ? String(keys[0]) : 'USD';
  }
  if (wallet.balances && typeof wallet.balances === 'object') {
    return Object.keys(wallet.balances)[0] || 'USD';
  }
  return 'USD';
}

// ============================================================================
// GET USER CARDS
// ============================================================================

export async function getCards(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const cards = await Cards.find({ user: req.user.userId })
      .populate('wallet', 'walletNumber currency balance')
      .populate('limits')
      .populate('controls')
      .lean();

    // Mask card numbers for security
    const maskedCards = cards.map(card => ({
      ...card,
      cardNumber: maskCardNumber(card.cardNumber),
      cvv: '***',
      pin: undefined,
    }));

    sendSuccess(res, { cards: maskedCards });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// GET SINGLE CARD
// ============================================================================

export async function getCardById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { id } = req.params;

    const card = await Cards.findOne({ 
      $or: [{ _id: id }, { cardId: id }],
      user: req.user.userId 
    })
      .populate('wallet', 'walletNumber currency balance availableBalance')
      .populate('limits')
      .populate('controls')
      .lean();

    if (!card) throw new NotFoundError('Card not found');

    // Get recent transactions
    const recentTransactions = await CardTransactions.find({ card: card._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    sendSuccess(res, {
      card: {
        ...card,
        cardNumber: maskCardNumber(card.cardNumber),
        cvv: '***',
        pin: undefined,
      },
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// CREATE VIRTUAL CARD
// ============================================================================

export async function createVirtualCard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { walletId, cardType, cardBrand, cardholderName, currency } = req.body;

    // Verify user
    const user = await Users.findById(req.user.userId).session(session);
    if (!user) throw new NotFoundError('User not found');

    // KYC check
    if (user.kycStatus !== 'approved') {
      throw new ForbiddenError('KYC verification required to create cards');
    }

    // Verify wallet
    const wallet = await Wallets.findOne({
      _id: walletId,
      userId: req.user.userId,
      status: 'active',
    }).session(session);

    if (!wallet) throw new NotFoundError('Wallet not found');

    // Check card limit (max 5 cards per user)
    const existingCards = await Cards.countDocuments({ user: req.user.userId });
    if (existingCards >= 5) {
      throw new ForbiddenError('Maximum card limit reached (5 cards)');
    }

    // Generate card details
    const cardNumber = generateCardNumber(cardBrand || 'visa');
    const cvv = generateCVV();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 3);

    // Create card
    const walletCurrency = currency || getWalletCurrency(wallet);
    const card = new Cards({
      user: req.user.userId,
      wallet: wallet._id,
      cardNumber: encrypt(cardNumber),
      cardholderName: cardholderName || `${(user as any).firstName} ${(user as any).lastName}`,
      cardType: cardType || 'debit',
      cardBrand: cardBrand || 'visa',
      expiryMonth: expiryDate.getMonth() + 1,
      expiryYear: expiryDate.getFullYear(),
      cvv: encrypt(cvv),
      status: 'active',
      isPhysical: false,
      currency: walletCurrency,
      isInternationalEnabled: false,
      isOnlineEnabled: true,
      isContactlessEnabled: true,
      isAtmEnabled: false,
    });

    await card.save({ session });

    // Create default limits
    const limits = new CardLimits({
      card: card._id,
      dailyLimit: 5000,
      monthlyLimit: 50000,
      perTransactionLimit: 2500,
      atmDailyLimit: 0, // Virtual cards can't withdraw
      atmMonthlyLimit: 0,
      currency: walletCurrency,
      resetDate: new Date(),
    });

    await limits.save({ session });

    // Create default controls
    const controls = new CardControls({
      card: card._id,
      allowInternational: false,
      allowOnline: true,
      allowAtm: false,
      allowContactless: true,
      allowMagStripe: true,
      blockedMerchantCategories: ['gambling', 'adult'],
    });

    await controls.save({ session });

    // Update card with references
    card.limits = limits._id;
    card.controls = controls._id;
    await card.save({ session });

    await session.commitTransaction();

    // Send notification using template
    const emailContent = emailGenerator.cardIssuedEmail({
      cardholderName: cardholderName || `${(user as any).firstName} ${(user as any).lastName}`,
      cardType: 'Virtual Card',
      cardBrand: (cardBrand || 'visa').toUpperCase(),
      lastFour: cardNumber.slice(-4),
      expiryMonth: String(card.expiryMonth),
      expiryYear: String(card.expiryYear),
      status: 'active',
      cardId: card.cardId || card._id.toString(),
    });

    sendTemplatedMail((user as any).email, emailContent).catch(console.error);

    sendCreated(res, {
      card: {
        id: card._id,
        cardId: card.cardId,
        cardNumber: maskCardNumber(cardNumber),
        last4: cardNumber.slice(-4),
        cardholderName: card.cardholderName,
        cardType: card.cardType,
        cardBrand: card.cardBrand,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        status: card.status,
        currency: card.currency,
      },
    }, 'Virtual card created successfully');
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// REQUEST PHYSICAL CARD
// ============================================================================

export async function requestPhysicalCard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { walletId, cardBrand, shippingAddress } = req.body;

    const user = await Users.findById(req.user.userId).session(session);
    if (!user) throw new NotFoundError('User not found');

    if (user.kycStatus !== 'approved') {
      throw new ForbiddenError('KYC verification required');
    }

    // Validate shipping address
    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.country) {
      throw new ValidationError('Complete shipping address required');
    }

    const wallet = await Wallets.findOne({
      _id: walletId,
      userId: req.user.userId,
      status: 'active',
    }).session(session);

    if (!wallet) throw new NotFoundError('Wallet not found');

    // Get wallet currency
    const walletCurrency = getWalletCurrency(wallet);

    // Check for existing physical card request
    const existingPhysical = await Cards.findOne({
      user: req.user.userId,
      isPhysical: true,
      status: { $in: ['pending_activation', 'active'] },
    }).session(session);

    if (existingPhysical) {
      throw new ValidationError('You already have a physical card');
    }

    // Card issuance fee
    const issuanceFee = 10;
    const currentBalance = getWalletBalance(wallet, walletCurrency);
    if (currentBalance < issuanceFee) {
      throw new ValidationError(`Insufficient balance for card issuance fee ($${issuanceFee})`);
    }

    // Generate card details
    const cardNumber = generateCardNumber(cardBrand || 'visa');
    const cvv = generateCVV();
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 4);

    // Create card
    const card = new Cards({
      user: req.user.userId,
      wallet: wallet._id,
      cardNumber: encrypt(cardNumber),
      cardholderName: `${(user as any).firstName} ${(user as any).lastName}`,
      cardType: 'debit',
      cardBrand: cardBrand || 'visa',
      expiryMonth: expiryDate.getMonth() + 1,
      expiryYear: expiryDate.getFullYear(),
      cvv: encrypt(cvv),
      pin: encrypt(pin),
      status: 'pending_activation',
      isPhysical: true,
      currency: walletCurrency,
      billingAddress: shippingAddress,
      isInternationalEnabled: false,
      isOnlineEnabled: true,
      isContactlessEnabled: true,
      isAtmEnabled: true,
    });

    await card.save({ session });

    // Deduct issuance fee
    const newBalance = currentBalance - issuanceFee;
    updateWalletBalance(wallet, walletCurrency, newBalance);
    await wallet.save({ session });

    // Create transaction for ledger entry reference
    const reference = generateReferenceNumber();
    const transaction = new Transactions({
      wallet: wallet._id,
      type: 'fee',
      category: 'cards',
      categoryItemId: card._id.toString(),
      amount: issuanceFee,
      currency: walletCurrency,
      status: 'completed',
      referenceNumber: reference,
      initiatedBy: req.user.userId,
      description: 'Physical card issuance fee',
      completedAt: new Date(),
    });
    await transaction.save({ session });

    // Create ledger entry
    await LedgerEntries.create([{
      wallet: wallet._id,
      transaction: transaction._id,
      entryType: 'debit',
      amount: issuanceFee,
      currency: walletCurrency,
      balance: newBalance,
      description: 'Physical card issuance fee',
      accountingDate: new Date(),
    }], { session });

    // Create limits
    const limits = new CardLimits({
      card: card._id,
      dailyLimit: 10000,
      monthlyLimit: 100000,
      perTransactionLimit: 5000,
      atmDailyLimit: 2000,
      atmMonthlyLimit: 20000,
      currency: walletCurrency,
      resetDate: new Date(),
    });

    await limits.save({ session });

    card.limits = limits._id;
    await card.save({ session });

    await session.commitTransaction();

    sendCreated(res, {
      card: {
        id: card._id,
        cardId: card.cardId,
        cardNumber: maskCardNumber(cardNumber),
        last4: cardNumber.slice(-4),
        status: card.status,
        isPhysical: true,
        shippingAddress,
        estimatedDelivery: '7-10 business days',
      },
      fee: issuanceFee,
    }, 'Physical card requested successfully');
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// ACTIVATE CARD
// ============================================================================

export async function activateCard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { id } = req.params;
    const { last4Digits, cvv } = req.body;

    const card = await Cards.findOne({
      $or: [{ _id: id }, { cardId: id }],
      user: req.user.userId,
      status: 'pending_activation',
    });

    if (!card) throw new NotFoundError('Card not found or already activated');

    // Verify card details
    const decryptedCardNumber = decrypt(card.cardNumber);
    const decryptedCvv = decrypt(card.cvv);

    if (decryptedCardNumber.slice(-4) !== last4Digits) {
      throw new ValidationError('Invalid card details');
    }

    if (decryptedCvv !== cvv) {
      throw new ValidationError('Invalid CVV');
    }

    card.status = 'active';
    card.activationDate = new Date();
    await card.save();

    sendSuccess(res, {
      card: {
        id: card._id,
        cardId: card.cardId,
        status: card.status,
        activationDate: card.activationDate,
      },
    }, 'Card activated successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// BLOCK/UNBLOCK CARD
// ============================================================================

export async function blockCard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { id } = req.params;
    const { reason } = req.body;

    const card = await Cards.findOne({
      $or: [{ _id: id }, { cardId: id }],
      user: req.user.userId,
      status: { $in: ['active', 'pending_activation'] },
    });

    if (!card) throw new NotFoundError('Card not found');

    card.status = 'blocked';
    card.blockedReason = reason || 'User requested';
    card.blockedAt = new Date();
    await card.save();

    const user = await Users.findById(req.user.userId);
    if (user) {
      const emailContent = emailGenerator.cardBlockedEmail({
        cardholderName: card.cardholderName || `${(user as any).firstName} ${(user as any).lastName}`,
        cardId: card.cardId || card._id.toString(),
        lastFour: maskCardNumber(decrypt(card.cardNumber)).slice(-4),
        cardType: card.cardBrand?.toUpperCase() || 'CARD',
        blockedAt: new Date().toISOString(),
        reason: reason || 'User requested',
        blockedBy: 'user',
      });

      sendTemplatedMail((user as any).email, emailContent).catch(console.error);
    }

    sendSuccess(res, {
      card: {
        id: card._id,
        cardId: card.cardId,
        status: card.status,
        blockedAt: card.blockedAt,
      },
    }, 'Card blocked successfully');
  } catch (error) {
    next(error);
  }
}

export async function unblockCard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { id } = req.params;

    const card = await Cards.findOne({
      $or: [{ _id: id }, { cardId: id }],
      user: req.user.userId,
      status: 'blocked',
    });

    if (!card) throw new NotFoundError('Card not found or not blocked');

    card.status = 'active';
    card.blockedReason = undefined;
    card.blockedAt = undefined;
    await card.save();

    sendSuccess(res, {
      card: {
        id: card._id,
        cardId: card.cardId,
        status: card.status,
      },
    }, 'Card unblocked successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// REPORT LOST/STOLEN
// ============================================================================

export async function reportLostStolen(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { id } = req.params;
    const { type, description } = req.body; // type: 'lost' | 'stolen'

    const card = await Cards.findOne({
      $or: [{ _id: id }, { cardId: id }],
      user: req.user.userId,
    });

    if (!card) throw new NotFoundError('Card not found');

    card.status = type === 'stolen' ? 'stolen' : 'lost';
    card.blockedReason = description || `Reported ${type}`;
    card.blockedAt = new Date();
    await card.save();

    const user = await Users.findById(req.user.userId);
    if (user) {
      const emailContent = emailGenerator.cardReportedEmail({
        cardholderName: card.cardholderName || `${(user as any).firstName} ${(user as any).lastName}`,
        cardId: card.cardId || card._id.toString(),
        lastFour: maskCardNumber(decrypt(card.cardNumber)).slice(-4),
        cardType: card.cardBrand?.toUpperCase() || 'CARD',
        reportType: type as 'lost' | 'stolen' | 'damaged',
        reportedAt: new Date().toISOString(),
      });

      sendTemplatedMail((user as any).email, emailContent).catch(console.error);
    }

    sendSuccess(res, {
      message: `Card reported as ${type} and has been permanently blocked`,
      canRequestReplacement: true,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// UPDATE CARD LIMITS
// ============================================================================

export async function updateCardLimits(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { id } = req.params;
    const {
      dailyTransactionLimit,
      dailyWithdrawalLimit,
      monthlyTransactionLimit,
      perTransactionLimit,
    } = req.body;

    const card = await Cards.findOne({
      $or: [{ _id: id }, { cardId: id }],
      user: req.user.userId,
    });

    if (!card) throw new NotFoundError('Card not found');

    const limits = await CardLimits.findOne({ card: card._id });
    if (!limits) throw new NotFoundError('Card limits not found');

    // Update limits (with max caps) - using correct schema field names
    if (dailyTransactionLimit !== undefined) {
      limits.dailyLimit = Math.min(dailyTransactionLimit, 50000);
    }
    if (dailyWithdrawalLimit !== undefined && card.isPhysical) {
      limits.atmDailyLimit = Math.min(dailyWithdrawalLimit, 5000);
    }
    if (monthlyTransactionLimit !== undefined) {
      limits.monthlyLimit = Math.min(monthlyTransactionLimit, 500000);
    }
    if (perTransactionLimit !== undefined) {
      limits.perTransactionLimit = Math.min(perTransactionLimit, 25000);
    }

    await limits.save();

    sendSuccess(res, { limits }, 'Card limits updated successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// UPDATE CARD CONTROLS
// ============================================================================

export async function updateCardControls(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { id } = req.params;
    const {
      isInternationalEnabled,
      isOnlineEnabled,
      isContactlessEnabled,
      isAtmEnabled,
      blockedMerchantCategories,
      blockedCountries,
    } = req.body;

    const card = await Cards.findOne({
      $or: [{ _id: id }, { cardId: id }],
      user: req.user.userId,
    });

    if (!card) throw new NotFoundError('Card not found');

    // Update card settings
    if (isInternationalEnabled !== undefined) card.isInternationalEnabled = isInternationalEnabled;
    if (isOnlineEnabled !== undefined) card.isOnlineEnabled = isOnlineEnabled;
    if (isContactlessEnabled !== undefined) card.isContactlessEnabled = isContactlessEnabled;
    if (isAtmEnabled !== undefined && card.isPhysical) card.isAtmEnabled = isAtmEnabled;

    await card.save();

    // Update controls
    if (blockedMerchantCategories || blockedCountries) {
      const controls = await CardControls.findOne({ card: card._id });
      if (controls) {
        if (blockedMerchantCategories) controls.blockedMerchantCategories = blockedMerchantCategories;
        if (blockedCountries) controls.blockedCountries = blockedCountries;
        await controls.save();
      }
    }

    sendSuccess(res, {
      card: {
        id: card._id,
        isInternationalEnabled: card.isInternationalEnabled,
        isOnlineEnabled: card.isOnlineEnabled,
        isContactlessEnabled: card.isContactlessEnabled,
        isAtmEnabled: card.isAtmEnabled,
      },
    }, 'Card controls updated successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// GET CARD TRANSACTIONS
// ============================================================================

export async function getCardTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const card = await Cards.findOne({
      $or: [{ _id: id }, { cardId: id }],
      user: req.user.userId,
    });

    if (!card) throw new NotFoundError('Card not found');

    const filter: any = { card: card._id };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.transactionType = req.query.type;

    const [transactions, total] = await Promise.all([
      CardTransactions.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CardTransactions.countDocuments(filter),
    ]);

    sendPaginated(res, transactions, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// CHANGE PIN
// ============================================================================

export async function changePin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { id } = req.params;
    const { currentPin, newPin } = req.body;

    if (!newPin || newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      throw new ValidationError('PIN must be 4 digits');
    }

    const card = await Cards.findOne({
      $or: [{ _id: id }, { cardId: id }],
      user: req.user.userId,
      isPhysical: true,
    });

    if (!card) throw new NotFoundError('Physical card not found');

    // Verify current PIN
    if (card.pin && decrypt(card.pin) !== currentPin) {
      throw new ValidationError('Current PIN is incorrect');
    }

    card.pin = encrypt(newPin);
    await card.save();

    sendSuccess(res, null, 'PIN changed successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// GET CARD DETAILS (Full - for display)
// ============================================================================

export async function getCardDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { id } = req.params;

    const card = await Cards.findOne({
      $or: [{ _id: id }, { cardId: id }],
      user: req.user.userId,
      status: 'active',
    });

    if (!card) throw new NotFoundError('Card not found');

    // Return full card details (for in-app display with proper security)
    sendSuccess(res, {
      cardNumber: decrypt(card.cardNumber),
      cvv: decrypt(card.cvv),
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cardholderName: card.cardholderName,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN: GET ALL CARDS
// ============================================================================

export async function getAllCards(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.cardType) filter.cardType = req.query.cardType;
    if (req.query.userId) filter.user = req.query.userId;

    const [cards, total] = await Promise.all([
      Cards.find(filter)
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Cards.countDocuments(filter),
    ]);

    const maskedCards = cards.map(card => ({
      ...card,
      cardNumber: maskCardNumber(card.cardNumber),
      cvv: '***',
      pin: undefined,
    }));

    sendPaginated(res, maskedCards, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  getCards,
  getCardById,
  createVirtualCard,
  requestPhysicalCard,
  activateCard,
  blockCard,
  unblockCard,
  reportLostStolen,
  updateCardLimits,
  updateCardControls,
  getCardTransactions,
  changePin,
  getCardDetails,
  getAllCards,
};
