// ============================================================================
// INTEGRATIONS CONTROLLER
// ============================================================================

import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import type { AuthenticatedRequest } from "../types/index.js";
import {
  BankIntegrations,
  PaymentGateways,
  WebhookSubscriptions,
  ThirdPartyAccounts,
  APIKeys,
} from "../models/IntergrationsModel.js";
import { AdminActionLogs } from "../models/AdminModel.js";
import {
  generateSecureToken,
  sha256Hash,
} from "../core/helpers/crypto.helper.js";
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
import crypto from "crypto";
import { emitToUser } from "../services/websocket.service.js";
import { WS } from "../core/constants/ws-events.js";

// Helper function to generate API key
function generateApiKey(): { key: string; prefix: string } {
  const key = `rmk_${generateSecureToken(32)}`;
  return { key, prefix: key.substring(0, 8) };
}

// Helper function to hash API key
function hashApiKey(key: string): string {
  return sha256Hash(key);
}

// ============================================================================
// BANK INTEGRATIONS
// ============================================================================

export async function getIntegrations(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const integrations = await BankIntegrations.find()
      .select(
        "-credentials.apiSecret -credentials.clientSecret -credentials.accessToken -credentials.privateKey",
      )
      .sort({ bankName: 1 })
      .lean();

    sendSuccess(res, { integrations });
  } catch (error) {
    next(error);
  }
}

export async function getIntegrationById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;

    const integration = await BankIntegrations.findById(id)
      .select(
        "-credentials.apiSecret -credentials.clientSecret -credentials.accessToken -credentials.privateKey",
      )
      .lean();

    if (!integration) throw new NotFoundError("Integration not found");

    sendSuccess(res, { integration });
  } catch (error) {
    next(error);
  }
}

export async function createIntegration(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const {
      bankName,
      bankCode,
      integrationType,
      apiBaseUrl,
      apiVersion,
      authMethod,
      credentials,
      features,
      rateLimits,
    } = req.body;

    if (!bankName || !bankCode || !integrationType) {
      throw new ValidationError(
        "Bank name, code, and integration type are required",
      );
    }

    const integration = new BankIntegrations({
      bankName,
      bankCode,
      integrationType,
      apiBaseUrl: apiBaseUrl || "",
      apiVersion: apiVersion || "1.0",
      authMethod: authMethod || "api_key",
      credentials: credentials || {},
      features: features || {},
      rateLimits: rateLimits || {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
      },
      status: "testing",
    });

    await integration.save();

    await AdminActionLogs.create({
      admin: req.user.userId,
      action: "CREATE_INTEGRATION",
      resource: "bank_integration",
      resourceId: integration._id.toString(),
      changes: { bankName, bankCode, integrationType },
      ipAddress: req.ip || "unknown",
      userAgent: req.get("user-agent") || "unknown",
      status: "success",
    });

    sendCreated(
      res,
      {
        integration: {
          id: integration._id,
          integrationId: integration.integrationId,
          bankName: integration.bankName,
          bankCode: integration.bankCode,
          status: integration.status,
        },
      },
      "Integration created successfully",
    );
  } catch (error) {
    next(error);
  }
}

export async function updateIntegration(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;
    const {
      bankName,
      apiBaseUrl,
      apiVersion,
      credentials,
      features,
      rateLimits,
      status,
    } = req.body;

    const integration = await BankIntegrations.findById(id);
    if (!integration) throw new NotFoundError("Integration not found");

    if (bankName) integration.bankName = bankName;
    if (apiBaseUrl) integration.apiBaseUrl = apiBaseUrl;
    if (apiVersion) integration.apiVersion = apiVersion;
    if (credentials) {
      integration.credentials = {
        ...(integration.credentials as any),
        ...credentials,
      };
    }
    if (features) {
      integration.features = { ...(integration.features as any), ...features };
    }
    if (rateLimits) {
      integration.rateLimits = {
        ...(integration.rateLimits as any),
        ...rateLimits,
      };
    }
    if (status) integration.status = status;

    await integration.save();

    await AdminActionLogs.create({
      admin: req.user.userId,
      action: "UPDATE_INTEGRATION",
      resource: "bank_integration",
      resourceId: integration._id.toString(),
      changes: { bankName, apiBaseUrl, status },
      ipAddress: req.ip || "unknown",
      userAgent: req.get("user-agent") || "unknown",
      status: "success",
    });

    sendSuccess(res, { integration }, "Integration updated");
  } catch (error) {
    next(error);
  }
}

