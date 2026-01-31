// ============================================================================
// MONGODB INITIALIZATION SCRIPT
// Creates database, users, and initial collections
// ============================================================================

// Switch to admin database
db = db.getSiblingDB('admin');

// Create application user
db.createUser({
  user: 'remit_app',
  pwd: 'CHANGE_ME_IN_PRODUCTION',
  roles: [
    { role: 'readWrite', db: 'remit' },
    { role: 'dbAdmin', db: 'remit' }
  ]
});

// Switch to application database
db = db.getSiblingDB('remit');

// Create indexes for Users collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phone: 1 }, { unique: true, sparse: true });
db.users.createIndex({ 'wallet.accountNumber': 1 }, { unique: true, sparse: true });
db.users.createIndex({ referralCode: 1 }, { unique: true, sparse: true });
db.users.createIndex({ kycStatus: 1 });
db.users.createIndex({ status: 1 });
db.users.createIndex({ createdAt: -1 });

// Create indexes for Transactions collection
db.transactions.createIndex({ user: 1, createdAt: -1 });
db.transactions.createIndex({ reference: 1 }, { unique: true });
db.transactions.createIndex({ status: 1 });
db.transactions.createIndex({ type: 1 });
db.transactions.createIndex({ createdAt: -1 });
db.transactions.createIndex({ 'metadata.recipientId': 1 });

// Create indexes for Cards collection
db.cards.createIndex({ user: 1 });
db.cards.createIndex({ cardNumber: 1 }, { unique: true });
db.cards.createIndex({ status: 1 });

// Create indexes for Loans collection
db.loans.createIndex({ user: 1 });
db.loans.createIndex({ status: 1 });
db.loans.createIndex({ 'schedule.dueDate': 1 });

// Create indexes for Investments collection
db.savingsgoals.createIndex({ user: 1 });
db.investmentaccounts.createIndex({ user: 1 }, { unique: true });
db.portfolios.createIndex({ account: 1 });

// Create indexes for FraudSignals collection
db.fraudsignals.createIndex({ user: 1 });
db.fraudsignals.createIndex({ severity: 1 });
db.fraudsignals.createIndex({ status: 1 });
db.fraudsignals.createIndex({ createdAt: -1 });

// Create indexes for SecurityEvents collection
db.securityevents.createIndex({ user: 1 });
db.securityevents.createIndex({ eventType: 1 });
db.securityevents.createIndex({ timestamp: -1 });
db.securityevents.createIndex({ severity: 1 });

// Create indexes for Notifications collection
db.notifications.createIndex({ user: 1, createdAt: -1 });
db.notifications.createIndex({ user: 1, read: 1 });

// Create indexes for AuditLogs collection
db.auditlogs.createIndex({ user: 1 });
db.auditlogs.createIndex({ action: 1 });
db.auditlogs.createIndex({ createdAt: -1 });
db.auditlogs.createIndex({ resourceType: 1 });

// Create capped collection for real-time events
db.createCollection('realtimeevents', {
  capped: true,
  size: 100000000, // 100MB
  max: 100000
});

// Create TTL index for session cleanup
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Create TTL index for OTP cleanup
db.otps.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Insert default system settings
db.systemsettings.insertMany([
  {
    key: 'maintenance_mode',
    value: false,
    description: 'Enable/disable maintenance mode',
    category: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    key: 'registration_enabled',
    value: true,
    description: 'Enable/disable new user registration',
    category: 'auth',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    key: 'min_deposit_amount',
    value: 100, // $1.00
    description: 'Minimum deposit amount in cents',
    category: 'transactions',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    key: 'max_withdrawal_amount',
    value: 100000000, // $1,000,000
    description: 'Maximum withdrawal amount in cents',
    category: 'transactions',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    key: 'kyc_required_threshold',
    value: 100000, // $1,000
    description: 'Transaction amount threshold requiring KYC in cents',
    category: 'kyc',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insert default permissions
db.permissions.insertMany([
  { name: 'users:read', description: 'View users', category: 'users', createdAt: new Date() },
  { name: 'users:write', description: 'Create/update users', category: 'users', createdAt: new Date() },
  { name: 'users:delete', description: 'Delete users', category: 'users', createdAt: new Date() },
  { name: 'transactions:read', description: 'View transactions', category: 'transactions', createdAt: new Date() },
  { name: 'transactions:write', description: 'Create transactions', category: 'transactions', createdAt: new Date() },
  { name: 'transactions:approve', description: 'Approve transactions', category: 'transactions', createdAt: new Date() },
  { name: 'loans:read', description: 'View loans', category: 'loans', createdAt: new Date() },
  { name: 'loans:write', description: 'Create/update loans', category: 'loans', createdAt: new Date() },
  { name: 'loans:approve', description: 'Approve loans', category: 'loans', createdAt: new Date() },
  { name: 'fraud:read', description: 'View fraud cases', category: 'fraud', createdAt: new Date() },
  { name: 'fraud:write', description: 'Manage fraud cases', category: 'fraud', createdAt: new Date() },
  { name: 'admin:read', description: 'View admin data', category: 'admin', createdAt: new Date() },
  { name: 'admin:write', description: 'Manage admin settings', category: 'admin', createdAt: new Date() },
  { name: 'admin:super', description: 'Super admin privileges', category: 'admin', createdAt: new Date() }
]);

print('✅ MongoDB initialization complete');
print('📊 Created indexes for all collections');
print('⚙️ Inserted default system settings');
print('🔐 Inserted default permissions');
