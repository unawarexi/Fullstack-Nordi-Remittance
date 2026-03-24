// ============================================================================
// AI AGENT ROUTES
// ============================================================================

import { Router } from "express";
import AiAgentController from "../controllers/AiAgent.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { sanitizeInput } from "../middleware/security.middleware.js";
import { requestLoggingMiddleware } from "../middleware/core.middleware.js";

const router = Router();

router.use(requestLoggingMiddleware);
router.use(sanitizeInput);
router.use(authenticate);

/**
 * @route   POST /api/ai/chat
 * @desc    Send a message to the AI banking assistant
 * @access  Authenticated users
 */
router.post("/chat", AiAgentController.chat);

/**
 * @route   POST /api/ai/end-session
 * @desc    End and persist an AI conversation session
 * @access  Authenticated users
 */
router.post("/end-session", AiAgentController.endSession);

/**
 * @route   GET /api/ai/health
 * @desc    Check health of AI providers
 * @access  Authenticated users
 */
router.get("/health", AiAgentController.aiHealthCheck);

export default router;
