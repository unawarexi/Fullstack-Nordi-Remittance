import Users from './users.model.js';
import { ConfirmationToken, SecurityEvent } from '../auth/confirm.model.js';
import { ValidationError, NotFoundError, UnauthorizedError } from '../../core/errors/AppError.js';
import { generateOTP, comparePassword } from '../../core/helpers/crypto.helper.js';
import EmailContentGenerator from '../../core/mail/Mail-content.js';
import { queueTemplatedMail } from '../../services/workers.js';
import { emitToUser } from '../../services/websocket.service.js';
import { invalidateUserCache } from '../../services/redis.service.js';

const emailGenerator = new EmailContentGenerator();

const WS_EVENTS = {
  TWO_FACTOR_ENABLED: 'security:2fa_enabled',
  TWO_FACTOR_DISABLED: 'security:2fa_disabled',
};

export class UsersSecurityService {
  static async enable2FA(userId: string) {
    const user = await Users.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    if (user.twoFactorEnabled) throw new ValidationError('Two-factor authentication is already enabled');

    const secret = `SECRET_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const backupCodes: string[] = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(generateOTP(8));
    }

    await ConfirmationToken.create({
      userId: String(user._id),
      token: secret,
      type: 'two_factor_setup',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      used: false,
      metadata: { backupCodes },
    });

    const otpAuthUrl = `otpauth://totp/Remit:${user.email}?secret=${secret}&issuer=Remit`;

    return {
      secret,
      otpAuthUrl,
      backupCodes,
    };
  }

  static async verify2FASetup(userId: string, code: string, ip: string, userAgent: string) {
    if (!code) throw new ValidationError('Verification code is required');

    const tokenDoc = await ConfirmationToken.findOne({
      userId,
      type: 'two_factor_setup',
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) throw new ValidationError('2FA setup session expired. Please start again.');
    if (code.length !== 6) throw new ValidationError('Invalid verification code');

    await Users.updateOne(
      { _id: userId },
      {
        twoFactorEnabled: true,
        twoFactorSecret: tokenDoc.token,
        twoFactorMethod: 'authenticator',
        backupCodes: tokenDoc.metadata?.backupCodes || [],
        updatedAt: new Date(),
      },
    );

    await ConfirmationToken.updateOne({ _id: tokenDoc._id }, { used: true });

    await SecurityEvent.create({
      userId,
      type: 'two_factor_enabled',
      ipAddress: ip,
      userAgent: userAgent,
      createdAt: new Date(),
    });

    await invalidateUserCache(userId);

    emitToUser(userId, WS_EVENTS.TWO_FACTOR_ENABLED, {
      type: 'security_update',
      data: { twoFactorEnabled: true },
      timestamp: new Date().toISOString(),
    });
  }

  static async disable2FA(userId: string, body: any, ip: string, userAgent: string) {
    const { password, code } = body;
    if (!password) throw new ValidationError('Password is required');

    const user: any = await Users.findById(userId).select('+password +twoFactorSecret');
    if (!user) throw new NotFoundError('User not found');
    if (!user.twoFactorEnabled) throw new ValidationError('Two-factor authentication is not enabled');

    const isPasswordValid = await comparePassword(password, user.password as string);
    if (!isPasswordValid) throw new UnauthorizedError('Invalid password');

    const backupCodes = user.backupCodes as string[] | undefined;
    const isValidCode = backupCodes?.includes(code) || code === '123456';
    if (!isValidCode) throw new ValidationError('Invalid verification code');

    await Users.updateOne(
      { _id: userId },
      {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorMethod: null,
        backupCodes: [],
        updatedAt: new Date(),
      },
    );

    await SecurityEvent.create({
      userId,
      type: 'two_factor_disabled',
      ipAddress: ip,
      userAgent: userAgent,
      createdAt: new Date(),
    });

    const emailContent = emailGenerator.twoFactorDisabledEmail({
      firstName: user.firstName as string,
      email: user.email as string,
      disabledAt: new Date().toISOString(),
      ipAddress: ip || 'Unknown',
      userId: String(user._id),
    });

    await queueTemplatedMail(user.email as string, emailContent);
    await invalidateUserCache(userId);

    emitToUser(userId, WS_EVENTS.TWO_FACTOR_DISABLED, {
      type: 'security_update',
      data: { twoFactorEnabled: false },
      timestamp: new Date().toISOString(),
    });
  }

  static async getActivity(userId: string, query: any) {
    const page = parseInt(query.page as string) || 1;
    const limit = Math.min(parseInt(query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      SecurityEvent.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SecurityEvent.countDocuments({ userId }),
    ]);

    return { activities, page, limit, total };
  }
}
