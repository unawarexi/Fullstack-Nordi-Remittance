import Users from './users.model.js';
import { Wallets } from '../accounts/accounts.model.js';
import Permissions from '../permissions/permissions.model.js';
import { ConfirmationToken, SecurityEvent } from '../auth/confirm.model.js';
import Transactions from '../transactions/transactions.model.js';
import { ValidationError, NotFoundError, UnauthorizedError } from '../../core/errors/AppError.js';
import { sanitizeString, isValidEmail, isValidPhone } from '../../core/helpers/validation.helper.js';
import { generateOTP, comparePassword } from '../../core/helpers/crypto.helper.js';
import EmailContentGenerator from '../../core/mail/Mail-content.js';
import { queueTemplatedMail } from '../../services/workers.js';
import { emitToUser } from '../../services/websocket.service.js';
import { env } from '../../config/env.config.js';
import {
  cacheUserProfile,
  getCachedUserProfile,
  invalidateUserCache,
  cacheUserWallets,
  getCachedUserWallets,
} from '../../services/redis.service.js';

const emailGenerator = new EmailContentGenerator();

const WS_EVENTS = {
  PROFILE_UPDATED: 'profile:updated',
  EMAIL_CHANGED: 'profile:email_changed',
  PHONE_CHANGED: 'profile:phone_changed',
  ACCOUNT_DELETED: 'account:deleted',
};

export class UsersProfileService {
  static async getProfile(userId: string) {
    const cachedProfile = await getCachedUserProfile(userId);
    const cachedWallets = await getCachedUserWallets(userId);

    if (cachedProfile && cachedWallets) {
      return {
        user: cachedProfile,
        wallets: cachedWallets,
        permissions: cachedProfile.permissions || null,
      };
    }

    const user: any = await Users.findById(userId).select('-password -twoFactorSecret -backupCodes');
    if (!user) throw new NotFoundError('User not found');

    const wallets = await Wallets.find({ user: String(user._id) }).select(
      'walletNumber balances status isPrimary walletType',
    );

    const permissions = await Permissions.findOne({ userId: String(user._id) });

    const profileData = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      accountNumber: user.accountNumber,
      mobileNumber: user.mobileNumber,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      country: user.country,
      currency: user.currency,
      kycStatus: user.kycStatus,
      isActive: user.isActive,
      enableTwoFactor: user.enableTwoFactor,
      profilePicture: user.profilePicture,
      homeAddress: user.homeAddress,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      permissions: permissions
        ? {
            enableDomesticTransfers: permissions.enableDomesticTransfers,
            enableInternationalTransfers: permissions.enableInternationalTransfers,
            enableCardPayments: permissions.enableCardPayments,
            enableCryptoTransfers: permissions.enableCryptoTransfers,
          }
        : null,
    };

    await Promise.all([cacheUserProfile(userId, profileData), cacheUserWallets(userId, wallets)]);

