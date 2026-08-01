import { SystemSettings, AdminActionLogs } from "./admin.model.js";
import { broadcast } from "../../services/websocket.service.js";
import { WS } from "../../core/constants/ws-events.js";

export class SystemSettingsService {
  /**
   * Get all system settings
   */
  static async getSystemSettings() {
    const settings = await SystemSettings.find().lean();

    const settingsMap = settings.reduce((acc: any, s) => {
      acc[s.key] = {
        value: s.value,
        dataType: s.dataType,
        category: s.category,
        description: s.description,
      };
      return acc;
    }, {});

    return { settings: settingsMap };
  }

  /**
   * Update a system setting
   */
  static async updateSystemSetting(
    currentUserId: string,
    key: string,
    value: any,
    ip: string,
    userAgent: string
  ) {
    const setting = await SystemSettings.findOneAndUpdate(
      { key },
      {
        value,
        updatedBy: currentUserId,
        updatedAt: new Date(),
      },
      { new: true, upsert: true },
    );

    await AdminActionLogs.create({
      admin: currentUserId,
      action: "UPDATE_SETTING",
      resource: "setting",
      resourceId: setting._id.toString(),
      changes: { key, newValue: value },
      ipAddress: ip || "",
      userAgent: userAgent || "",
      status: "success",
    });

    broadcast(WS.ADMIN.SETTING_UPDATED, {
      key,
      value,
      updatedBy: currentUserId,
      timestamp: new Date().toISOString(),
    });

    return { setting };
  }
}
