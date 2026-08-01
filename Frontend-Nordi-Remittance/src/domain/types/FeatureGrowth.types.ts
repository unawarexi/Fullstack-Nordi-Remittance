// ============================================================================
// FEATURE GROWTH TYPES — Mirrors FeatureGrowthModel.ts
// FeatureFlag, Referral, Reward, Promotion
// ============================================================================

declare global {
  interface FeatureFlag {
    flagId: UUID;
    name: string;
    key: string;
    description: string;
    isEnabled: boolean;
    rolloutPercentage: number;
    environment: 'development' | 'staging' | 'production' | 'all';
    targetUsers?: string[];
    targetSegments?: string[];
    excludedUsers?: string[];
    startDate?: ISO8601Date;
    endDate?: ISO8601Date;
    metadata?: Record<string, unknown>;
    createdBy: string;
    createdAt: ISO8601Date;
    updatedAt: ISO8601Date;
  }

  interface Referral {
    referralId: UUID;
    referrer: UUID;
    referee: UUID;
    referralCode: string;
    status: 'pending' | 'completed' | 'rewarded' | 'expired' | 'cancelled';
    referralMethod: 'link' | 'code' | 'email' | 'sms' | 'social';
    referredAt: ISO8601Date;
    completedAt?: ISO8601Date;
    rewardedAt?: ISO8601Date;
    referrerReward?: number;
    refereeReward?: number;
    currency: string;
    requirementsMet: {
      accountCreated: boolean;
      kycCompleted: boolean;
      firstTransactionMade: boolean;
      minimumDepositMet: boolean;
    };
    metadata?: Record<string, unknown>;
    createdAt: ISO8601Date;
    updatedAt: ISO8601Date;
  }

  interface Reward {
    rewardId: UUID;
    user: UUID;
    rewardType: 'cashback' | 'points' | 'discount' | 'bonus' | 'referral' | 'loyalty' | 'milestone';
    amount: number;
    currency: string;
    points?: number;
    source: 'transaction' | 'referral' | 'promotion' | 'milestone' | 'loyalty_program' | 'manual';
    sourceReference?: string;
    status: 'pending' | 'credited' | 'expired' | 'cancelled';
    expiresAt?: ISO8601Date;
    creditedAt?: ISO8601Date;
    description: string;
    metadata?: Record<string, unknown>;
    createdAt: ISO8601Date;
    updatedAt: ISO8601Date;
  }

  interface Promotion {
    promotionId: UUID;
    name: string;
    code: string;
    description: string;
    promotionType: 'discount' | 'cashback' | 'bonus' | 'free_transfer' | 'reduced_fee' | 'reward_multiplier';
    discountType?: 'percentage' | 'fixed_amount';
    discountValue?: number;
    currency: string;
    status: 'draft' | 'active' | 'paused' | 'expired' | 'completed';
    startDate: ISO8601Date;
    endDate: ISO8601Date;
    usageLimit?: number;
    usageCount: number;
    perUserLimit?: number;
    minimumAmount?: number;
    maximumDiscount?: number;
    applicableServices?: string[];
    targetAudience?: {
      userSegments?: string[];
      specificUsers?: string[];
      newUsersOnly: boolean;
      minAccountAge?: number;
    };
    terms?: string;
    metadata?: Record<string, unknown>;
    createdBy: string;
    createdAt: ISO8601Date;
    updatedAt: ISO8601Date;
  }
}

export {};
