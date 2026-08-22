import { AdminUsers, AdminPermissions, AdminActionLogs } from './admin.model.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../core/errors/AppError.js';
import { queueTemplatedMail } from '../../services/workers.js';

export class AdminPermissionsService {
  /**
   * Get all available permissions structure
   */
  static async getAvailablePermissions() {
    const permissions = {
      userManagement: [
        { key: 'canViewUsers', label: 'View Users', description: 'View user accounts and details' },
        { key: 'canEditUsers', label: 'Edit Users', description: 'Edit user account details' },
        { key: 'canSuspendUsers', label: 'Suspend Users', description: 'Suspend user accounts' },
        { key: 'canDeleteUsers', label: 'Delete Users', description: 'Delete user accounts' },
        {
          key: 'canVerifyKyc',
          label: 'Verify KYC',
          description: 'Review and verify KYC documents',
        },
      ],
      transactionManagement: [
        {
          key: 'canViewTransactions',
          label: 'View Transactions',
          description: 'View all transactions',
        },
        {
          key: 'canReverseTransactions',
          label: 'Reverse Transactions',
          description: 'Reverse completed transactions',
        },
        {
          key: 'canRefundTransactions',
          label: 'Refund Transactions',
          description: 'Process refunds',
        },
        {
          key: 'canAdjustBalances',
          label: 'Adjust Balances',
          description: 'Credit/debit user wallets',
        },
      ],
      financialOperations: [
        {
          key: 'canManageLoans',
          label: 'Manage Loans',
          description: 'View and manage loan applications',
        },
        {
          key: 'canApproveLoans',
          label: 'Approve Loans',
          description: 'Approve/reject loan applications',
        },
        {
          key: 'canManageInvestments',
          label: 'Manage Investments',
          description: 'Manage investment accounts',
        },
        { key: 'canManageCards', label: 'Manage Cards', description: 'Manage card applications' },
      ],
      fraudSecurity: [
        {
          key: 'canViewFraudCases',
          label: 'View Fraud Cases',
          description: 'View fraud investigation cases',
        },
        {
          key: 'canManageFraudCases',
          label: 'Manage Fraud Cases',
          description: 'Manage and resolve fraud cases',
        },
        {
          key: 'canBlockAccounts',
          label: 'Block Accounts',
          description: 'Block suspicious accounts',
        },
        {
          key: 'canAccessSecurityLogs',
          label: 'Access Security Logs',
          description: 'View security audit logs',
        },
      ],
      systemConfiguration: [
        {
          key: 'canManageSettings',
          label: 'Manage Settings',
          description: 'Configure system settings',
        },
        {
          key: 'canManageAdmins',
          label: 'Manage Admins',
          description: 'Create and manage admin accounts',
        },
        {
          key: 'canViewReports',
          label: 'View Reports',
          description: 'Access analytics and reports',
        },
        { key: 'canExportData', label: 'Export Data', description: 'Export system data' },
      ],
      support: [
        { key: 'canManageTickets', label: 'Manage Tickets', description: 'Handle support tickets' },
        {
          key: 'canViewCustomerData',
          label: 'View Customer Data',
          description: 'Access customer information',
        },
      ],
    };

    return { permissions };
  }

  /**
   * Get permissions for a specific admin
   */
  static async getAdminPermissions(adminId: string) {
    const admin = await AdminUsers.findById(adminId);
    if (!admin) throw new NotFoundError('Admin not found');

    const permissions = await AdminPermissions.findOne({ admin: adminId });

    return {
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
      permissions: permissions || null,
    };
  }

