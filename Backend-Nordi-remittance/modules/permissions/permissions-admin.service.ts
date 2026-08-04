// ============================================================================
// PERMISSIONS ADMIN SERVICE
// ============================================================================

import Permissions from "./permissions.model.js";
import { AdminUsers, AdminActionLogs } from "../admin/admin.model.js";
import { NotFoundError } from "../../core/errors/AppError.js";
import { emitToUser } from "../../services/websocket.service.js";
import { WS } from "../../core/constants/ws-events.js";

export class PermissionsAdminService {
  // --------------------------------------------------------------------------
  // GET ALL PERMISSIONS
  // --------------------------------------------------------------------------
  static async getAllPermissions() {
    const permissions = await Permissions.find()
      .populate("userId", "firstName lastName email")
      .lean();

    return { permissions };
  }

  // --------------------------------------------------------------------------
  // SET USER PERMISSIONS
  // --------------------------------------------------------------------------
  static async setUserPermissions(
    adminId: string,
    userId: string,
    permissionUpdates: any,
    ip: string,
    userAgent: string,
  ) {
    const userIdStr = String(userId);

    const permissions = await Permissions.findOneAndUpdate(
      { userId },
      { $set: permissionUpdates },
      { new: true, upsert: true },
    );

    await AdminActionLogs.create({
      admin: adminId,
      action: "UPDATE_USER_PERMISSIONS",
      resource: "permissions",
      resourceId: permissions._id.toString(),
      changes: permissionUpdates,
      ipAddress: ip,
      userAgent: userAgent,
      status: "success",
    });

    emitToUser(userIdStr, WS.PERMISSION.UPDATED, {
      userId: userIdStr,
      changes: permissionUpdates,
      timestamp: new Date().toISOString(),
    });

    return { permissions };
  }

  // --------------------------------------------------------------------------
  // UPDATE PERMISSION FIELD
  // --------------------------------------------------------------------------
  static async updatePermissionField(
    adminId: string,
    userId: string,
    field: string,
    value: any,
    ip: string,
    userAgent: string,
  ) {
    const fieldName = String(field);
    const userIdStr = String(userId);

    const permissions = await Permissions.findOneAndUpdate(
      { userId },
      { $set: { [fieldName]: value } },
      { new: true, upsert: true },
    );

    await AdminActionLogs.create({
      admin: adminId,
      action: "UPDATE_PERMISSION_FIELD",
      resource: "permissions",
      resourceId: permissions._id.toString(),
      changes: { [fieldName]: value },
      ipAddress: ip,
      userAgent: userAgent,
      status: "success",
    });

    emitToUser(userIdStr, WS.PERMISSION.FIELD_UPDATED, {
      userId: userIdStr,
      field: fieldName,
      value,
      timestamp: new Date().toISOString(),
    });

    return { permissions, field: fieldName, value };
  }

  // --------------------------------------------------------------------------
  // DELETE USER PERMISSIONS
  // --------------------------------------------------------------------------
  static async deleteUserPermissions(
    adminId: string,
    userId: string,
    ip: string,
    userAgent: string,
  ) {
    const userIdStr = String(userId);

    const permissions = await Permissions.findOne({ userId: userIdStr });
    if (!permissions)
      throw new NotFoundError("Permissions not found for this user");

    await permissions.deleteOne();

    await AdminActionLogs.create({
      admin: adminId,
      action: "DELETE_USER_PERMISSIONS",
      resource: "permissions",
      resourceId: permissions._id.toString(),
      ipAddress: ip,
      userAgent: userAgent,
      status: "success",
    });

    emitToUser(userIdStr, WS.PERMISSION.REVOKED, {
      userId: userIdStr,
      timestamp: new Date().toISOString(),
    });

    return null;
  }

  // --------------------------------------------------------------------------
  // GET ADMIN PERMISSIONS
  // --------------------------------------------------------------------------
  static async getAdminPermissions(adminId: string) {
    const admin = await AdminUsers.findById(adminId)
      .select("firstName lastName email role permissions isActive")
      .populate("permissions")
      .lean();

    if (!admin) throw new NotFoundError("Admin not found");

    return {
      admin: {
        id: admin._id,
        name: `${admin.firstName} ${admin.lastName}`,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
      },
      permissions: admin.permissions,
    };
  }

  // --------------------------------------------------------------------------
  // BULK UPDATE PERMISSIONS
  // --------------------------------------------------------------------------
  static async bulkUpdatePermissions(
    adminId: string,
    userIds: string[],
    permissions: any,
    ip: string,
    userAgent: string,
  ) {
    const results = await Promise.all(
      userIds.map(async (userId: string) => {
        try {
          await Permissions.findOneAndUpdate(
            { userId },
            { $set: permissions },
            { upsert: true },
          );
          return { userId, success: true };
        } catch (err) {
          return { userId, success: false, error: (err as Error).message };
        }
      }),
    );

    await AdminActionLogs.create({
      admin: adminId,
      action: "BULK_UPDATE_PERMISSIONS",
      resource: "permissions",
      resourceId: "bulk",
      changes: { userIds, permissions },
      ipAddress: ip,
      userAgent: userAgent,
      status: "success",
    });

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    results
      .filter((r) => r.success)
      .forEach((r) => {
        emitToUser(r.userId, WS.PERMISSION.BULK_UPDATED, {
          changes: permissions,
          timestamp: new Date().toISOString(),
        });
      });

    return {
      results,
      summary: { total: userIds.length, successful, failed },
    };
  }
}
