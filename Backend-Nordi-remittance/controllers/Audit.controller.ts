// ============================================================================
// AUDIT CONTROLLER
// ============================================================================

import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/index.js';
import { AuditLogs, ComplianceReports, DataAccessLogs, SystemAuditTrails } from '../models/AuditModels.js';
import { AdminActionLogs } from '../models/AdminModel.js';
import Transactions from '../models/TransactionModel.js';
import Users from '../models/UserModel.js';
import { sendSuccess, sendCreated, sendPaginated } from '../core/helpers/response.helper.js';
import { UnauthorizedError, NotFoundError, ValidationError } from '../core/errors/AppError.js';

// ============================================================================
// AUDIT LOGS
// ============================================================================

export async function getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.resource) filter.resource = req.query.resource;
    if (req.query.actor) filter.actor = req.query.actor;
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.eventType) filter.eventType = req.query.eventType;

    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate as string);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate as string);
    }

    const [logs, total] = await Promise.all([
      AuditLogs.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLogs.countDocuments(filter),
    ]);

    sendPaginated(res, logs, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { id } = req.params;

    const log = await AuditLogs.findById(id).lean();

    if (!log) throw new NotFoundError('Audit log not found');

    sendSuccess(res, { log });
  } catch (error) {
    next(error);
  }
}

export async function createAuditLog(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      eventType,
      action,
      resource,
      resourceId,
      changes,
      metadata,
      severity,
      status,
    } = req.body;

    const log = new AuditLogs({
      eventType: eventType || 'user_action',
      action,
      actor: req.user?.userId || 'system',
      actorType: req.user ? 'user' : 'system',
      resource,
      resourceId,
      changes,
      metadata,
      severity: severity || 'info',
      status: status || 'success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    await log.save();

    sendCreated(res, { log }, 'Audit log created');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// COMPLIANCE REPORTS
// ============================================================================

export async function getComplianceReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.type) filter.reportType = req.query.type;
    if (req.query.status) filter.status = req.query.status;

    const [reports, total] = await Promise.all([
      ComplianceReports.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ComplianceReports.countDocuments(filter),
    ]);

    sendPaginated(res, reports, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

export async function generateComplianceReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { reportType, startDate, endDate, filters } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    let reportData: any = {};
    let findings: any[] = [];

    switch (reportType) {
      case 'transaction_monitoring':
        reportData = await generateTransactionMonitoringReport(start, end, filters);
        break;
      case 'kyc_compliance':
        reportData = await generateKycComplianceReport(start, end);
        break;
      case 'suspicious_activity':
        reportData = await generateSuspiciousActivityReport(start, end);
        break;
      case 'regulatory':
        reportData = await generateRegulatoryReport(start, end);
        break;
      default:
        throw new ValidationError('Invalid report type');
    }

    const report = new ComplianceReports({
      reportType,
      title: `${reportType.replace(/_/g, ' ').toUpperCase()} Report`,
      description: `Report for period ${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`,
      periodStart: start,
      periodEnd: end,
      data: reportData,
      findings: reportData.findings || [],
      status: 'completed',
      generatedBy: req.user.userId,
      generatedAt: new Date(),
    });

    await report.save();

    sendCreated(res, { report }, 'Compliance report generated');
  } catch (error) {
    next(error);
  }
}

async function generateTransactionMonitoringReport(start: Date, end: Date, filters: any) {
  const transactions = await Transactions.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: 'completed',
      },
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' },
        maxAmount: { $max: '$amount' },
      },
    },
  ]);

  // Large transactions (potential reporting threshold)
  const largeTransactions = await Transactions.find({
    createdAt: { $gte: start, $lte: end },
    amount: { $gte: 10000 },
    status: 'completed',
  })
    .populate('sender', 'firstName lastName email')
    .populate('recipient', 'firstName lastName email')
    .lean();

  const findings = [];
  if (largeTransactions.length > 0) {
    findings.push({
      type: 'large_transactions',
      severity: 'medium',
      count: largeTransactions.length,
      description: `${largeTransactions.length} transactions over $10,000 threshold`,
    });
  }

  return {
    summary: transactions,
    largeTransactions,
    totalTransactions: transactions.reduce((sum, t) => sum + t.count, 0),
    totalVolume: transactions.reduce((sum, t) => sum + t.totalAmount, 0),
    findings,
  };
}