export async function deleteIntegration(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;

    const integration = await BankIntegrations.findById(id);
    if (!integration) throw new NotFoundError("Integration not found");

    // Deactivate instead of delete
    integration.status = "deprecated";
    await integration.save();

    await AdminActionLogs.create({
      admin: req.user.userId,
      action: "DELETE_INTEGRATION",
      resource: "bank_integration",
      resourceId: integration._id.toString(),
      changes: { bankName: integration.bankName },
      ipAddress: req.ip || "unknown",
      userAgent: req.get("user-agent") || "unknown",
      status: "success",
    });

    sendSuccess(res, null, "Integration deactivated");
  } catch (error) {
    next(error);
  }
}

export async function testIntegration(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;

    const integration = await BankIntegrations.findById(id);
    if (!integration) throw new NotFoundError("Integration not found");

    // Simulate connection test
    try {
      // In production, you'd actually test the connection here
      const isHealthy = true;

      integration.lastHealthCheckAt = new Date();
      integration.healthCheckStatus = isHealthy ? "healthy" : "down";
      await integration.save();

      sendSuccess(
        res,
        {
          status: isHealthy ? "healthy" : "unhealthy",
          testedAt: new Date(),
        },
        isHealthy ? "Connection successful" : "Connection failed",
      );
    } catch (error) {
      integration.healthCheckStatus = "down";
      await integration.save();
      throw error;
    }
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// INTEGRATION LOGS
// ============================================================================

export async function getIntegrationLogs(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    const filter: any = { resource: "bank_integration" };
    if (req.query.integrationId) filter.resourceId = req.query.integrationId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.action) filter.action = req.query.action;

    const [logs, total] = await Promise.all([
      AdminActionLogs.find(filter)
        .select("action resource resourceId status admin description createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdminActionLogs.countDocuments(filter),
    ]);

    sendPaginated(res, logs, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// WEBHOOKS
// ============================================================================

export async function getWebhooks(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const webhooks = await WebhookSubscriptions.find({ user: req.user.userId })
      .select("-credentials.secret -credentials.apiKey")
      .sort({ createdAt: -1 })
      .lean();

    sendSuccess(res, { webhooks });
  } catch (error) {
    next(error);
  }
}

export async function createWebhook(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { name, url, events, authMethod } = req.body;

    if (!name || !url || !events || events.length === 0) {
      throw new ValidationError("Name, URL, and events are required");
    }

    const secret = generateSecureToken(32);

    const webhook = new WebhookSubscriptions({
      user: req.user.userId,
      name,
      url,
      events,
      authMethod: authMethod || "hmac",
      credentials: {
        secret,
      },
      status: "active",
    });

    await webhook.save();

    sendCreated(
      res,
      {
        webhook: {
          id: webhook._id,
          subscriptionId: webhook.subscriptionId,
          name: webhook.name,
          url: webhook.url,
          events: webhook.events,
          secret, // Only return on creation
          status: webhook.status,
        },
      },
      "Webhook created",
    );
  } catch (error) {
    next(error);
  }
}

export async function updateWebhook(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;
    const { name, url, events, status } = req.body;

    const webhook = await WebhookSubscriptions.findOne({
      _id: id,
      user: req.user.userId,
    });
    if (!webhook) throw new NotFoundError("Webhook not found");

    if (name) webhook.name = name;
    if (url) webhook.url = url;
    if (events) webhook.events = events;
    if (status) webhook.status = status;

    await webhook.save();

    sendSuccess(res, { webhook }, "Webhook updated");
  } catch (error) {
    next(error);
  }
}

export async function deleteWebhook(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;

    const webhook = await WebhookSubscriptions.findOneAndDelete({
      _id: id,
      user: req.user.userId,
    });
    if (!webhook) throw new NotFoundError("Webhook not found");

    sendSuccess(res, null, "Webhook deleted");
  } catch (error) {
    next(error);
  }
}

export async function regenerateWebhookSecret(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;

    const webhook = await WebhookSubscriptions.findOne({
      _id: id,
      user: req.user.userId,
    });
    if (!webhook) throw new NotFoundError("Webhook not found");

    const newSecret = generateSecureToken(32);
    (webhook.credentials as any).secret = newSecret;
    await webhook.save();

    sendSuccess(res, { secret: newSecret }, "Webhook secret regenerated");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// API KEYS
// ============================================================================

export async function getApiKeys(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const keys = await APIKeys.find({ user: req.user.userId })
      .select("-key")
      .sort({ createdAt: -1 })
      .lean();

    sendSuccess(res, { keys });
  } catch (error) {
    next(error);
  }
}

