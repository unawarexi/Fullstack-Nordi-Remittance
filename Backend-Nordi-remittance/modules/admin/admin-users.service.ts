import bcrypt from "bcryptjs";
import { AdminUsers, AdminActionLogs } from "./admin.model.js";
import { UnauthorizedError, ValidationError, NotFoundError, ForbiddenError } from "../../core/errors/AppError.js";
import { queueTemplatedMail } from "../../services/workers.js";
import EmailContentGenerator from "../../core/mail/Mail-content.js";
import type { AdminAccountData } from "../../types/Mail.types.js";

const emailGenerator = new EmailContentGenerator();

export class AdminUsersService {
  /**
   * Get paginated admin users list
   */
  static async getAdminUsers(filters: { role?: string; status?: string }, pagination: { page: number; limit: number }) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (filters.role) query.role = filters.role;
    if (filters.status) query.status = filters.status;

    const [admins, total] = await Promise.all([
      AdminUsers.find(query)
        .select("-password")
        .populate("permissions")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdminUsers.countDocuments(query),
    ]);

    return { admins, total, page, limit };
  }

  /**
   * Create a new admin user
   */
  static async createAdminUser(
    currentUserId: string,
    currentUserEmail: string,
    data: { email?: string; password?: string; firstName?: string; lastName?: string; role?: string; permissions?: string[] },
    ip: string,
    userAgent: string
  ) {
    const { email, password, firstName, lastName, role, permissions } = data;

    if (!email || !password || !firstName || !lastName) {
      throw new ValidationError("Missing required fields for admin creation");
    }

    const existing = await AdminUsers.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new ValidationError("Admin with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = new AdminUsers({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role: role || "support",
      permissions: permissions || [],
      status: "active",
      createdBy: currentUserId,
    });

    await admin.save();

    await AdminActionLogs.create({
      admin: currentUserId,
      action: "CREATE_ADMIN",
      resource: "admin",
      resourceId: String(admin._id!),
      changes: { email, role: role || "support_agent" },
      ipAddress: ip || "",
      userAgent: userAgent || "",
      status: "success",
    });

    const emailData: AdminAccountData = {
      firstName,
      lastName,
      email,
      role: role || "support_agent",
      createdAt: new Date().toISOString(),
      createdBy: currentUserEmail || "Super Admin",
    };

    const emailContent = emailGenerator.adminAccountCreatedEmail(emailData);
    queueTemplatedMail(email, emailContent).catch(console.error);

    return {
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    };
  }

  /**
   * Update an existing admin user
   */
  static async updateAdminUser(
    currentUserId: string,
    adminId: string,
    data: { firstName?: string; lastName?: string; role?: string; status?: string; permissions?: any[] },
    ip: string,
    userAgent: string
  ) {
    const { firstName, lastName, role, permissions } = data;

    const admin: any = await AdminUsers.findById(adminId);
    if (!admin) throw new NotFoundError("Admin not found");

    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (role) admin.role = role;
    if (typeof permissions !== "undefined") admin.permissions = permissions;

    await admin.save();

    await AdminActionLogs.create({
      admin: currentUserId,
      action: "UPDATE_ADMIN",
      resource: "admin",
      resourceId: admin._id.toString(),
      changes: { firstName, lastName, role },
      ipAddress: ip || "",
      userAgent: userAgent || "",
      status: "success",
    });

    return { admin };
  }

  /**
   * Deactivate an admin user
   */
  static async deactivateAdminUser(currentUserId: string, adminId: string, ip: string, userAgent: string) {
    const admin: any = await AdminUsers.findById(adminId);
    if (!admin) throw new NotFoundError("Admin not found");

    if (admin._id.toString() === currentUserId) {
      throw new ForbiddenError("Cannot deactivate your own account");
    }

    admin.isActive = false;
    await admin.save();

    await AdminActionLogs.create({
      admin: currentUserId,
      action: "DEACTIVATE_ADMIN",
      resource: "admin",
      resourceId: admin._id.toString(),
      ipAddress: ip || "",
      userAgent: userAgent || "",
      status: "success",
    });

    return null;
  }
}
