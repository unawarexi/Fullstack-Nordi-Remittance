import Users from './users.model.js';
import { Wallets } from '../accounts/accounts.model.js';
import Transactions from '../transactions/transactions.model.js';
import Permissions from '../permissions/permissions.model.js';
import { SecurityEvent } from '../auth/confirm.model.js';
import { ValidationError, NotFoundError } from '../../core/errors/AppError.js';
import EmailContentGenerator from '../../core/mail/Mail-content.js';
import { queueTemplatedMail } from '../../services/workers.js';
import { emitToUser } from '../../services/websocket.service.js';
import { invalidateUserCache, invalidateKycCache } from '../../services/redis.service.js';
import { onUserWrite } from '../../services/query-cache.service.js';

const emailGenerator = new EmailContentGenerator();

const WS_EVENTS = {
  USER_STATUS_CHANGED: 'user:status_changed',
  KYC_STATUS_CHANGED: 'kyc:status_changed',
};

export class UsersAdminService {
  static async getAllUsers(query: any) {
    const page = parseInt(query.page as string) || 1;
    const limit = Math.min(parseInt(query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (query.status) filter.status = query.status;
    if (query.role) filter.role = query.role;
    if (query.kycStatus) filter.kycStatus = query.kycStatus;
    
    if (query.search) {
      const search = (query.search as string).trim();
      if (search.length >= 3) {
        filter.$text = { $search: search };
      } else {
        const sanitized = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.$or = [
          { email: new RegExp(`^${sanitized}`, 'i') },
          { firstName: new RegExp(`^${sanitized}`, 'i') },
          { lastName: new RegExp(`^${sanitized}`, 'i') },
        ];
      }
    }

    const sortField = (query.sortBy as string) || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      Users.find(filter)
        .select('-password -twoFactorSecret -backupCodes')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Users.countDocuments(filter),
    ]);

    return { users, page, limit, total };
  }

  static async getUserById(userId: string) {
    const user: any = await Users.findById(userId).select('-password -twoFactorSecret -backupCodes');
    if (!user) throw new NotFoundError('User not found');

    const wallets = await Wallets.find({ user: String(user._id) });
    const recentTransactions = await Transactions.find({
      $or: [{ sender: String(user._id) }, { recipient: String(user._id) }],
    })
      .select('type amount currency status referenceNumber createdAt completedAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const permissions = await Permissions.findOne({ userId: String(user._id) });

    return { user, wallets, recentTransactions, permissions };
  }

  static async updateUserStatus(adminId: string, userId: string, body: any, ip: string, userAgent: string) {
    const { status, reason } = body;
    const validStatuses = ['active', 'suspended', 'locked', 'deactivated'];
    
    if (!status || !validStatuses.includes(status)) {
      throw new ValidationError('Invalid status');
    }

    const user = await Users.findByIdAndUpdate(
      userId,
      {
        status,
        updatedAt: new Date(),
        ...(status === 'suspended' && {
          suspendedAt: new Date(),
          suspendReason: reason,
        }),
      },
      { new: true },
    ).select('-password -twoFactorSecret -backupCodes');

    if (!user) throw new NotFoundError('User not found');

    await SecurityEvent.create({
      userId,
      type: 'status_changed',
      ipAddress: ip,
      userAgent: userAgent,
      metadata: { newStatus: status, changedBy: adminId, reason },
      createdAt: new Date(),
    });

    await invalidateUserCache(userId);

    emitToUser(userId, WS_EVENTS.USER_STATUS_CHANGED, {
      type: 'status_changed',
      data: { newStatus: status, reason },
      timestamp: new Date().toISOString(),
    });

    onUserWrite(userId).catch(() => {});
    return user;
  }

  static async updateUserKyc(adminId: string, userId: string, body: any, ip: string, userAgent: string) {
    const { kycStatus, reason } = body;
    const validStatuses = ['pending', 'approved', 'rejected', 'expired'];

    if (!kycStatus || !validStatuses.includes(kycStatus)) {
      throw new ValidationError('Invalid KYC status');
    }

    const user = await Users.findByIdAndUpdate(
      userId,
      {
        kycStatus,
        updatedAt: new Date(),
        ...(kycStatus === 'approved' && { kycApprovedAt: new Date() }),
        ...(kycStatus === 'rejected' && {
          kycRejectedAt: new Date(),
          kycRejectionReason: reason,
        }),
      },
      { new: true },
    ).select('-password -twoFactorSecret -backupCodes');

    if (!user) throw new NotFoundError('User not found');

    await SecurityEvent.create({
      userId,
      type: 'kyc_status_changed',
      ipAddress: ip,
      userAgent: userAgent,
      metadata: { newKycStatus: kycStatus, changedBy: adminId, reason },
      createdAt: new Date(),
    });

    const kycEmailStatus = kycStatus === 'expired' ? 'pending' : (kycStatus as 'pending' | 'approved' | 'rejected');
    const emailContent = emailGenerator.kycStatusEmail({
      firstName: user.firstName as string,
      status: kycEmailStatus,
      notes: kycStatus === 'rejected' ? reason : undefined,
      userId,
    });

    await queueTemplatedMail(user.email as string, emailContent);
    await Promise.all([invalidateUserCache(userId), invalidateKycCache(userId)]);

    emitToUser(userId, WS_EVENTS.KYC_STATUS_CHANGED, {
      type: 'kyc_status_changed',
      data: { newStatus: kycStatus, reason },
      timestamp: new Date().toISOString(),
    });

    onUserWrite(userId).catch(() => {});
    return user;
  }

  static async updateUser(userId: string, body: any) {
    const updates = { ...body };
    delete updates._id;
    delete updates.password;
    delete updates.twoFactorSecret;
    delete updates.backupCodes;

    const user = await Users.findByIdAndUpdate(
      userId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: false },
    ).select('-password -twoFactorSecret -backupCodes');

    if (!user) throw new NotFoundError('User not found');

    await invalidateUserCache(userId);
    onUserWrite(userId).catch(() => {});
    
    return user;
  }

  static async deleteUser(userId: string) {
    const user = await Users.findByIdAndDelete(userId);
    if (!user) throw new NotFoundError('User not found');

    await invalidateUserCache(userId);
    onUserWrite(userId).catch(() => {});
  }

  static async deleteAllUsers() {
    const result = await Users.deleteMany({});
    return result.deletedCount;
  }
}