async function generateKycComplianceReport(start: Date, end: Date) {
  const kycStats = await Users.aggregate([
    {
      $group: {
        _id: '$kycStatus',
        count: { $sum: 1 },
      },
    },
  ]);

  const pendingKyc = await Users.find({
    kycStatus: 'pending',
    createdAt: { $gte: start, $lte: end },
  }).select('firstName lastName email createdAt kycSubmittedAt').lean();

  const expiredDocuments = await Users.find({
    'kycDocuments.expiryDate': { $lt: new Date() },
    kycStatus: 'approved',
  }).select('firstName lastName email').lean();

  const findings = [];
  if (pendingKyc.length > 10) {
    findings.push({
      type: 'pending_kyc_backlog',
      severity: 'high',
      count: pendingKyc.length,
      description: `${pendingKyc.length} KYC applications pending review`,
    });
  }

  if (expiredDocuments.length > 0) {
    findings.push({
      type: 'expired_documents',
      severity: 'medium',
      count: expiredDocuments.length,
      description: `${expiredDocuments.length} users with expired KYC documents`,
    });
  }

  return {
    kycStats,
    pendingKyc,
    expiredDocuments,
    findings,
  };
}

async function generateSuspiciousActivityReport(start: Date, end: Date) {
  // Multiple rapid transactions
  const rapidTransactions = await Transactions.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: 'completed',
      },
    },
    {
      $group: {
        _id: {
          sender: '$sender',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
    {
      $match: {
        $or: [
          { count: { $gte: 20 } },
          { totalAmount: { $gte: 50000 } },
        ],
      },
    },
  ]);

  // Round amount transactions (potential structuring)
  const roundAmountTx = await Transactions.countDocuments({
    createdAt: { $gte: start, $lte: end },
    $expr: { $eq: [{ $mod: ['$amount', 1000] }, 0] },
    amount: { $gte: 5000 },
  });

  const findings = [];
  if (rapidTransactions.length > 0) {
    findings.push({
      type: 'high_frequency_transactions',
      severity: 'high',
      count: rapidTransactions.length,
      description: `${rapidTransactions.length} accounts with suspicious transaction patterns`,
    });
  }

  if (roundAmountTx > 50) {
    findings.push({
      type: 'potential_structuring',
      severity: 'high',
      count: roundAmountTx,
      description: `${roundAmountTx} large round-amount transactions detected`,
    });
  }

  return {
    rapidTransactions,
    roundAmountTransactions: roundAmountTx,
    findings,
  };
}

