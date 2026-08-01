import { AdminActionLogs, OperationalTasks } from "./admin.model.js";
import { NotFoundError } from "../../core/errors/AppError.js";

export class AuditTasksService {
  /**
   * Get paginated audit logs
   */
  static async getAuditLogs(filters: any, pagination: { page: number; limit: number }) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const queryFilter: any = {};
    if (filters.action) queryFilter.action = filters.action;
    if (filters.adminId) queryFilter.admin = filters.adminId;
    if (filters.targetType) queryFilter.targetType = filters.targetType;

    const [logs, total] = await Promise.all([
      AdminActionLogs.find(queryFilter)
        .populate("admin", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdminActionLogs.countDocuments(queryFilter),
    ]);

    return { logs, total, page, limit };
  }

  /**
   * Get operational tasks
   */
  static async getOperationalTasks(filters: any) {
    const queryFilter: any = {};
    if (filters.status) queryFilter.status = filters.status;
    if (filters.priority) queryFilter.priority = filters.priority;
    if (filters.assignedTo) queryFilter.assignedTo = filters.assignedTo;

    const tasks = await OperationalTasks.find(queryFilter)
      .populate("assignedTo", "firstName lastName email")
      .populate("createdBy", "firstName lastName email")
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    return { tasks };
  }

  /**
   * Create an operational task
   */
  static async createOperationalTask(currentUserId: string, data: any) {
    const { title, description, priority, assignedTo, dueDate, category } = data;

    const task = new OperationalTasks({
      title,
      description,
      priority: priority || "medium",
      status: "pending",
      assignedTo,
      createdBy: currentUserId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      category,
    });

    await task.save();

    return { task };
  }

  /**
   * Update an operational task
   */
  static async updateOperationalTask(taskId: string, updates: any) {
    const task = await OperationalTasks.findByIdAndUpdate(
      taskId,
      { ...updates, updatedAt: new Date() },
      { new: true },
    );

    if (!task) throw new NotFoundError("Task not found");

    return { task };
  }
}
