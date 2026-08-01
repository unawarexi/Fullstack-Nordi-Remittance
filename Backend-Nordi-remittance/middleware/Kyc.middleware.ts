// ============================================================================
// KYC (KNOW YOUR CUSTOMER) MIDDLEWARE
// ============================================================================

import { Response, NextFunction } from 'express';
import { KycStatus } from '../types/index.js';
import type { AuthenticatedRequest } from '../types/index.js';
import Users from '../modules/users/users.model.js';
import Permissions from '../modules/permissions/permissions.model.js';
import { 
  KycNotVerifiedError, 
  ForbiddenError,
  UnauthorizedError 
} from '../core/errors/AppError.js';

// ============================================================================
// KYC STATUS CHECK
// ============================================================================

/**
 * Require KYC verification for the action
 */
export async function requireKycVerified(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const user = await Users.findById(req.user.userId)
      .select('kycStatus')
      .lean();

    if (!user) {
      return next(new UnauthorizedError('User not found'));
    }

    if (user.kycStatus !== KycStatus.APPROVED) {
      return next(new KycNotVerifiedError(
        `KYC verification required. Current status: ${user.kycStatus}`
      ));
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Require minimum KYC tier for the action
 */
export function requireKycTier(minimumTier: 'basic' | 'intermediate' | 'advanced') {
  const tierOrder = { basic: 1, intermediate: 2, advanced: 3 };

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError('Authentication required'));
      }

      const user = await Users.findById(req.user.userId)
        .select('kycStatus')
        .lean();

      if (!user || user.kycStatus !== KycStatus.APPROVED) {
        return next(new KycNotVerifiedError('KYC verification required'));
      }

      // For now, assume approved = intermediate tier
      // In production, you'd have a separate kycTier field
      const userTier = 'intermediate';
      const userTierLevel = tierOrder[userTier];
      const requiredTierLevel = tierOrder[minimumTier];

      if (userTierLevel < requiredTierLevel) {
        return next(new KycNotVerifiedError(
          `This action requires ${minimumTier} KYC verification level`
        ));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// ============================================================================
// FEATURE GATING BASED ON KYC
// ============================================================================

type FeatureType = 
  | 'domestic_transfer'
  | 'international_transfer'
  | 'card_payments'
  | 'crypto_transfer'
  | 'large_transaction'
  | 'loan_application'
  | 'investment';

const featureKycRequirements: Record<FeatureType, KycStatus | 'any'> = {
  domestic_transfer: KycStatus.PENDING, // Allow with pending KYC
  international_transfer: KycStatus.APPROVED,
  card_payments: KycStatus.APPROVED,
  crypto_transfer: KycStatus.APPROVED,
  large_transaction: KycStatus.APPROVED,
  loan_application: KycStatus.APPROVED,
  investment: KycStatus.APPROVED,
};

/**
 * Gate features based on KYC status
 */
export function requireFeatureAccess(feature: FeatureType) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError('Authentication required'));
      }

      const requiredKyc = featureKycRequirements[feature];

      // If 'any' is allowed, skip KYC check
      if (requiredKyc === 'any') {
        return next();
      }

      const user = await Users.findById(req.user.userId)
        .select('kycStatus')
        .lean();

      if (!user) {
        return next(new UnauthorizedError('User not found'));
      }

      // Check KYC status
      if (requiredKyc === KycStatus.APPROVED && user.kycStatus !== KycStatus.APPROVED) {
        return next(new KycNotVerifiedError(
          `${feature.replace('_', ' ')} requires KYC verification`
        ));
      }

      // Check user permissions for the feature
      const permissions = await Permissions.findOne({ userId: req.user.userId }).lean();

      if (permissions) {
        const permissionMap: Partial<Record<FeatureType, keyof typeof permissions>> = {
          domestic_transfer: 'enableDomesticTransfers',
          international_transfer: 'enableInternationalTransfers',
          card_payments: 'enableCardPayments',
          crypto_transfer: 'enableCryptoTransfers',
          // Add more mappings as needed
        };

        const permissionKey = permissionMap[feature];
        if (permissionKey && permissions[permissionKey] === false) {
          return next(new ForbiddenError(
            `${feature.replace('_', ' ')} is not enabled for your account`
          ));
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// ============================================================================
// TRANSACTION AMOUNT LIMITS BASED ON KYC
// ============================================================================

interface KycLimits {
  dailyLimit: number;
  monthlyLimit: number;
  perTransactionLimit: number;
}

const kycStatusLimits: Record<KycStatus, KycLimits> = {
  [KycStatus.PENDING]: {
    dailyLimit: 500,
    monthlyLimit: 2000,
    perTransactionLimit: 200,
  },
  [KycStatus.APPROVED]: {
    dailyLimit: 50000,
    monthlyLimit: 200000,
    perTransactionLimit: 25000,
  },
  [KycStatus.REJECTED]: {
    dailyLimit: 0,
    monthlyLimit: 0,
    perTransactionLimit: 0,
  },
  [KycStatus.EXPIRED]: {
    dailyLimit: 500,
    monthlyLimit: 2000,
    perTransactionLimit: 200,
  },
};

/**
 * Enforce transaction limits based on KYC status
 */
export async function enforceKycLimits(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const { amount } = req.body;

    const user = await Users.findById(req.user.userId)
      .select('kycStatus')
      .lean();

    if (!user) {
      return next(new UnauthorizedError('User not found'));
    }

    const limits = kycStatusLimits[user.kycStatus as KycStatus] || kycStatusLimits.pending;

    // Check per-transaction limit
    if (amount > limits.perTransactionLimit) {
      return next(new ForbiddenError(
        `Transaction amount exceeds your limit of ${limits.perTransactionLimit}. ` +
        (user.kycStatus !== 'approved' 
          ? 'Complete KYC verification to increase your limits.' 
          : 'Contact support to increase your limits.')
      ));
    }

    // Attach limits to request for further processing
    req.body.kycLimits = limits;

    next();
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// GEOGRAPHIC RESTRICTIONS
// ============================================================================

// Sanctioned or restricted countries
const restrictedCountries = [
  'KP', // North Korea
  'IR', // Iran
  'CU', // Cuba
  'SY', // Syria
  'SD', // Sudan
];

/**
 * Check geographic restrictions
 */
export async function checkGeographicRestrictions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { recipientCountry, destinationCountry } = req.body;
    const countryToCheck = recipientCountry || destinationCountry;

    if (countryToCheck && restrictedCountries.includes(countryToCheck.toUpperCase())) {
      return next(new ForbiddenError(
        'Transactions to/from this country are not permitted due to regulatory restrictions'
      ));
    }

    next();
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// AML (ANTI-MONEY LAUNDERING) CHECKS
// ============================================================================

/**
 * Basic AML screening
 */
export async function amlScreening(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { amount, type, recipientName } = req.body;

    // Flag transactions requiring enhanced due diligence
    const amlFlags: string[] = [];

    // Large transaction threshold (example: $10,000)
    if (amount > 10000) {
      amlFlags.push('large_transaction');
    }

    // Cash-related transactions
    if (type === 'withdrawal' && amount > 3000) {
      amlFlags.push('large_cash_withdrawal');
    }

    // Round amounts (potential structuring)
    if (amount % 1000 === 0 && amount >= 5000) {
      amlFlags.push('round_amount');
    }

    if (amlFlags.length > 0) {
      req.body.amlFlags = amlFlags;
      req.body.requiresAmlReview = true;
    }

    next();
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// VELOCITY CHECKS
// ============================================================================

/**
 * Check transaction velocity (frequency)
 */
export async function velocityCheck(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Velocity checks are handled in Transaction.middleware.ts
    // This is a placeholder for additional KYC-specific velocity rules
    next();
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  requireKycVerified,
  requireKycTier,
  requireFeatureAccess,
  enforceKycLimits,
  checkGeographicRestrictions,
  amlScreening,
  velocityCheck,
};