export async function createApiKey(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { name, type, environment, permissions, expiresAt } = req.body;

    // Limit API keys
    const activeKeys = await APIKeys.countDocuments({
      user: req.user.userId,
      status: "active",
    });

    if (activeKeys >= 5) {
      throw new ForbiddenError("Maximum API key limit reached");
    }

    const { key, prefix } = generateApiKey();
    const hashedKey = hashApiKey(key);

    const apiKey = new APIKeys({
      user: req.user.userId,
      name,
      key: hashedKey,
      keyPrefix: prefix,
      type: type || "public",
      environment: environment || "sandbox",
      permissions: permissions || [],
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
      },
      createdBy: req.user.userId,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    await apiKey.save();

    sendCreated(
      res,
      {
        key: {
          id: apiKey._id,
          keyId: apiKey.keyId,
          name: apiKey.name,
          keyPrefix: apiKey.keyPrefix,
          apiKey: key, // Only show once
          type: apiKey.type,
          environment: apiKey.environment,
        },
      },
      "API key created",
    );
  } catch (error) {
    next(error);
  }
}

export async function revokeApiKey(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;

    const apiKey = await APIKeys.findOne({ _id: id, user: req.user.userId });
    if (!apiKey) throw new NotFoundError("API key not found");

    apiKey.status = "revoked";
    apiKey.revokedAt = new Date();
    apiKey.revokedBy = req.user.userId;
    await apiKey.save();

    sendSuccess(res, null, "API key revoked");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXTERNAL ACCOUNTS (Third Party Accounts)
// ============================================================================

export async function getExternalAccounts(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const accounts = await ThirdPartyAccounts.find({
      user: req.user.userId,
      status: { $ne: "expired" },
    })
      .select("-accessToken")
      .lean();

    // Mask account numbers
    const maskedAccounts = accounts.map((acc) => ({
      ...acc,
      maskedAccountNumber: `****${(acc.accountNumber || "").slice(-4)}`,
      accountNumber: undefined,
    }));

    sendSuccess(res, { accounts: maskedAccounts });
  } catch (error) {
    next(error);
  }
}

export async function linkExternalAccount(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const {
      provider,
      providerAccountId,
      accessToken,
      itemId,
      institutionId,
      institutionName,
      accountType,
      accountNumber,
      accountName,
      currency,
    } = req.body;

    // Check max linked accounts
    const existingAccounts = await ThirdPartyAccounts.countDocuments({
      user: req.user.userId,
      status: "active",
    });

    if (existingAccounts >= 10) {
      throw new ForbiddenError("Maximum linked accounts reached");
    }

    const account = new ThirdPartyAccounts({
      user: req.user.userId,
      provider,
      providerAccountId,
      accessToken,
      itemId,
      institutionId,
      institutionName,
      accountType,
      accountNumber,
      accountName,
      currency: currency || "USD",
      status: "active",
    });

    await account.save();

    emitToUser(req.user!.userId, WS.INTEGRATION.EXTERNAL_ACCOUNT_LINKED, {
      accountId: account.accountId || account._id,
      provider: account.provider,
      institutionName: account.institutionName,
      timestamp: new Date().toISOString(),
    });

    sendCreated(
      res,
      {
        account: {
          id: account._id,
          accountId: account.accountId,
          provider: account.provider,
          institutionName: account.institutionName,
          accountType: account.accountType,
          accountName: account.accountName,
          maskedAccountNumber: `****${(accountNumber || "").slice(-4)}`,
          status: account.status,
        },
      },
      "Account linked successfully",
    );
  } catch (error) {
    next(error);
  }
}

export async function unlinkExternalAccount(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;

    const account = await ThirdPartyAccounts.findOne({
      _id: id,
      user: req.user.userId,
    });
    if (!account) throw new NotFoundError("Account not found");

    // Set status to inactive instead of deleting
    account.status = "inactive";
    await account.save();

    emitToUser(req.user!.userId, WS.INTEGRATION.EXTERNAL_ACCOUNT_UNLINKED, {
      accountId: account.accountId || account._id,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, null, "Account unlinked");
  } catch (error) {
    next(error);
  }
}

export async function verifyExternalAccount(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;
    const { amounts } = req.body; // Micro-deposit verification amounts

    const account = await ThirdPartyAccounts.findOne({
      _id: id,
      user: req.user.userId,
    });
    if (!account) throw new NotFoundError("Account not found");

    // In production, verify against actual micro-deposit amounts
    // For now, just mark as verified
    account.status = "active";
    account.lastSyncAt = new Date();
    account.syncStatus = "success";
    await account.save();

    sendSuccess(res, { account }, "Account verified");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  getIntegrations,
  getIntegrationById,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  testIntegration,
  getIntegrationLogs,
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  regenerateWebhookSecret,
  getApiKeys,
  createApiKey,
  revokeApiKey,
  getExternalAccounts,
  linkExternalAccount,
  unlinkExternalAccount,
  verifyExternalAccount,
};