  /**
   * Update admin permissions
   */
  static async updateAdminPermissions(
    currentUserId: string,
    targetAdminId: string,
    permissionUpdates: any,
    ip: string,
    userAgent: string,
  ) {
    const currentAdmin = await AdminUsers.findById(currentUserId);
    if (currentAdmin?.role !== 'super_admin') {
      throw new ForbiddenError('Only super admin can manage permissions');
    }

    const targetAdmin = await AdminUsers.findById(targetAdminId);
    if (!targetAdmin) throw new NotFoundError('Admin not found');

    const permissions = await AdminPermissions.findOneAndUpdate(
      { admin: targetAdminId },
      {
        $set: {
          ...permissionUpdates,
          updatedAt: new Date(),
        },
      },
      { new: true, upsert: true },
    );

    if (!targetAdmin.permissions) {
      targetAdmin.permissions = permissions._id as any;
      await targetAdmin.save();
    }

    await AdminActionLogs.create({
      admin: currentUserId,
      action: 'UPDATE_ADMIN_PERMISSIONS',
      resource: 'admin_permissions',
      resourceId: targetAdminId,
      changes: permissionUpdates,
      ipAddress: ip || '',
      userAgent: userAgent || '',
      status: 'success',
    });

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
      queueTemplatedMail(targetAdmin.email, emailContent as any).catch(console.error);
    } catch (emailError) {
      console.error('Failed to send permissions update email:', emailError);
    }

    return { permissions };
  }

  /**
   * Set a permission preset for an admin
   */
  static async setPermissionPreset(
    currentUserId: string,
    targetAdminId: string,
    preset: string,
    ip: string,
    userAgent: string,
  ) {
    const currentAdmin = await AdminUsers.findById(currentUserId);
    if (currentAdmin?.role !== 'super_admin') {
      throw new ForbiddenError('Only super admin can manage permissions');
    }

    const targetAdmin = await AdminUsers.findById(targetAdminId);
    if (!targetAdmin) throw new NotFoundError('Admin not found');

    let permissionValues: Record<string, boolean>;

    switch (preset) {
      case 'full':
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
        throw new ValidationError(
          'Invalid preset. Use: full, limited, readonly, support, compliance',
        );
    }

    const permissions = await AdminPermissions.findOneAndUpdate(
      { admin: targetAdminId },
      { $set: { ...permissionValues, updatedAt: new Date() } },
      { new: true, upsert: true },
    );

    targetAdmin.permissions = permissions._id as any;
    targetAdmin.role =
      preset === 'compliance'
        ? 'compliance_officer'
        : preset === 'support'
          ? 'support_agent'
          : 'admin';
    await targetAdmin.save();

    await AdminActionLogs.create({
      admin: currentUserId,
      action: 'SET_PERMISSION_PRESET',
      resource: 'admin_permissions',
      resourceId: targetAdminId,
      changes: { preset },
      ipAddress: ip || '',
      userAgent: userAgent || '',
      status: 'success',
    });

    return {
      admin: { id: targetAdmin._id, role: targetAdmin.role },
      permissions,
      preset,
    };
  }

  /**
   * Revoke all permissions from an admin
   */
  static async revokeAllPermissions(
    currentUserId: string,
    targetAdminId: string,
    ip: string,
    userAgent: string,
  ) {
    const currentAdmin = await AdminUsers.findById(currentUserId);
    if (currentAdmin?.role !== 'super_admin') {
      throw new ForbiddenError('Only super admin can revoke permissions');
    }

    const targetAdmin = await AdminUsers.findById(targetAdminId);
    if (!targetAdmin) throw new NotFoundError('Admin not found');

    if (targetAdmin.role === 'super_admin') {
      throw new ForbiddenError('Cannot revoke super admin permissions');
    }

    await AdminPermissions.findOneAndUpdate(
      { admin: targetAdminId },
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
      },
    );

    await AdminActionLogs.create({
      admin: currentUserId,
      action: 'REVOKE_ALL_PERMISSIONS',
      resource: 'admin_permissions',
      resourceId: targetAdminId,
      ipAddress: ip || '',
      userAgent: userAgent || '',
      status: 'success',
    });

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
      queueTemplatedMail(targetAdmin.email, emailContent as any).catch(console.error);
    } catch (emailError) {
      console.error('Failed to send permissions revoked email:', emailError);
    }

    return null;
  }
}