async function generateRegulatoryReport(start: Date, end: Date) {
  const [userStats, transactionStats, kycStats] = await Promise.all([
    Users.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, newUsers: { $sum: 1 } } },
    ]),
    Transactions.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: 'completed' } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          volume: { $sum: '$amount' },
        },
      },
    ]),
    Users.aggregate([
      {
        $group: {
          _id: '$kycStatus',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  return {
    period: { start, end },
    userMetrics: {
      newUsers: userStats[0]?.newUsers || 0,
      kycCompliance: kycStats,
    },
    transactionMetrics: {
      totalTransactions: transactionStats[0]?.count || 0,
      totalVolume: transactionStats[0]?.volume || 0,
    },
    findings: [],
  };
}

export async function getComplianceReportById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { id } = req.params;

    const report = await ComplianceReports.findById(id).lean();

    if (!report) throw new NotFoundError('Report not found');

    sendSuccess(res, { report });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// DATA ACCESS LOGS
// ============================================================================

export async function getDataAccessLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.accessor) filter.accessor = req.query.accessor;
    if (req.query.dataType) filter.dataType = req.query.dataType;
    if (req.query.accessMethod) filter.accessMethod = req.query.accessMethod;

    const [logs, total] = await Promise.all([
      DataAccessLogs.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DataAccessLogs.countDocuments(filter),
    ]);

    sendPaginated(res, logs, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

export async function logDataAccess(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { dataType, dataOwner, accessReason, accessMethod, dataFields, consentObtained, legalBasis } = req.body;

    const log = new DataAccessLogs({
      accessor: req.user?.userId || 'system',
      accessorType: req.user ? 'user' : 'system',
      dataOwner,
      dataType,
      accessReason: accessReason || 'User request',
      accessMethod: accessMethod || 'view',
      dataFields: dataFields || [],
      consentObtained: consentObtained ?? true,
      legalBasis,
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    await log.save();

    sendCreated(res, { log }, 'Data access logged');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// SYSTEM AUDIT TRAILS
// ============================================================================

export async function getSystemAuditTrails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.component) filter.component = req.query.component;
    if (req.query.eventType) filter.eventType = req.query.eventType;

    const [trails, total] = await Promise.all([
      SystemAuditTrails.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SystemAuditTrails.countDocuments(filter),
    ]);

    sendPaginated(res, trails, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

export async function logSystemEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { component, eventType, description, metadata, severity } = req.body;

    const trail = new SystemAuditTrails({
      component,
      eventType: eventType || 'info',
      description,
      metadata,
      severity: severity || 'info',
    });

    await trail.save();

    sendCreated(res, { trail }, 'System event logged');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// AUDIT SEARCH
// ============================================================================

export async function searchAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { query, startDate, endDate, entityTypes, actions, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const filter: any = {};

    if (query) {
      filter.$text = { $search: query as string };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    if (entityTypes) {
      filter.resource = { $in: (entityTypes as string).split(',') };
    }

    if (actions) {
      filter.action = { $in: (actions as string).split(',') };
    }

    const [logs, total] = await Promise.all([
      AuditLogs.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string))
        .lean(),
      AuditLogs.countDocuments(filter),
    ]);

    sendPaginated(res, logs, { page: parseInt(page as string), limit: parseInt(limit as string), total });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT AUDIT DATA
// ============================================================================

export async function exportAuditData(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { format, startDate, endDate, entityTypes } = req.query;

    const filter: any = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }
    if (entityTypes) {
      filter.resource = { $in: (entityTypes as string).split(',') };
    }

    const logs = await AuditLogs.find(filter)
      .sort({ createdAt: -1 })
      .limit(10000) // Cap at 10k records
      .lean();

    // Log the export action
    await DataAccessLogs.create({
      accessor: req.user.userId,
      accessorType: 'user',
      dataOwner: req.user.userId,
      dataType: 'other',
      accessReason: 'Audit data export',
      accessMethod: 'export',
      dataFields: ['audit_logs'],
      consentObtained: true,
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    if (format === 'csv') {
      // Convert to CSV
      const csvHeader = 'createdAt,eventType,action,actor,actorType,resource,resourceId,severity,status\n';
      const csvRows = logs.map(log => {
        return `${log.createdAt},${log.eventType},${log.action},${log.actor},${log.actorType},${log.resource},${log.resourceId},${log.severity},${log.status}`;
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit_export.csv');
      res.send(csvHeader + csvRows);
      return;
    }

    // Default to JSON
    sendSuccess(res, { logs, count: logs.length });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  getAuditLogs,
  getAuditLogById,
  createAuditLog,
  getComplianceReports,
  generateComplianceReport,
  getComplianceReportById,
  getDataAccessLogs,
  logDataAccess,
  getSystemAuditTrails,
  logSystemEvent,
  searchAuditLogs,
  exportAuditData,
};
