import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const NotificationSchema: Schema = new Schema({
  notificationId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: 'Users', required: true },
  type: { 
    type: String, 
    enum: ['transaction', 'security', 'kyc', 'card', 'loan', 'investment', 'account', 'system', 'promotional'], 
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  actionUrl: { type: String },
  actionLabel: { type: String },
  relatedResource: {
    resourceType: { type: String },
    resourceId: { type: String }
  },
  metadata: { type: Schema.Types.Mixed },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const EmailMessageSchema: Schema = new Schema({
  emailId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: 'Users', required: true },
  to: { type: String, required: true },
  from: { type: String, required: true },
  subject: { type: String, required: true },
  htmlBody: { type: String, required: true },
  textBody: { type: String },
  templateId: { type: String },
  templateData: { type: Schema.Types.Mixed },
  status: { 
    type: String, 
    enum: ['queued', 'sent', 'delivered', 'bounced', 'failed', 'opened', 'clicked'], 
    default: 'queued' 
  },
  provider: { type: String, enum: ['sendgrid', 'ses', 'mailgun', 'smtp'], required: true },
  providerMessageId: { type: String },
  attempts: { type: Number, default: 0 },
  lastAttemptAt: { type: Date },
  sentAt: { type: Date },
  deliveredAt: { type: Date },
  openedAt: { type: Date },
  clickedAt: { type: Date },
  bouncedAt: { type: Date },
  bounceReason: { type: String },
  failureReason: { type: String },
  requestBody: { type: Schema.Types.Mixed },
  responseBody: { type: Schema.Types.Mixed },
  attachments: [{
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    url: { type: String, required: true }
  }],
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SMSMessageSchema: Schema = new Schema({
  smsId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: 'Users', required: true },
  to: { type: String, required: true },
  from: { type: String, required: true },
  message: { type: String, required: true },
  messageType: { type: String, enum: ['otp', 'alert', 'marketing', 'transactional'], required: true },
  status: { type: String, enum: ['queued', 'sent', 'delivered', 'failed', 'expired'], default: 'queued' },
  provider: { type: String, enum: ['twilio', 'nexmo', 'sns', 'messagebird'], required: true },
  providerMessageId: { type: String },
  segments: { type: Number, default: 1 },
  cost: { type: Number },
  currency: { type: String },
  attempts: { type: Number, default: 0 },
  lastAttemptAt: { type: Date },
  sentAt: { type: Date },
  deliveredAt: { type: Date },
  failureReason: { type: String },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const PushNotificationSchema: Schema = new Schema({
  pushId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: 'Users', required: true },
  deviceTokens: [{ type: String, required: true }],
  title: { type: String, required: true },
  body: { type: String, required: true },
  imageUrl: { type: String },
  icon: { type: String },
  badge: { type: Number },
  sound: { type: String },
  priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
  clickAction: { type: String },
  data: { type: Schema.Types.Mixed },
  status: { type: String, enum: ['queued', 'sent', 'delivered', 'failed'], default: 'queued' },
  provider: { type: String, enum: ['fcm', 'apns', 'onesignal'], required: true },
  successCount: { type: Number, default: 0 },
  failureCount: { type: Number, default: 0 },
  results: [{
    deviceToken: { type: String, required: true },
    status: { type: String, enum: ['success', 'failed'], required: true },
    error: { type: String }
  }],
  sentAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const NotificationPreferenceSchema: Schema = new Schema({
  user: { type: String, ref: 'Users', required: true, unique: true },
  email: {
    enabled: { type: Boolean, default: true },
    transactions: { type: Boolean, default: true },
    security: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    accountUpdates: { type: Boolean, default: true },
    newsletters: { type: Boolean, default: false },
    productUpdates: { type: Boolean, default: true }
  },
  sms: {
    enabled: { type: Boolean, default: true },
    transactions: { type: Boolean, default: true },
    security: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    otp: { type: Boolean, default: true }
  },
  push: {
    enabled: { type: Boolean, default: true },
    transactions: { type: Boolean, default: true },
    security: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    accountUpdates: { type: Boolean, default: true }
  },
  inApp: {
    enabled: { type: Boolean, default: true },
    transactions: { type: Boolean, default: true },
    security: { type: Boolean, default: true },
    marketing: { type: Boolean, default: true },
    accountUpdates: { type: Boolean, default: true }
  },
  quietHours: {
    enabled: { type: Boolean, default: false },
    startTime: { type: String, default: '22:00' },
    endTime: { type: String, default: '08:00' },
    timezone: { type: String, default: 'UTC' }
  },
  frequency: {
    digest: { type: String, enum: ['realtime', 'daily', 'weekly', 'never'], default: 'realtime' },
    summaryTime: { type: String, default: '09:00' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 });
EmailMessageSchema.index({ user: 1, createdAt: -1 });
EmailMessageSchema.index({ status: 1, lastAttemptAt: 1 });
SMSMessageSchema.index({ user: 1, createdAt: -1 });
SMSMessageSchema.index({ status: 1, lastAttemptAt: 1 });
PushNotificationSchema.index({ user: 1, createdAt: -1 });
PushNotificationSchema.index({ status: 1 });


export const Notifications = mongoose.model('Notifications', NotificationSchema);
export const EmailMessages = mongoose.model('EmailMessages', EmailMessageSchema);
export const SMSMessages = mongoose.model('SMSMessages', SMSMessageSchema);
export const PushNotifications = mongoose.model('PushNotifications', PushNotificationSchema);
export const NotificationPreferences = mongoose.model('NotificationPreferences', NotificationPreferenceSchema);

export default Notifications;