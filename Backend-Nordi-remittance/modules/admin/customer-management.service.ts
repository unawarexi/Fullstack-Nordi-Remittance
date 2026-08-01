import bcrypt from "bcryptjs";
import Users from "../users/users.model.js";
import { Wallets } from "../accounts/accounts.model.js";
import Transactions from "../transactions/transactions.model.js";
import { Loans } from "../loans/loans.model.js";
import { Cards } from "../cards/cards.model.js";
import { InvestmentAccounts, SavingsGoals } from "../investments/investments.model.js";
import { AdminActionLogs } from "./admin.model.js";
import { onUserWrite } from "../../services/query-cache.service.js";
import { queueTemplatedMail } from "../../services/workers.js";
import EmailContentGenerator from "../../core/mail/Mail-content.js";
import { emitToUser } from "../../services/websocket.service.js";
import { WS } from "../../core/constants/ws-events.js";
import { NotFoundError } from "../../core/errors/AppError.js";
import envConfig from "../../config/env.config.js";

const emailGenerator = new EmailContentGenerator();

export class CustomerManagementService {
  /**
   * Search and filter users
   */
  static async searchUsers(filters: any, pagination: { page: number; limit: number }) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const queryFilter: any = {};

    if (filters.query) {
      const searchTerm = filters.query.trim();
      if (searchTerm.length >= 3) {
        queryFilter.$text = { $search: searchTerm };
      } else {
        const sanitized = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        queryFilter.$or = [
          { email: new RegExp(`^${sanitized}`, "i") },
          { firstName: new RegExp(`^${sanitized}`, "i") },
          { lastName: new RegExp(`^${sanitized}`, "i") },
        ];
      }
    }

    if (filters.status) queryFilter.accountStatus = filters.status;
    if (filters.kycStatus) queryFilter.kycStatus = filters.kycStatus;

    const [users, total] = await Promise.all([
      Users.find(queryFilter)
        .select("-password -twoFactorSecret")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Users.countDocuments(queryFilter),
    ]);