    return {
      user: profileData,
      wallets,
      permissions: profileData.permissions,
    };
  }

  static async updateProfile(userId: string, body: any) {
    const allowedFields = [
      'firstName',
      'lastName',
      'middleName',
      'dateOfBirth',
      'gender',
      'timezone',
      'language',
      'address',
      'profilePicture',
    ];

    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] === 'string') {
          updates[field] = sanitizeString(body[field]);
        } else {
          updates[field] = body[field];
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    if (updates.firstName && updates.firstName.length < 2) {
      throw new ValidationError('First name must be at least 2 characters');
    }

    if (updates.lastName && updates.lastName.length < 2) {
      throw new ValidationError('Last name must be at least 2 characters');
    }

    const user = await Users.findByIdAndUpdate(
      userId,
      { $set: updates, updatedAt: new Date() },
      { new: true },
    ).select('-password -twoFactorSecret -backupCodes');

    if (!user) throw new NotFoundError('User not found');

    await invalidateUserCache(userId);

    emitToUser(userId, WS_EVENTS.PROFILE_UPDATED, {
      type: 'profile_update',
      data: { updatedFields: Object.keys(updates) },
      timestamp: new Date().toISOString(),
    });

    return user;
  }

  static async updateEmail(userId: string, body: any) {
    const { newEmail, password } = body;

    if (!newEmail || !isValidEmail(newEmail)) throw new ValidationError('Valid email is required');
    if (!password) throw new ValidationError('Password is required to change email');

    const existingUser = await Users.findOne({
      email: newEmail.toLowerCase(),
      _id: { $ne: userId },
    });
    if (existingUser) throw new ValidationError('Email is already in use');

    const user = await Users.findById(userId).select('+password');
    if (!user) throw new NotFoundError('User not found');

    const isPasswordValid = await comparePassword(password, user.password as string);
    if (!isPasswordValid) throw new UnauthorizedError('Invalid password');

    const otp = generateOTP(6);
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await ConfirmationToken.create({
      userId: String(user._id),
      token: otp,
      type: 'email_change',
      expiresAt: otpExpiry,
      used: false,
      metadata: { newEmail: newEmail.toLowerCase() },
    });

    const emailContent = emailGenerator.otpEmail({
      firstName: user.firstName as string,
      email: newEmail.toLowerCase(),
      otpCode: otp,
      purpose: 'verify your new email address',
      expiresIn: '15 minutes',
      userId: String(user._id),
    });

    await queueTemplatedMail(newEmail, emailContent);
  }

  static async confirmEmailChange(userId: string, body: any, ip: string, userAgent: string) {
    const { otp } = body;
    if (!otp) throw new ValidationError('Verification code is required');

    const tokenDoc = await ConfirmationToken.findOne({
      userId,
      token: otp,
      type: 'email_change',
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc || !tokenDoc.metadata?.newEmail) {
      throw new ValidationError('Invalid or expired verification code');
    }

    const newEmail = tokenDoc.metadata.newEmail;

    const user = await Users.findByIdAndUpdate(
      userId,
      {
        email: newEmail,
        emailVerified: true,
        updatedAt: new Date(),
      },
      { new: true },
    ).select('-password -twoFactorSecret -backupCodes');

    await ConfirmationToken.updateOne({ _id: tokenDoc._id }, { used: true });

    await SecurityEvent.create({
      userId,
      type: 'email_changed',
      ipAddress: ip,
      userAgent: userAgent,
      metadata: { newEmail },
      createdAt: new Date(),
    });

    await invalidateUserCache(userId);

    emitToUser(userId, WS_EVENTS.EMAIL_CHANGED, {
      type: 'email_changed',
      data: { newEmail },
      timestamp: new Date().toISOString(),
    });

    return user;
  }

  static async updatePhone(userId: string, body: any) {
    const { newPhone, password } = body;

    if (!newPhone || !isValidPhone(newPhone)) throw new ValidationError('Valid phone number is required');
    if (!password) throw new ValidationError('Password is required to change phone');

    const existingUser = await Users.findOne({
      phone: newPhone,
      _id: { $ne: userId },
    });
    if (existingUser) throw new ValidationError('Phone number is already in use');

    const user: any = await Users.findById(userId).select('+password');
    if (!user) throw new NotFoundError('User not found');

    const isPasswordValid = await comparePassword(password, user.password as string);
    if (!isPasswordValid) throw new UnauthorizedError('Invalid password');

    const otp = generateOTP(6);
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await ConfirmationToken.create({
      userId: String(user._id),
      token: otp,
      type: 'phone_change',
      expiresAt: otpExpiry,
      used: false,
      metadata: { newPhone },
    });

    return {
      message: 'Verification code sent to new phone',
      ...(env.NODE_ENV === 'development' && { otp }),
    };
  }

  static async confirmPhoneChange(userId: string, body: any, ip: string, userAgent: string) {
    const { otp } = body;
    if (!otp) throw new ValidationError('Verification code is required');

    const tokenDoc = await ConfirmationToken.findOne({
      userId,
      token: otp,
      type: 'phone_change',
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc || !tokenDoc.metadata?.newPhone) {
      throw new ValidationError('Invalid or expired verification code');
    }

    const newPhone = tokenDoc.metadata.newPhone;

    const user = await Users.findByIdAndUpdate(
      userId,
      {
        phone: newPhone,
        phoneVerified: true,
        updatedAt: new Date(),
      },
      { new: true },
    ).select('-password -twoFactorSecret -backupCodes');

    await ConfirmationToken.updateOne({ _id: tokenDoc._id }, { used: true });

    await SecurityEvent.create({
      userId,
      type: 'phone_changed',
      ipAddress: ip,
      userAgent: userAgent,
      metadata: { newPhone },
      createdAt: new Date(),
    });

    await invalidateUserCache(userId);

    emitToUser(userId, WS_EVENTS.PHONE_CHANGED, {
      type: 'phone_changed',
      data: { newPhone: newPhone.slice(0, 4) + '****' + newPhone.slice(-2) },
      timestamp: new Date().toISOString(),
    });

    return user;
  }

  static async requestAccountDeletion(userId: string, body: any) {
    const { password, reason } = body;
    if (!password) throw new ValidationError('Password is required');

    const user: any = await Users.findById(userId).select('+password');
    if (!user) throw new NotFoundError('User not found');

    const isPasswordValid = await comparePassword(password, user.password as string);
    if (!isPasswordValid) throw new UnauthorizedError('Invalid password');

    const wallet: any = await Wallets.findOne({ user: String(user._id) });
    if (wallet && wallet.balances && wallet.balances.size > 0) {
      let hasBalance = false;
      wallet.balances.forEach((balance: number) => {
        if (balance > 0) hasBalance = true;
      });
      if (hasBalance) throw new ValidationError('Please withdraw your remaining balance before deleting your account');
    }

    const pendingTransactions = await Transactions.countDocuments({
      $or: [{ sender: user._id }, { recipient: user._id }],
      status: { $in: ['pending', 'processing'] },
    });

    if (pendingTransactions > 0) throw new ValidationError('Please wait for pending transactions to complete before deleting your account');

    const deletionToken = generateOTP(6);
    const deletionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await ConfirmationToken.create({
      userId: String(user._id),
      token: deletionToken,
      type: 'account_deletion',
      expiresAt: deletionExpiry,
      used: false,
      metadata: { reason },
    });

    const emailContent = emailGenerator.accountDeletionRequestEmail({
      firstName: user.firstName as string,
      email: user.email as string,
      verificationCode: deletionToken,
      expiresIn: '24 hours',
      userId: String(user._id),
    });

    await queueTemplatedMail(user.email as string, emailContent);
  }

  static async confirmAccountDeletion(userId: string, body: any, ip: string, userAgent: string) {
    const { code } = body;
    if (!code) throw new ValidationError('Confirmation code is required');

    const tokenDoc = await ConfirmationToken.findOne({
      userId,
      token: code,
      type: 'account_deletion',
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) throw new ValidationError('Invalid or expired confirmation code');

    await Users.updateOne(
      { _id: userId },
      {
        status: 'deactivated',
        deletedAt: new Date(),
        email: `deleted_${userId}_${Date.now()}@deleted.local`,
        phone: null,
        updatedAt: new Date(),
      },
    );

    await Wallets.updateMany({ user: userId }, { status: 'closed' });
    await ConfirmationToken.updateOne({ _id: tokenDoc._id }, { used: true });

    await SecurityEvent.create({
      userId,
      type: 'account_deleted',
      ipAddress: ip,
      userAgent: userAgent,
      metadata: { reason: tokenDoc.metadata?.reason },
      createdAt: new Date(),
    });

    await invalidateUserCache(userId);

    emitToUser(userId, WS_EVENTS.ACCOUNT_DELETED, {
      type: 'account_deleted',
      timestamp: new Date().toISOString(),
    });
  }
}
