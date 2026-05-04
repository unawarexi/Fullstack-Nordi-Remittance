// ============================================================================
// FRAUD & SECURITY CONTROLLER
// ============================================================================

import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import type { AuthenticatedRequest } from "../types/index.js";
import {
  FraudSignals,
  FraudCases,
  VelocityRules,
  BehaviorProfiles,
  SecurityEvents,
} from "../models/FraudSecurityModel.js";
import Transactions from "../models/TransactionModel.js";
import { Wallets } from "../models/AccountsModel.js";
import { Cards } from "../models/CardsModel.js";
import Users from "../models/UserModel.js";
import { AdminActionLogs } from "../models/AdminModel.js";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
} from "../core/helpers/response.helper.js";
import {
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from "../core/errors/AppError.js";
import { queueTemplatedMail } from "../services/workers.js";
import EmailContentGenerator from "../core/mail/Mail-content.js";
import { emitToUser } from "../services/websocket.service.js";
import { WS } from "../core/constants/ws-events.js";

// Initialize email content generator
const emailGenerator = new EmailContentGenerator();

// ============================================================================
// FRAUD SIGNALS
// ============================================================================

export async function getFraudSignals(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.signalType) filter.signalType = req.query.signalType;

    const [signals, total] = await Promise.all([
      FraudSignals.find(filter)
        .select(
          "signalType severity status riskScore user transaction description createdAt",
        )
        .populate("user", "firstName lastName email")
        .populate(
          "transaction",
          "referenceNumber amount status transactionType",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FraudSignals.countDocuments(filter),
    ]);

    sendPaginated(res, signals, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

export async function getFraudSignalById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;

    const signal = await FraudSignals.findById(id)
      .populate("user", "firstName lastName email phone")
      .populate("transaction")
      .populate("relatedCase")
      .lean();

    if (!signal) throw new NotFoundError("Fraud signal not found");

    // Get user's behavior profile
    const profile = await BehaviorProfiles.findOne({
      user: signal.user,
    }).lean();

    // Get related signals
    const relatedSignals = await FraudSignals.find({
      user: signal.user,
      _id: { $ne: signal._id },
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    })
      .select("signalType severity status riskScore description createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    sendSuccess(res, { signal, behaviorProfile: profile, relatedSignals });
  } catch (error) {
    next(error);
  }
}

export async function updateFraudSignal(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;
    const { status, notes, resolution } = req.body;

    const signal = await FraudSignals.findById(id);
    if (!signal) throw new NotFoundError("Fraud signal not found");

    signal.status = status || signal.status;
    signal.notes = notes || signal.notes;
    signal.resolution = resolution || signal.resolution;
    signal.reviewedBy = req.user.userId;
    signal.reviewedAt = new Date();

    await signal.save();

    // Log action
    await AdminActionLogs.create({
      admin: req.user.userId,
      action: "UPDATE_FRAUD_SIGNAL",
      resource: "fraud_signal",
      resourceId: (signal._id as any).toString(),
      changes: { status, notes, resolution },
      ipAddress: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
      status: "success",
    });

    emitToUser(String(signal.user), WS.FRAUD.SIGNAL_UPDATED, {
      signalId: (signal._id as any).toString(),
      status: signal.status,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, { signal }, "Fraud signal updated");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// FRAUD CASES
// ============================================================================

export async function getFraudCases(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

    const [cases, total] = await Promise.all([
      FraudCases.find(filter)
        .select(
          "caseNumber title status severity user assignedTo totalAmount signalCount createdAt updatedAt",
        )
        .populate("user", "firstName lastName email")
        .populate("assignedTo", "firstName lastName")
        .sort({ severity: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FraudCases.countDocuments(filter),
    ]);

    sendPaginated(res, cases, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

export async function createFraudCase(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { userId, title, description, severity, signals, transactions } =
      req.body;

    const user = await Users.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const fraudCase = new FraudCases({
      user: userId,
      title,
      description,
      severity: severity || "medium",
      status: "open",
      signals: signals || [],
      transactions: transactions || [],
      createdBy: req.user.userId,
      timeline: [
        {
          action: "case_created",
          performedBy: req.user.userId,
          timestamp: new Date(),
          notes: "Case created",
        },
      ],
    });

    await fraudCase.save();

    // Link signals to case
    if (signals?.length) {
      await FraudSignals.updateMany(
        { _id: { $in: signals } },
        { relatedCase: fraudCase._id },
      );
    }

    // Optionally freeze user account for high severity
    if (severity === "critical" || severity === "high") {
      user.accountStatus = "suspended";
      user.suspensionReason = "Fraud investigation";
      await user.save();

      // Freeze all wallets
      await Wallets.updateMany(
        { userId: String(user._id) },
        { status: "frozen" },
      );

      // Block all cards
      await Cards.updateMany(
        { user: String(user._id) },
        { status: "blocked", blockedReason: "Fraud investigation" },
      );
    }

    emitToUser(userId, WS.FRAUD.CASE_CREATED, {
      caseId: (fraudCase._id as any).toString(),
      severity: fraudCase.severity,
      status: fraudCase.status,
      timestamp: new Date().toISOString(),
    });

    sendCreated(res, { fraudCase }, "Fraud case created successfully");
  } catch (error) {
    next(error);
  }
}

export async function getFraudCaseById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;

    const fraudCase = await FraudCases.findById(id)
      .populate("user", "firstName lastName email phone accountStatus")
      .populate("assignedTo", "firstName lastName email")
      .populate("signals")
      .populate("transactions")
      .populate("timeline.performedBy", "firstName lastName")
      .lean();

    if (!fraudCase) throw new NotFoundError("Fraud case not found");

    sendSuccess(res, { fraudCase });
  } catch (error) {
    next(error);
  }
}

export async function updateFraudCase(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;
    const { status, severity, assignedTo, notes, resolution } = req.body;

    const fraudCase = await FraudCases.findById(id).session(session);
    if (!fraudCase) throw new NotFoundError("Fraud case not found");

    const timelineEntry: any = {
      action: "case_updated",
      performedBy: req.user.userId,
      timestamp: new Date(),
      notes: notes || "Case updated",
    };

    if (status && status !== fraudCase.status) {
      timelineEntry.action = `status_changed_to_${status}`;
      fraudCase.status = status;

      // Handle case closure
      if (status === "closed" || status === "resolved") {
        fraudCase.resolution = resolution;
        fraudCase.closedAt = new Date();
        fraudCase.closedBy = req.user.userId;

        // Get user
        const user = await Users.findById(fraudCase.user).session(session);
        if (user) {
          // Determine if account should be restored
          if (resolution === "false_positive" || resolution === "no_fraud") {
            user.accountStatus = "active";
            (user as any).suspensionReason = undefined;
            await user.save({ session });

            // Unfreeze wallets
            await Wallets.updateMany(
              { user: String(user._id) },
              { status: "active" },
              { session },
            );

            // Send account restored email using template
            const emailContent = emailGenerator.accountRestoredEmail({
              firstName: String(user.firstName),
              email: String(user.email),
              restoredAt: new Date().toISOString(),
              reason:
                "Our investigation has been completed and no issues were found.",
            });

            queueTemplatedMail(String(user.email), emailContent).catch(
              console.error,
            );
          } else if (resolution === "confirmed_fraud") {
            user.accountStatus = "banned";
            await user.save({ session });
          }
        }
      }
    }

    if (severity) fraudCase.severity = severity;
    if (assignedTo) {
      fraudCase.assignedTo = assignedTo;
      timelineEntry.action = "case_assigned";
    }

    fraudCase.timeline.push(timelineEntry);
    await fraudCase.save({ session });

    await session.commitTransaction();

    emitToUser(String(fraudCase.user), WS.FRAUD.CASE_UPDATED, {
      caseId: (fraudCase._id as any).toString(),
      status: fraudCase.status,
      severity: fraudCase.severity,
      resolution: fraudCase.resolution,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, { fraudCase }, "Fraud case updated successfully");
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

export async function addCaseComment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;
    const { comment } = req.body;

    const fraudCase = await FraudCases.findById(id);
    if (!fraudCase) throw new NotFoundError("Fraud case not found");

    fraudCase.timeline.push({
      action: "comment_added",
      performedBy: req.user.userId,
      timestamp: new Date(),
      notes: comment,
    });

    await fraudCase.save();

    emitToUser(String(fraudCase.user), WS.FRAUD.COMMENT_ADDED, {
      caseId: (fraudCase._id as any).toString(),
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, { timeline: fraudCase.timeline }, "Comment added");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// VELOCITY RULES
// ============================================================================

export async function getVelocityRules(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const rules = await VelocityRules.find().sort({ priority: -1 }).lean();

    sendSuccess(res, { rules });
  } catch (error) {
    next(error);
  }
}

export async function createVelocityRule(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const {
      name,
      description,
      ruleType,
      threshold,
      timeWindowMinutes,
      action,
      severity,
      priority,
      conditions,
    } = req.body;

    const rule = new VelocityRules({
      name,
      description,
      ruleType,
      threshold,
      timeWindowMinutes,
      action,
      severity: severity || "medium",
      priority: priority || 50,
      conditions: conditions || [],
      status: "active",
      createdBy: req.user.userId,
    });

    await rule.save();

    sendCreated(res, { rule }, "Velocity rule created");
  } catch (error) {
    next(error);
  }
}

export async function updateVelocityRule(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;
    const updates = req.body;

    const rule = await VelocityRules.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true },
    );

    if (!rule) throw new NotFoundError("Rule not found");

    sendSuccess(res, { rule }, "Rule updated");
  } catch (error) {
    next(error);
  }
}

export async function deleteVelocityRule(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;

    const rule = await VelocityRules.findByIdAndDelete(id);
    if (!rule) throw new NotFoundError("Rule not found");

    sendSuccess(res, null, "Rule deleted");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// BEHAVIOR PROFILES
// ============================================================================

export async function getBehaviorProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { userId } = req.params;

    const profile = await BehaviorProfiles.findOne({ user: userId })
      .populate("user", "firstName lastName email")
      .lean();

    if (!profile) throw new NotFoundError("Behavior profile not found");

    sendSuccess(res, { profile });
  } catch (error) {
    next(error);
  }
}

export async function updateBehaviorProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { userId } = req.params;
    const { riskLevel, notes, watchlist } = req.body;

    const profile = await BehaviorProfiles.findOneAndUpdate(
      { user: userId },
      {
        riskLevel,
        notes,
        watchlist,
        lastUpdated: new Date(),
        updatedBy: req.user.userId,
      },
      { new: true, upsert: true },
    );

    sendSuccess(res, { profile }, "Profile updated");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// SECURITY EVENTS
// ============================================================================

export async function getSecurityEvents(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.eventType) filter.eventType = req.query.eventType;
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.userId) filter.user = req.query.userId;

    const [events, total] = await Promise.all([
      SecurityEvents.find(filter)
        .select(
          "eventType severity status user ipAddress location description createdAt",
        )
        .populate("user", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SecurityEvents.countDocuments(filter),
    ]);

    sendPaginated(res, events, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

export async function logSecurityEvent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId, eventType, severity, description, metadata } = req.body;

    const event = new SecurityEvents({
      user: userId,
      eventType,
      severity: severity || "info",
      description,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      metadata,
    });

    await event.save();

    sendCreated(res, { event }, "Security event logged");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// FRAUD ANALYTICS
// ============================================================================

export async function getFraudAnalytics(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalSignals,
      signalsBySeverity,
      casesByStatus,
      signalsTrend,
      topSignalTypes,
    ] = await Promise.all([
      FraudSignals.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      FraudSignals.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: "$severity", count: { $sum: 1 } } },
      ]),
      FraudCases.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      FraudSignals.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      FraudSignals.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: "$signalType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    sendSuccess(res, {
      analytics: {
        totalSignals,
        signalsBySeverity,
        casesByStatus,
        signalsTrend,
        topSignalTypes,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  getFraudSignals,
  getFraudSignalById,
  updateFraudSignal,
  getFraudCases,
  createFraudCase,
  getFraudCaseById,
  updateFraudCase,
  addCaseComment,
  getVelocityRules,
  createVelocityRule,
  updateVelocityRule,
  deleteVelocityRule,
  getBehaviorProfile,
  updateBehaviorProfile,
  getSecurityEvents,
  logSecurityEvent,
  getFraudAnalytics,
};