    return { users, total, page, limit };
  }

  /**
   * Get full details of a specific user including related entities
   */
  static async getUserDetails(userId: string) {
    const user = await Users.findById(userId)
      .select("-password -twoFactorSecret")
      .lean();
    if (!user) throw new NotFoundError("User not found");

    const [wallets, recentTransactions, loans, cards, investments, savingsGoals] = await Promise.all([
      Wallets.find({ user: userId })
        .select("walletNumber status balances isPrimary walletType createdAt")
        .lean(),
      Transactions.find({ initiatedBy: userId })
        .select("type category amount currency status description referenceNumber createdAt completedAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Loans.find({ user: userId })
        .select("loanId loanType status principalAmount outstandingBalance interestRate term startDate maturityDate monthlyPayment currency collateral createdAt")
        .lean(),
      Cards.find({ user: userId })
        .select("cardId cardType cardBrand cardholderName status balance creditLimit availableCredit expiryMonth expiryYear issueDate currency createdAt")
        .lean(),
      InvestmentAccounts.find({ user: userId })
        .select("accountId accountType status totalInvested currentValue totalReturns returnPercentage currency riskProfile createdAt")
        .lean(),
      SavingsGoals.find({ user: userId })
        .select("goalId name description targetAmount currentAmount currency targetDate status category createdAt")
        .lean(),
    ]);

    return {
      user,
      wallets,
      recentTransactions,
      loans,
      cards: cards.map((c) => ({
        ...c,
        cardNumber: "****",
        cvv: "***",
        pin: undefined,
      })),
      investments,
      savingsGoals,
    };
  }

  /**
   * Update a user's account status (e.g., block, unblock, suspend)
   */
  static async updateUserStatus(
    currentUserId: string,
    targetUserId: string,
    status: string,
    reason: string,
    ip: string,
    userAgent: string
  ) {
    const user = await Users.findById(targetUserId)
      .select("firstName lastName email accountStatus isActive isLocked")
      .lean();
    if (!user) throw new NotFoundError("User not found");

    const oldStatus = (user as any).accountStatus;
    const updateFields: Record<string, any> = { accountStatus: status };

    if (status === "active") {
      updateFields.isActive = true;
      updateFields.isLocked = false;
    } else if (status === "suspended" || status === "banned") {
      updateFields.isActive = false;
      updateFields.isLocked = true;
      updateFields.suspensionReason = reason;
    } else if (status === "restricted") {
      updateFields.isActive = false;
    }

    await Users.findByIdAndUpdate(targetUserId, updateFields);

    await AdminActionLogs.create({
      admin: currentUserId,
      action: "UPDATE_USER_STATUS",
      resource: "user",
      resourceId: (user._id as any).toString(),
      changes: { oldStatus, newStatus: status, reason },
      ipAddress: ip || "",
      userAgent: userAgent || "",
      status: "success",
    });

    const emailContent = emailGenerator.accountStatusUpdateEmail({
      firstName: String((user as any).firstName),
      email: String((user as any).email),
      status: status as "active" | "suspended" | "banned" | "restricted",
      reason: reason || undefined,
      effectiveDate: new Date().toISOString(),
      appealUrl: `${envConfig.FRONTEND_URL || "https://remit.com"}/support`,
      userId: (user._id as any).toString(),
    });

    queueTemplatedMail(String((user as any).email), emailContent).catch(console.error);

    emitToUser((user._id as any).toString(), WS.ADMIN.USER_STATUS_CHANGED, {
      userId: (user._id as any).toString(),
      status,
      reason: reason || undefined,
      timestamp: new Date().toISOString(),
    });

    return { user: { id: user._id, status } };
  }

  /**
   * Reset a user's password to a temporary password
   */
  static async resetUserPassword(currentUserId: string, targetUserId: string, ip: string, userAgent: string) {
    const user = await Users.findById(targetUserId);
    if (!user) throw new NotFoundError("User not found");

    const tempPassword = Math.random().toString(36).slice(-10) + "A1!";
    user.password = await bcrypt.hash(tempPassword, 12);
    user.mustChangePassword = true;
    await user.save();

    await AdminActionLogs.create({
      admin: currentUserId,
      action: "RESET_USER_PASSWORD",
      resource: "user",
      resourceId: (user._id as any).toString(),
      ipAddress: ip || "",
      userAgent: userAgent || "",
      status: "success",
    });

    const emailContent = emailGenerator.passwordResetEmail({
      firstName: String(user.firstName),
      resetUrl: `${envConfig.FRONTEND_URL || "https://remit.com"}/auth/reset-password?temp=${encodeURIComponent(tempPassword)}`,
      userId: (user._id as any).toString(),
    });

    queueTemplatedMail(String(user.email), emailContent).catch(console.error);

    emitToUser((user._id as any).toString(), WS.ADMIN.USER_PASSWORD_RESET, {
      userId: (user._id as any).toString(),
      timestamp: new Date().toISOString(),
    });

    return null;
  }

  /**
   * Generic update of user profile
   */
  static async updateUser(currentUserId: string, targetUserId: string, updates: any, ip: string, userAgent: string) {
    delete updates._id;
    delete updates.password;
    delete updates.twoFactorSecret;
    delete updates.backupCodes;

    const user = await Users.findByIdAndUpdate(
      targetUserId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: false },
    ).select("-password -twoFactorSecret -backupCodes");

    if (!user) throw new NotFoundError("User not found");

    await AdminActionLogs.create({
      admin: currentUserId,
      action: "UPDATE_USER_PROFILE",
      resource: "user",
      resourceId: targetUserId,
      changes: updates,
      ipAddress: ip || "",
      userAgent: userAgent || "",
      status: "success",
    });

    onUserWrite(targetUserId).catch(() => {});
    return { user };
  }

  /**
   * Delete a single user
   */
  static async deleteUser(currentUserId: string, targetUserId: string, ip: string, userAgent: string) {
    const user = await Users.findByIdAndDelete(targetUserId);

    if (!user) throw new NotFoundError("User not found");

    await AdminActionLogs.create({
      admin: currentUserId,
      action: "DELETE_USER",
      resource: "user",
      resourceId: targetUserId,
      changes: { deleted: true, email: user.email },
      ipAddress: ip || "",
      userAgent: userAgent || "",
      status: "success",
    });

    onUserWrite(targetUserId).catch(() => {});
    return { deletedId: targetUserId };
  }

  /**
   * Delete all users (DANGER)
   */
  static async deleteAllUsers(currentUserId: string, ip: string, userAgent: string) {
    const result = await Users.deleteMany({});

    await AdminActionLogs.create({
      admin: currentUserId,
      action: "DELETE_ALL_USERS",
      resource: "user",
      resourceId: "all",
      changes: { deletedCount: result.deletedCount },
      ipAddress: ip || "",
      userAgent: userAgent || "",
      status: "success",
    });

    return { deletedCount: result.deletedCount };
  }
}
