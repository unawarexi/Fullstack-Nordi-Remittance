import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const FeatureFlagSchema: Schema = new Schema({
  flagId: { type: String, required: true, unique: true, default: uuidv4 },
  name: { type: String, required: true },
  key: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  isEnabled: { type: Boolean, default: false },
  rolloutPercentage: { type: Number, default: 0, min: 0, max: 100 },
  environment: { type: String, enum: ['development', 'staging', 'production', 'all'], default: 'development' },
  targetUsers: [{ type: String }],
  targetSegments: [{ type: String }],
  excludedUsers: [{ type: String }],
  startDate: { type: Date },
  endDate: { type: Date },
  metadata: { type: Schema.Types.Mixed },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ReferralSchema: Schema = new Schema({
  referralId: { type: String, required: true, unique: true, default: uuidv4 },
  referrer: { type: String, ref: 'Users', required: true },
  referee: { type: String, ref: 'Users', required: true },
  referralCode: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'rewarded', 'expired', 'cancelled'], default: 'pending' },
  referralMethod: { type: String, enum: ['link', 'code', 'email', 'sms', 'social'], required: true },
  referredAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  rewardedAt: { type: Date },
  referrerReward: { type: Number },
  refereeReward: { type: Number },
  currency: { type: String, default: 'USD' },
  requirementsMet: {
    accountCreated: { type: Boolean, default: false },
    kycCompleted: { type: Boolean, default: false },
    firstTransactionMade: { type: Boolean, default: false },
    minimumDepositMet: { type: Boolean, default: false }
  },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const RewardSchema: Schema = new Schema({
  rewardId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: 'Users', required: true },
  rewardType: { 
    type: String, 
    enum: ['cashback', 'points', 'discount', 'bonus', 'referral', 'loyalty', 'milestone'], 
    required: true 
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  points: { type: Number },
  source: { 
    type: String, 
    enum: ['transaction', 'referral', 'promotion', 'milestone', 'loyalty_program', 'manual'], 
    required: true 
  },
  sourceReference: { type: String },
  status: { type: String, enum: ['pending', 'credited', 'expired', 'cancelled'], default: 'pending' },
  expiresAt: { type: Date },
  creditedAt: { type: Date },
  description: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const PromotionSchema: Schema = new Schema({
  promotionId: { type: String, required: true, unique: true, default: uuidv4 },
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  promotionType: { 
    type: String, 
    enum: ['discount', 'cashback', 'bonus', 'free_transfer', 'reduced_fee', 'reward_multiplier'], 
    required: true 
  },
  discountType: { type: String, enum: ['percentage', 'fixed_amount'] },
  discountValue: { type: Number },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['draft', 'active', 'paused', 'expired', 'completed'], default: 'draft' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  usageLimit: { type: Number },
  usageCount: { type: Number, default: 0 },
  perUserLimit: { type: Number },
  minimumAmount: { type: Number },
  maximumDiscount: { type: Number },
  applicableServices: [{ type: String }],
  targetAudience: {
    userSegments: [{ type: String }],
    specificUsers: [{ type: String }],
    newUsersOnly: { type: Boolean, default: false },
    minAccountAge: { type: Number }
  },
  terms: { type: String },
  metadata: { type: Schema.Types.Mixed },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
FeatureFlagSchema.index({ key: 1 }, { unique: true });
FeatureFlagSchema.index({ isEnabled: 1, environment: 1 });
ReferralSchema.index({ referrer: 1, status: 1 });
ReferralSchema.index({ referee: 1 });
ReferralSchema.index({ referralCode: 1 });
RewardSchema.index({ user: 1, status: 1 });
RewardSchema.index({ source: 1, createdAt: -1 });
PromotionSchema.index({ code: 1 }, { unique: true });
PromotionSchema.index({ status: 1, startDate: 1, endDate: 1 });

// Middleware
FeatureFlagSchema.pre('save', function () {
  this.updatedAt = new Date();
});

ReferralSchema.pre('save', function () {
  this.updatedAt = new Date();
});

RewardSchema.pre('save', function () {
  this.updatedAt = new Date();
});

PromotionSchema.pre('save', function () {
  this.updatedAt = new Date();
});

export const FeatureFlags = mongoose.model('FeatureFlags', FeatureFlagSchema);
export const Referrals = mongoose.model('Referrals', ReferralSchema);
export const Rewards = mongoose.model('Rewards', RewardSchema);
export const Promotions = mongoose.model('Promotions', PromotionSchema);

export default FeatureFlags;