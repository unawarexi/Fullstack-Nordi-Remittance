// ============================================================================
// ADMIN CONTROLLER
// ============================================================================

import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import type { AuthenticatedRequest } from '../types/index.js';
import { AdminUsers, AdminPermissions, AdminActionLogs, SystemSettings, OperationalTasks } from '../models/AdminModel.js';
import Users from '../models/UserModel.js';
import { Wallets, AccountLimits } from '../models/AccountsModel.js';
import Transactions from '../models/TransactionModel.js';
import { Loans } from '../models/LoansModel.js';
import { Cards } from '../models/CardsModel.js';
import { FraudCases } from '../models/FraudSecurityModel.js';
import { sendSuccess, sendCreated, sendPaginated } from '../core/helpers/response.helper.js';
import { UnauthorizedError, ValidationError, NotFoundError, ForbiddenError } from '../core/errors/AppError.js';
import { generateAuthTokens } from '../core/helpers/token.helper.js';
import { sendTemplatedMail } from '../services/Mailer.service.js';
import EmailContentGenerator from '../core/mail/Mail-content.js';
import { emitToUser, broadcast } from '../services/Websocket.service.js';
import { WS } from '../core/constants/ws-events.js';
import envConfig from '../config/env.config.js';
import type { AdminAccountData } from '../types/Mail.types.js';
import { getCachedDashboard, invalidateDashboardCache, getCachedSystemSettings, invalidateSystemSettingsCache } from '../services/QueryCacheService.js';

// Initialize email content generator
const emailGenerator = new EmailContentGenerator();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate OTP for sensitive operations
 */
function generateOtp(): { code: string; expiresAt: Date } {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return { code, expiresAt };
}

/**
 * Verify OTP
 */
function verifyOtp(admin: any, providedCode: string, purpose: string): boolean {
  if (!admin.pendingOtp || !admin.pendingOtp.code) return false;
  if (admin.pendingOtp.purpose !== purpose) return false;
  if (admin.pendingOtp.expiresAt < new Date()) return false;
  if (admin.pendingOtp.attempts >= 3) return false;
  return admin.pendingOtp.code === providedCode;
}

// ============================================================================
// ADMIN AUTHENTICATION
// ============================================================================

