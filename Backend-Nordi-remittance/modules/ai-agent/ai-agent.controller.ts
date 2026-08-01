// ============================================================================
// AI AGENT CONTROLLER — Handles chat, sessions, health
// ============================================================================
import type { Request, Response, NextFunction } from 'express';
import { AgentOrchestrator } from '../../ai-agent/orchestrator.js';
import { env } from '../../config/env.config.js';
import logger from '../../logs/logger.js';

let orchestrator: AgentOrchestrator | null = null;

function getOrchestrator(): AgentOrchestrator {
  if (!orchestrator) {
    orchestrator = new AgentOrchestrator();
  }
  return orchestrator;
}

// ============================================================================
// CHAT
// ============================================================================

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    if (!env.ENABLE_AI_AGENT) {
      res.status(503).json({ success: false, error: 'AI agent is currently disabled' });
      return;
    }

    const { message, sessionId } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Message is required' });
      return;
    }

    if (message.length > 2000) {
      res.status(400).json({ success: false, error: 'Message too long (max 2000 characters)' });
      return;
    }

    const userId = (req as any).user?.id;
    const agent = getOrchestrator();

    const result = await agent.chat(message.trim(), userId, sessionId);

    res.json({
      success: true,
      data: {
        response: result.response,
        sessionId: sessionId || result.flags.find((f) => f.startsWith('session_')),
        status: result.status,
        provider: result.provider,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// END SESSION
// ============================================================================

export async function endSession(req: Request, res: Response, next: NextFunction) {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      res.status(400).json({ success: false, error: 'Session ID is required' });
      return;
    }

    const userId = (req as any).user?.id;
    const agent = getOrchestrator();
    await agent.endSession(userId, sessionId);

    res.json({ success: true, message: 'Session ended and persisted' });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function aiHealthCheck(_req: Request, res: Response, next: NextFunction) {
  try {
    const agent = getOrchestrator();
    const providers = await agent.healthCheck();

    res.json({
      success: true,
      data: {
        enabled: env.ENABLE_AI_AGENT,
        providers,
        mlServiceUrl: env.ML_SERVICE_URL,
      },
    });
  } catch (err) {
    next(err);
  }
}

export default { chat, endSession, aiHealthCheck };
