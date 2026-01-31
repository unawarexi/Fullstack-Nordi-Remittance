// ============================================================================
// SUPER ADMIN SEEDER
// ============================================================================
// This script seeds the initial super admin from environment variables.
// It should be run on application startup.
// ============================================================================

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { AdminUsers, AdminPermissions } from '../models/AdminModel.js';
import { env } from '../config/env.config.js';

/**
 * Seeds the super admin account from environment variables
 * This runs on every server startup but only creates if not exists
 */
export async function seedSuperAdmin(): Promise<void> {
  try {
    const adminEmail = env.ADMIN_EMAIL;
    const adminPassword = env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.warn('⚠️  ADMIN_EMAIL and ADMIN_PASSWORD not set in environment. Skipping super admin seeding.');
      return;
    }

    // Check if super admin already exists
    const existingAdmin = await AdminUsers.findOne({ 
      $or: [
        { email: adminEmail.toLowerCase() },
        { isSuperAdmin: true }
      ]
    });

    if (existingAdmin) {
      console.log('✅ Super admin already exists:', existingAdmin.email);
      
      // Ensure role is super_admin
      if (existingAdmin.role !== 'super_admin') {
        existingAdmin.role = 'super_admin';
        existingAdmin.isSuperAdmin = true;
        await existingAdmin.save();
        console.log('✅ Updated existing admin to super_admin role');
      }
      
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create super admin
    const superAdmin = new AdminUsers({
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      isActive: true,
      isSuperAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await superAdmin.save();

    // Create full permissions for super admin
    const permissions = new AdminPermissions({
      admin: superAdmin._id,
      // User Management - ALL TRUE
      canViewUsers: true,
      canEditUsers: true,
      canSuspendUsers: true,
      canDeleteUsers: true,
      canVerifyKyc: true,
      // Transaction Management - ALL TRUE
      canViewTransactions: true,
      canReverseTransactions: true,
      canRefundTransactions: true,
      canAdjustBalances: true,
      // Financial Operations - ALL TRUE
      canManageLoans: true,
      canApproveLoans: true,
      canManageInvestments: true,
      canManageCards: true,
      // Fraud & Security - ALL TRUE
      canViewFraudCases: true,
      canManageFraudCases: true,
      canBlockAccounts: true,
      canAccessSecurityLogs: true,
      // System Configuration - ALL TRUE
      canManageSettings: true,
      canManageAdmins: true,
      canViewReports: true,
      canExportData: true,
      // Support - ALL TRUE
      canManageTickets: true,
      canViewCustomerData: true,
    });

    await permissions.save();

    // Link permissions to admin
    superAdmin.permissions = permissions._id as any;
    await superAdmin.save();

    console.log('✅ Super admin created successfully!');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Role: super_admin`);
    console.log('   ⚠️  Please change the password after first login!');

  } catch (error: any) {
    if (error.code === 11000) {
      console.log('✅ Super admin already exists (duplicate key)');
    } else {
      console.error('❌ Error seeding super admin:', error.message);
      throw error;
    }
  }
}

/**
 * Creates default system settings if they don't exist
 */
export async function seedSystemSettings(): Promise<void> {
  const { SystemSettings } = await import('../models/AdminModel.js');
  
  const defaultSettings = [
    {
      key: 'transaction_daily_limit',
      value: 10000,
      category: 'payment',
      description: 'Maximum daily transaction limit per user (USD)',
      dataType: 'number',
      isEditable: true,
    },
    {
      key: 'transaction_single_limit',
      value: 5000,
      category: 'payment',
      description: 'Maximum single transaction limit (USD)',
      dataType: 'number',
      isEditable: true,
    },
    {
      key: 'kyc_required_for_transactions',
      value: true,
      category: 'compliance',
      description: 'Require KYC verification for transactions',
      dataType: 'boolean',
      isEditable: true,
    },
    {
      key: 'enable_international_transfers',
      value: true,
      category: 'feature',
      description: 'Enable international money transfers',
      dataType: 'boolean',
      isEditable: true,
    },
    {
      key: 'maintenance_mode',
      value: false,
      category: 'general',
      description: 'Put the platform in maintenance mode',
      dataType: 'boolean',
      isEditable: true,
    },
    {
      key: 'new_user_registration',
      value: true,
      category: 'general',
      description: 'Allow new user registrations',
      dataType: 'boolean',
      isEditable: true,
    },
    {
      key: 'default_currency',
      value: 'USD',
      category: 'general',
      description: 'Default currency for new accounts',
      dataType: 'string',
      isEditable: true,
    },
    {
      key: 'transaction_fee_percentage',
      value: 0.5,
      category: 'payment',
      description: 'Transaction fee percentage',
      dataType: 'number',
      isEditable: true,
    },
    {
      key: 'minimum_transaction_fee',
      value: 0.50,
      category: 'payment',
      description: 'Minimum transaction fee (USD)',
      dataType: 'number',
      isEditable: true,
    },
    {
      key: 'loan_interest_rate',
      value: 12,
      category: 'payment',
      description: 'Default annual interest rate for loans (%)',
      dataType: 'number',
      isEditable: true,
    },
    {
      key: 'fraud_detection_enabled',
      value: true,
      category: 'security',
      description: 'Enable fraud detection system',
      dataType: 'boolean',
      isEditable: true,
    },
    {
      key: 'two_factor_required_for_admins',
      value: false,
      category: 'security',
      description: 'Require 2FA for all admin users',
      dataType: 'boolean',
      isEditable: true,
    },
  ];

  for (const setting of defaultSettings) {
    try {
      await SystemSettings.findOneAndUpdate(
        { key: setting.key },
        { $setOnInsert: setting },
        { upsert: true, new: true }
      );
    } catch (error: any) {
      // Ignore duplicate key errors
      if (error.code !== 11000) {
        console.error(`Error seeding setting ${setting.key}:`, error.message);
      }
    }
  }

  console.log('✅ System settings initialized');
}

/**
 * Run all seeders
 */
export async function runSeeders(): Promise<void> {
  console.log('\n🌱 Running database seeders...\n');
  
  await seedSuperAdmin();
  await seedSystemSettings();
  
  console.log('\n✅ All seeders completed!\n');
}

export default {
  seedSuperAdmin,
  seedSystemSettings,
  runSeeders,
};