export async function adminLogin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, twoFactorCode } = req.body;

    const admin: any = await AdminUsers.findOne({ email: email.toLowerCase() })
      .populate('permissions');

    if (!admin) throw new UnauthorizedError('Invalid credentials');
    if (!admin.isActive) throw new ForbiddenError('Account is not active');
    if (admin.isLocked) throw new ForbiddenError('Account is locked');

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      admin.loginAttempts = (admin.loginAttempts || 0) + 1;
      
      if (admin.loginAttempts >= 5) {
        admin.isLocked = true;
      }
      
      await admin.save();
      throw new UnauthorizedError('Invalid credentials');
    }

    // Reset failed attempts
    admin.loginAttempts = 0;
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const sessionId = `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const { accessToken: token } = await generateAuthTokens(
      admin._id.toString(),
      admin.email,
      admin.role,
      sessionId
    );

    // Log action
    await AdminActionLogs.create({
      admin: admin._id,
      action: 'LOGIN',
      resource: 'admin',
      resourceId: admin._id.toString(),
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
      status: 'success',
    });

    sendSuccess(res, {
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        permissions: admin.permissions,
      },
      token,
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
}

export async function adminLogout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    await AdminActionLogs.create({
      admin: req.user.userId,
      action: 'LOGOUT',
      resource: 'admin',
      resourceId: req.user.userId,
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
      status: 'success',
    });

    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN USER MANAGEMENT
// ============================================================================

export async function getAdminUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;

    const [admins, total] = await Promise.all([
      AdminUsers.find(filter)
        .select('-password')
        .populate('permissions')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdminUsers.countDocuments(filter),
    ]);

    sendPaginated(res, admins, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

export async function createAdminUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { email, password, firstName, lastName, role, permissions } = req.body;

    // Check existing admin
    const existing = await AdminUsers.findOne({ email: email.toLowerCase() });
    if (existing) throw new ValidationError('Admin with this email already exists');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = new AdminUsers({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role: role || 'support',
      permissions: permissions || [],
      status: 'active',
      createdBy: req.user.userId,
    });

    await admin.save();

    // Log action
    await AdminActionLogs.create({
      admin: req.user.userId,
      action: 'CREATE_ADMIN',
      resource: 'admin',
      resourceId: String(admin._id!),
      changes: { email, role: role || 'support_agent' },
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
      status: 'success',
    });

    // Send welcome email using template
    const emailData: AdminAccountData = {
      firstName,
      lastName,
      email,
      role: role || 'support_agent',
      createdAt: new Date().toISOString(),
      createdBy: req.user.email || 'Super Admin',
    };

    const emailContent = emailGenerator.adminAccountCreatedEmail(emailData);
    sendTemplatedMail(email, emailContent).catch(console.error);

    sendCreated(res, {
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    }, 'Admin user created successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateAdminUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { id } = req.params;
    const { firstName, lastName, role, status, permissions } = req.body;

    const admin: any = await AdminUsers.findById(id);
    if (!admin) throw new NotFoundError('Admin not found');

    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (role) admin.role = role;
    if (typeof permissions !== 'undefined') admin.permissions = permissions;

    await admin.save();

    // Log action
    await AdminActionLogs.create({
      admin: req.user.userId,
      action: 'UPDATE_ADMIN',
      resource: 'admin',
      resourceId: admin._id.toString(),
      changes: { firstName, lastName, role },
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
      status: 'success',
    });

    sendSuccess(res, { admin }, 'Admin updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deactivateAdminUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { id } = req.params;

    const admin: any = await AdminUsers.findById(id);
    if (!admin) throw new NotFoundError('Admin not found');

    if (admin._id.toString() === req.user.userId) {
      throw new ForbiddenError('Cannot deactivate your own account');
    }

    admin.isActive = false;
    await admin.save();

    await AdminActionLogs.create({
      admin: req.user.userId,
      action: 'DEACTIVATE_ADMIN',
      resource: 'admin',
      resourceId: admin._id.toString(),
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
      status: 'success',
    });

    sendSuccess(res, null, 'Admin deactivated successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// DASHBOARD & STATISTICS
// ============================================================================

export async function getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    // Cache dashboard data for 30 seconds — high-frequency endpoint
    const dashboard = await getCachedDashboard(async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        totalUsers,
        activeUsers,
        pendingKyc,
        totalTransactions,
        todayTransactions,
        transactionVolume,
        activeLoans,
        pendingLoanApps,
        activeCards,
        openFraudCases,
      ] = await Promise.all([
        Users.estimatedDocumentCount(),
        Users.countDocuments({ accountStatus: 'active' }),
        Users.countDocuments({ kycStatus: 'pending' }),
        Transactions.estimatedDocumentCount(),
        Transactions.countDocuments({ createdAt: { $gte: today } }),
        Transactions.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Loans.countDocuments({ status: { $in: ['active', 'disbursed'] } }),
        Loans.countDocuments({ status: 'pending' }),
        Cards.countDocuments({ status: 'active' }),
        FraudCases.countDocuments({ status: 'open' }),
      ]);

      return {
        users: {
          total: totalUsers,
          active: activeUsers,
          pendingKyc,
        },
        transactions: {
          total: totalTransactions,
          today: todayTransactions,
          volume: transactionVolume[0]?.total || 0,
        },
        loans: {
          active: activeLoans,
          pendingApplications: pendingLoanApps,
        },
        cards: {
          active: activeCards,
        },
        fraud: {
          openCases: openFraudCases,
        },
      };
    });

    sendSuccess(res, { dashboard });
  } catch (error) {
    next(error);
  }
}

export async function getAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { period } = req.query; // 'day' | 'week' | 'month' | 'year'
    
    let startDate = new Date();
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Transactions analytics
    const transactionStats = await Transactions.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          volume: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // User growth
    const userGrowth = await Users.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Transactions type distribution
    const typeDistribution = await Transactions.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          volume: { $sum: '$amount' },
        },
      },
    ]);

    sendSuccess(res, {
      analytics: {
        period,
        transactions: {
          daily: transactionStats,
          byType: typeDistribution,
        },
        users: {
          growth: userGrowth,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// SYSTEM SETTINGS
// ============================================================================

export async function getSystemSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const settings = await SystemSettings.find().lean();
    
    const settingsMap = settings.reduce((acc: any, s) => {
      acc[s.key] = {
        value: s.value,
        dataType: s.dataType,
        category: s.category,
        description: s.description,
      };
      return acc;
    }, {});

    sendSuccess(res, { settings: settingsMap });
  } catch (error) {
    next(error);
  }
}

export async function updateSystemSetting(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { key, value } = req.body;

    const setting = await SystemSettings.findOneAndUpdate(
      { key },
      { 
        value,
        updatedBy: req.user.userId,
        updatedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    await AdminActionLogs.create({
      admin: req.user.userId,
      action: 'UPDATE_SETTING',
      resource: 'setting',
      resourceId: setting._id.toString(),
      changes: { key, newValue: value },
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
      status: 'success',
    });

    broadcast(WS.ADMIN.SETTING_UPDATED, {
      key,
      value,
      updatedBy: req.user!.userId,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, { setting }, 'Setting updated successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// USER MANAGEMENT (Admin perspective)
// ============================================================================

export async function searchUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { query, status, kycStatus, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const filter: any = {};
    
    if (query) {
      const searchTerm = (query as string).trim();
      if (searchTerm.length >= 3) {
        // Use $text index for performant full-text search
        filter.$text = { $search: searchTerm };
      } else {
        // For short queries, use prefix-anchored regex (safe + indexed)
        const sanitized = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.$or = [
          { email: new RegExp(`^${sanitized}`, 'i') },
          { firstName: new RegExp(`^${sanitized}`, 'i') },
          { lastName: new RegExp(`^${sanitized}`, 'i') },
        ];
      }
    }
    if (status) filter.accountStatus = status;
    if (kycStatus) filter.kycStatus = kycStatus;

    const [users, total] = await Promise.all([
      Users.find(filter)
        .select('-password -twoFactorSecret')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string))
        .lean(),
      Users.countDocuments(filter),
    ]);

    sendPaginated(res, users, { page: parseInt(page as string), limit: parseInt(limit as string), total });
  } catch (error) {
    next(error);
  }
}

export async function getUserDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { id } = req.params;

    const user = await Users.findById(id).select('-password -twoFactorSecret').lean();
    if (!user) throw new NotFoundError('User not found');

    // Get related data — use .select() projections to avoid returning full documents
    const [wallets, recentTransactions, loans, cards] = await Promise.all([
      Wallets.find({ user: id })
        .select('walletNumber status balances isPrimary walletType createdAt')
        .lean(),
      Transactions.find({ initiatedBy: id })
        .select('type amount currency status referenceNumber createdAt completedAt')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Loans.find({ user: id })
        .select('loanType status principalAmount interestRate createdAt')
        .lean(),
      Cards.find({ user: id })
        .select('cardType brand status last4 expiryDate createdAt')
        .lean(),
    ]);

    sendSuccess(res, {
      user,
      wallets,
      recentTransactions,
      loans,
      cards: cards.map(c => ({ ...c, cardNumber: '****', cvv: '***', pin: undefined })),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { id } = req.params;
    const { status, reason } = req.body;

    const user = await Users.findById(id);
    if (!user) throw new NotFoundError('User not found');

    const oldStatus = user.accountStatus;
    user.accountStatus = status;
    
    if (status === 'suspended' || status === 'banned') {
      user.suspensionReason = reason;
    }

    await user.save();

    await AdminActionLogs.create({
      admin: req.user.userId,
      action: 'UPDATE_USER_STATUS',
      resource: 'user',
      resourceId: (user._id as any).toString(),
      changes: { oldStatus, newStatus: status, reason },
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
      status: 'success',
    });

    // Notify user using template
    const emailContent = emailGenerator.accountStatusUpdateEmail({
      firstName: String(user.firstName),
      email: String(user.email),
      status: status as 'active' | 'suspended' | 'banned' | 'restricted',
      reason: reason || undefined,
      effectiveDate: new Date().toISOString(),
      appealUrl: `${process.env.FRONTEND_URL || 'https://remit.com'}/support`,
      userId: (user._id as any).toString(),
    });

    sendTemplatedMail(String(user.email), emailContent).catch(console.error);

    emitToUser((user._id as any).toString(), WS.ADMIN.USER_STATUS_CHANGED, {
      userId: (user._id as any).toString(),
      status: user.accountStatus,
      reason: reason || undefined,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, { user: { id: user._id, status: user.accountStatus } }, 'User status updated');
  } catch (error) {
    next(error);
  }
}

export async function resetUserPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { id } = req.params;

    const user = await Users.findById(id);
    if (!user) throw new NotFoundError('User not found');

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
    user.password = await bcrypt.hash(tempPassword, 12);
    user.mustChangePassword = true;
    await user.save();

    await AdminActionLogs.create({
      admin: req.user.userId,
      action: 'RESET_USER_PASSWORD',
      resource: 'user',
      resourceId: (user._id as any).toString(),
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
      status: 'success',
    });

    // Send email with temporary password using template
    const emailContent = emailGenerator.passwordResetEmail({
      firstName: String(user.firstName),
      resetUrl: `${process.env.FRONTEND_URL || 'https://remit.com'}/auth/reset-password?temp=${encodeURIComponent(tempPassword)}`,
      userId: (user._id as any).toString(),
    });

    sendTemplatedMail(String(user.email), emailContent).catch(console.error);

    emitToUser((user._id as any).toString(), WS.ADMIN.USER_PASSWORD_RESET, {
      userId: (user._id as any).toString(),
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, null, 'Password reset successfully. User notified via email.');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

export async function getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.adminId) filter.admin = req.query.adminId;
    if (req.query.targetType) filter.targetType = req.query.targetType;

    const [logs, total] = await Promise.all([
      AdminActionLogs.find(filter)
        .populate('admin', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdminActionLogs.countDocuments(filter),
    ]);

    sendPaginated(res, logs, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// OPERATIONAL TASKS
// ============================================================================

export async function getOperationalTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

    const tasks = await OperationalTasks.find(filter)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    sendSuccess(res, { tasks });
  } catch (error) {
    next(error);
  }
}

export async function createOperationalTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { title, description, priority, assignedTo, dueDate, category } = req.body;

    const task = new OperationalTasks({
      title,
      description,
      priority: priority || 'medium',
      status: 'pending',
      assignedTo,
      createdBy: req.user.userId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      category,
    });

    await task.save();

    sendCreated(res, { task }, 'Task created successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateOperationalTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { id } = req.params;
    const updates = req.body;

    const task = await OperationalTasks.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!task) throw new NotFoundError('Task not found');

    sendSuccess(res, { task }, 'Task updated successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// SUPER ADMIN PROFILE MANAGEMENT
// ============================================================================

/**
 * Get current admin profile
 * GET /admin/profile
 */
export async function getAdminProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const admin = await AdminUsers.findById(req.user.userId)
      .select('-password -twoFactorSecret -pendingOtp -passwordHistory')
      .populate('permissions')
      .lean();

    if (!admin) throw new NotFoundError('Admin not found');

    sendSuccess(res, { admin });
  } catch (error) {
    next(error);
  }
}

/**
 * Request OTP for sensitive operation
 * POST /admin/request-otp
 */
export async function requestOtp(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { purpose } = req.body; // 'password_change', 'email_change', 'sensitive_action'

    if (!purpose) throw new ValidationError('Purpose is required');

    const admin = await AdminUsers.findById(req.user.userId);
    if (!admin) throw new NotFoundError('Admin not found');

    // Generate OTP
    const { code, expiresAt } = generateOtp();

    admin.pendingOtp = {
      code,
      purpose,
      expiresAt,
      attempts: 0,
    };

    await admin.save();

    // Send OTP via email
    const emailContent = emailGenerator.otpEmail({
      firstName: admin.firstName,
      email: admin.email,
      otpCode: code,
      purpose: purpose === 'password_change' ? 'Password Change' : 
               purpose === 'email_change' ? 'Email Change' : 'Sensitive Operation',
      expiresIn: '10 minutes',
    });

    await sendTemplatedMail(admin.email, emailContent);

    // Log action
    await AdminActionLogs.create({
      admin: req.user.userId,
      action: 'REQUEST_OTP',
      resource: 'admin',
      resourceId: req.user.userId,
      changes: { purpose },
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
      status: 'success',
    });

    sendSuccess(res, { message: 'OTP sent to your email' });
  } catch (error) {
    next(error);
  }
}

/**
 * Update admin profile (with OTP for sensitive changes)
 * PUT /admin/profile
 */
export async function updateAdminProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { firstName, lastName, phone, avatar } = req.body;

    const admin = await AdminUsers.findById(req.user.userId);
    if (!admin) throw new NotFoundError('Admin not found');

    // For basic profile updates, no OTP needed
    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (phone) admin.phone = phone;
    if (avatar) admin.avatar = avatar;

    admin.updatedAt = new Date();
    await admin.save();

    // Log action
    await AdminActionLogs.create({
      admin: req.user.userId,
      action: 'UPDATE_PROFILE',
      resource: 'admin',
      resourceId: req.user.userId,
      changes: { firstName, lastName, phone },
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
      status: 'success',
    });

    sendSuccess(res, {
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        phone: admin.phone,
        avatar: admin.avatar,
        role: admin.role,
      },
    }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Change admin password (requires OTP)
 * PUT /admin/change-password
 */
export async function changeAdminPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { currentPassword, newPassword, otp } = req.body;

    if (!currentPassword || !newPassword || !otp) {
      throw new ValidationError('Current password, new password, and OTP are required');
    }

    const admin = await AdminUsers.findById(req.user.userId);
    if (!admin) throw new NotFoundError('Admin not found');

    // Verify OTP
    if (!verifyOtp(admin, otp, 'password_change')) {
      admin.pendingOtp!.attempts = (admin.pendingOtp?.attempts || 0) + 1;
      await admin.save();
      throw new ValidationError('Invalid or expired OTP');
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Check password history (prevent reuse of last 5 passwords)
    if (admin.passwordHistory && admin.passwordHistory.length > 0) {
      for (const oldHash of admin.passwordHistory.slice(-5)) {
        if (await bcrypt.compare(newPassword, oldHash)) {
          throw new ValidationError('Cannot reuse recent passwords');
        }
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    admin.passwordHistory = admin.passwordHistory || [];
    admin.passwordHistory.push(admin.password);
    admin.password = hashedPassword;
    admin.passwordChangedAt = new Date();
    admin.mustChangePassword = false;
    admin.pendingOtp = undefined;

    await admin.save();

    // Log action
    await AdminActionLogs.create({
      admin: req.user.userId,
      action: 'CHANGE_PASSWORD',
      resource: 'admin',
      resourceId: req.user.userId,
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
      status: 'success',
    });

    // Send confirmation email
    const emailContent = emailGenerator.passwordChangedEmail({
      firstName: admin.firstName,
      email: admin.email,
      changedAt: new Date().toISOString(),
    });
    sendTemplatedMail(admin.email, emailContent).catch(console.error);

    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Update admin email (requires OTP)
 * PUT /admin/change-email
 */
export async function changeAdminEmail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { newEmail, password, otp } = req.body;

    if (!newEmail || !password || !otp) {
      throw new ValidationError('New email, password, and OTP are required');
    }

    const admin = await AdminUsers.findById(req.user.userId);
    if (!admin) throw new NotFoundError('Admin not found');

    // Verify OTP
    if (!verifyOtp(admin, otp, 'email_change')) {
      admin.pendingOtp!.attempts = (admin.pendingOtp?.attempts || 0) + 1;
      await admin.save();
      throw new ValidationError('Invalid or expired OTP');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      throw new UnauthorizedError('Password is incorrect');
    }

    // Check if email is already taken
    const existing = await AdminUsers.findOne({ email: newEmail.toLowerCase() });
    if (existing) {
      throw new ValidationError('Email is already in use');
    }

    const oldEmail = admin.email;
    admin.email = newEmail.toLowerCase();
    admin.pendingOtp = undefined;
    admin.updatedAt = new Date();

    await admin.save();

    // Log action
    await AdminActionLogs.create({
      admin: req.user.userId,
      action: 'CHANGE_EMAIL',
      resource: 'admin',
      resourceId: req.user.userId,
      changes: { oldEmail, newEmail },
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
      status: 'success',
    });

    // Send notification to both emails
    try {
      const emailContent = {
        EMAIL_TITLE: 'Email Address Changed',
        GREETING: `Hello ${admin.firstName},`,
        MAIN_CONTENT: `
          <p>Your email address has been changed.</p>
          <p><strong>Previous email:</strong> ${oldEmail}</p>
          <p><strong>New email:</strong> ${newEmail}</p>
          <p>If you did not make this change, please contact support immediately.</p>
        `,
        COMPANY_NAME: 'Nordea Remittance',
        YEAR: new Date().getFullYear(),
        FOOTER_TEXT: 'This is an automated security notification from Nordea Remittance.',
      };
      sendTemplatedMail(oldEmail, emailContent as any).catch(console.error);
      sendTemplatedMail(newEmail, emailContent as any).catch(console.error);
    } catch (emailError) {
      console.error('Failed to send email change notification:', emailError);
    }

    sendSuccess(res, { email: admin.email }, 'Email changed successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// PERMISSION MANAGEMENT (Super Admin Only)
// ============================================================================

/**
 * Get all available permissions
 * GET /admin/permissions/available
 */
export async function getAvailablePermissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const permissions = {
      userManagement: [
        { key: 'canViewUsers', label: 'View Users', description: 'View user accounts and details' },
        { key: 'canEditUsers', label: 'Edit Users', description: 'Edit user account details' },
        { key: 'canSuspendUsers', label: 'Suspend Users', description: 'Suspend user accounts' },
        { key: 'canDeleteUsers', label: 'Delete Users', description: 'Delete user accounts' },
        { key: 'canVerifyKyc', label: 'Verify KYC', description: 'Review and verify KYC documents' },
      ],
      transactionManagement: [
        { key: 'canViewTransactions', label: 'View Transactions', description: 'View all transactions' },
        { key: 'canReverseTransactions', label: 'Reverse Transactions', description: 'Reverse completed transactions' },
        { key: 'canRefundTransactions', label: 'Refund Transactions', description: 'Process refunds' },
        { key: 'canAdjustBalances', label: 'Adjust Balances', description: 'Credit/debit user wallets' },
      ],
      financialOperations: [
        { key: 'canManageLoans', label: 'Manage Loans', description: 'View and manage loan applications' },
        { key: 'canApproveLoans', label: 'Approve Loans', description: 'Approve/reject loan applications' },
        { key: 'canManageInvestments', label: 'Manage Investments', description: 'Manage investment accounts' },
        { key: 'canManageCards', label: 'Manage Cards', description: 'Manage card applications' },
      ],
      fraudSecurity: [
        { key: 'canViewFraudCases', label: 'View Fraud Cases', description: 'View fraud investigation cases' },
        { key: 'canManageFraudCases', label: 'Manage Fraud Cases', description: 'Manage and resolve fraud cases' },
        { key: 'canBlockAccounts', label: 'Block Accounts', description: 'Block suspicious accounts' },
        { key: 'canAccessSecurityLogs', label: 'Access Security Logs', description: 'View security audit logs' },
      ],
      systemConfiguration: [
        { key: 'canManageSettings', label: 'Manage Settings', description: 'Configure system settings' },
        { key: 'canManageAdmins', label: 'Manage Admins', description: 'Create and manage admin accounts' },
        { key: 'canViewReports', label: 'View Reports', description: 'Access analytics and reports' },
        { key: 'canExportData', label: 'Export Data', description: 'Export system data' },
      ],
      support: [
        { key: 'canManageTickets', label: 'Manage Tickets', description: 'Handle support tickets' },
        { key: 'canViewCustomerData', label: 'View Customer Data', description: 'Access customer information' },
      ],
    };

    sendSuccess(res, { permissions });
  } catch (error) {
    next(error);
  }
}

/**
 * Get admin permissions
 * GET /admin/admins/:adminId/permissions
 */
export async function getAdminPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { adminId } = req.params;

    const admin = await AdminUsers.findById(adminId);
    if (!admin) throw new NotFoundError('Admin not found');

    const permissions = await AdminPermissions.findOne({ admin: adminId });

    sendSuccess(res, {
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
      permissions: permissions || null,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update admin permissions (Super Admin only)
 * PUT /admin/admins/:adminId/permissions
 */
export async function updateAdminPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    // Only super admin can update permissions
    const currentAdmin = await AdminUsers.findById(req.user.userId);
    if (currentAdmin?.role !== 'super_admin') {
      throw new ForbiddenError('Only super admin can manage permissions');
    }

    const { adminId } = req.params;
    const permissionUpdates = req.body;

    const targetAdmin = await AdminUsers.findById(adminId);
    if (!targetAdmin) throw new NotFoundError('Admin not found');

    // Cannot modify super admin's permissions
    if (targetAdmin.role === 'super_admin') {
      throw new ForbiddenError('Cannot modify super admin permissions');
    }

    // Upsert permissions
    const permissions = await AdminPermissions.findOneAndUpdate(
      { admin: adminId },
      {
        $set: {
          ...permissionUpdates,
          updatedAt: new Date(),
        },
      },
      { new: true, upsert: true }
    );

    // Link permissions to admin if not already
    if (!targetAdmin.permissions) {
      targetAdmin.permissions = permissions._id as any;
      await targetAdmin.save();
    }

    // Log action
    await AdminActionLogs.create({
      admin: req.user.userId,
      action: 'UPDATE_ADMIN_PERMISSIONS',
      resource: 'admin_permissions',
      resourceId: String(adminId),
      changes: permissionUpdates,
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
      status: 'success',
    });

    // Notify admin of permission changes
    try {
      const emailContent = {
        EMAIL_TITLE: 'Your Admin Permissions Have Been Updated',
        GREETING: `Hello ${targetAdmin.firstName},`,
        MAIN_CONTENT: `
          <p>Your admin permissions have been updated by ${currentAdmin.firstName} ${currentAdmin.lastName}.</p>
          <p>Please log in to view your updated permissions.</p>
          <p>If you have questions about these changes, please contact your supervisor.</p>
        `,
        COMPANY_NAME: 'Nordea Remittance',
        YEAR: new Date().getFullYear(),
        FOOTER_TEXT: 'This is an automated notification from Nordea Remittance.',
      };
      sendTemplatedMail(targetAdmin.email, emailContent as any).catch(console.error);
    } catch (emailError) {
      console.error('Failed to send permissions update email:', emailError);
    }

    sendSuccess(res, { permissions }, 'Permissions updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Set all permissions for an admin (quick setup)
 * POST /admin/admins/:adminId/permissions/preset
 */
export async function setPermissionPreset(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    // Only super admin can set presets
    const currentAdmin = await AdminUsers.findById(req.user.userId);
    if (currentAdmin?.role !== 'super_admin') {
      throw new ForbiddenError('Only super admin can manage permissions');
    }

    const { adminId } = req.params;
    const { preset } = req.body; // 'full', 'limited', 'readonly', 'support', 'compliance'

    const targetAdmin = await AdminUsers.findById(adminId);
    if (!targetAdmin) throw new NotFoundError('Admin not found');

    if (targetAdmin.role === 'super_admin') {
      throw new ForbiddenError('Cannot modify super admin permissions');
    }

    let permissionValues: Record<string, boolean>;

    switch (preset) {
      case 'full':
        // All permissions except managing other admins
        permissionValues = {
          canViewUsers: true,
          canEditUsers: true,
          canSuspendUsers: true,
          canDeleteUsers: false,
          canVerifyKyc: true,
          canViewTransactions: true,
          canReverseTransactions: true,
          canRefundTransactions: true,
          canAdjustBalances: true,
          canManageLoans: true,
          canApproveLoans: true,
          canManageInvestments: true,
          canManageCards: true,
          canViewFraudCases: true,
          canManageFraudCases: true,
          canBlockAccounts: true,
          canAccessSecurityLogs: true,
          canManageSettings: false,
          canManageAdmins: false,
          canViewReports: true,
          canExportData: true,
          canManageTickets: true,
          canViewCustomerData: true,
        };
        break;
      case 'limited':
        // View-only with limited actions
        permissionValues = {
          canViewUsers: true,
          canEditUsers: false,
          canSuspendUsers: false,
          canDeleteUsers: false,
          canVerifyKyc: false,
          canViewTransactions: true,
          canReverseTransactions: false,
          canRefundTransactions: false,
          canAdjustBalances: false,
          canManageLoans: true,
          canApproveLoans: false,
          canManageInvestments: false,
          canManageCards: false,
          canViewFraudCases: true,
          canManageFraudCases: false,
          canBlockAccounts: false,
          canAccessSecurityLogs: false,
          canManageSettings: false,
          canManageAdmins: false,
          canViewReports: true,
          canExportData: false,
          canManageTickets: true,
          canViewCustomerData: true,
        };
        break;
      case 'readonly':
        // Read-only access
        permissionValues = {
          canViewUsers: true,
          canEditUsers: false,
          canSuspendUsers: false,
          canDeleteUsers: false,
          canVerifyKyc: false,
          canViewTransactions: true,
          canReverseTransactions: false,
          canRefundTransactions: false,
          canAdjustBalances: false,
          canManageLoans: false,
          canApproveLoans: false,
          canManageInvestments: false,
          canManageCards: false,
          canViewFraudCases: true,
          canManageFraudCases: false,
          canBlockAccounts: false,
          canAccessSecurityLogs: false,
          canManageSettings: false,
          canManageAdmins: false,
          canViewReports: true,
          canExportData: false,
          canManageTickets: false,
          canViewCustomerData: true,
        };
        break;
      case 'support':
        // Support agent permissions
        permissionValues = {
          canViewUsers: true,
          canEditUsers: false,
          canSuspendUsers: false,
          canDeleteUsers: false,
          canVerifyKyc: false,
          canViewTransactions: true,
          canReverseTransactions: false,
          canRefundTransactions: true,
          canAdjustBalances: false,
          canManageLoans: false,
          canApproveLoans: false,
          canManageInvestments: false,
          canManageCards: false,
          canViewFraudCases: false,
          canManageFraudCases: false,
          canBlockAccounts: false,
          canAccessSecurityLogs: false,
          canManageSettings: false,
          canManageAdmins: false,
          canViewReports: false,
          canExportData: false,
          canManageTickets: true,
          canViewCustomerData: true,
        };
        break;
      case 'compliance':
        // Compliance officer permissions
        permissionValues = {
          canViewUsers: true,
          canEditUsers: false,
          canSuspendUsers: true,
          canDeleteUsers: false,
          canVerifyKyc: true,
          canViewTransactions: true,
          canReverseTransactions: false,
          canRefundTransactions: false,
          canAdjustBalances: false,
          canManageLoans: true,
          canApproveLoans: false,
          canManageInvestments: false,
          canManageCards: false,
          canViewFraudCases: true,
          canManageFraudCases: true,
          canBlockAccounts: true,
          canAccessSecurityLogs: true,
          canManageSettings: false,
          canManageAdmins: false,
          canViewReports: true,
          canExportData: true,
          canManageTickets: false,
          canViewCustomerData: true,
        };
        break;
      default:
        throw new ValidationError('Invalid preset. Use: full, limited, readonly, support, compliance');
    }

    const permissions = await AdminPermissions.findOneAndUpdate(
      { admin: adminId },
      { $set: { ...permissionValues, updatedAt: new Date() } },
      { new: true, upsert: true }
    );

    // Link to admin
    targetAdmin.permissions = permissions._id as any;
    targetAdmin.role = preset === 'compliance' ? 'compliance_officer' : 
                       preset === 'support' ? 'support_agent' : 'admin';
    await targetAdmin.save();

    // Log action
    await AdminActionLogs.create({
      admin: req.user.userId,
      action: 'SET_PERMISSION_PRESET',
      resource: 'admin_permissions',
      resourceId: String(adminId),
      changes: { preset },
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
      status: 'success',
    });

    sendSuccess(res, { 
      admin: {
        id: targetAdmin._id,
        role: targetAdmin.role,
      },
      permissions,
      preset,
    }, `Permissions set to "${preset}" preset`);
  } catch (error) {
    next(error);
  }
}

/**
 * Revoke all permissions from an admin
 * DELETE /admin/admins/:adminId/permissions
 */
export async function revokeAllPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    // Only super admin can revoke permissions
    const currentAdmin = await AdminUsers.findById(req.user.userId);
    if (currentAdmin?.role !== 'super_admin') {
      throw new ForbiddenError('Only super admin can revoke permissions');
    }

    const { adminId } = req.params;

    const targetAdmin = await AdminUsers.findById(adminId);
    if (!targetAdmin) throw new NotFoundError('Admin not found');

    if (targetAdmin.role === 'super_admin') {
      throw new ForbiddenError('Cannot revoke super admin permissions');
    }

    // Set all permissions to false
    await AdminPermissions.findOneAndUpdate(
      { admin: adminId },
      {
        $set: {
          canViewUsers: false,
          canEditUsers: false,
          canSuspendUsers: false,
          canDeleteUsers: false,
          canVerifyKyc: false,
          canViewTransactions: false,
          canReverseTransactions: false,
          canRefundTransactions: false,
          canAdjustBalances: false,
          canManageLoans: false,
          canApproveLoans: false,
          canManageInvestments: false,
          canManageCards: false,
          canViewFraudCases: false,
          canManageFraudCases: false,
          canBlockAccounts: false,
          canAccessSecurityLogs: false,
          canManageSettings: false,
          canManageAdmins: false,
          canViewReports: false,
          canExportData: false,
          canManageTickets: false,
          canViewCustomerData: false,
          updatedAt: new Date(),
        },
      }
    );

    // Log action
    await AdminActionLogs.create({
      admin: req.user.userId,
      action: 'REVOKE_ALL_PERMISSIONS',
      resource: 'admin_permissions',
      resourceId: String(adminId),
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
      status: 'success',
    });

    // Notify admin
    try {
      const emailContent = {
        EMAIL_TITLE: 'Your Admin Permissions Have Been Revoked',
        GREETING: `Hello ${targetAdmin.firstName},`,
        MAIN_CONTENT: `
          <p>Your admin permissions have been revoked by ${currentAdmin.firstName} ${currentAdmin.lastName}.</p>
          <p>You will no longer have access to administrative functions.</p>
          <p>If you believe this is an error, please contact your supervisor.</p>
        `,
        COMPANY_NAME: 'Nordea Remittance',
        YEAR: new Date().getFullYear(),
        FOOTER_TEXT: 'This is an automated notification from Nordea Remittance.',
      };
      sendTemplatedMail(targetAdmin.email, emailContent as any).catch(console.error);
    } catch (emailError) {
      console.error('Failed to send permissions revoked email:', emailError);
    }

    sendSuccess(res, null, 'All permissions revoked');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  // Authentication
  adminLogin,
  adminLogout,
  
  // Admin Management
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deactivateAdminUser,
  
  // Profile Management
  getAdminProfile,
  requestOtp,
  updateAdminProfile,
  changeAdminPassword,
  changeAdminEmail,
  
  // Permission Management
  getAvailablePermissions,
  getAdminPermissions,
  updateAdminPermissions,
  setPermissionPreset,
  revokeAllPermissions,
  
  // Dashboard & Analytics
  getDashboard,
  getAnalytics,
  
  // System Settings
  getSystemSettings,
  updateSystemSetting,
  
  // User Management
  searchUsers,
  getUserDetails,
  updateUserStatus,
  resetUserPassword,
  
  // Audit & Tasks
  getAuditLogs,
  getOperationalTasks,
  createOperationalTask,
  updateOperationalTask,
};
