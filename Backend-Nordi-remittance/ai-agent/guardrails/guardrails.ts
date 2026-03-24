// ============================================================================
// GUARDRAILS — Core safety layer for the banking AI agent
// ============================================================================
import { InputValidator } from './input-validator.js';
import { OutputValidator } from './output-validator.js';
import type { AgentState, AgentDecision, ToolCall } from '../types.js';
import logger from '../../logs/logger.js';

export interface GuardrailResult {
  allowed: boolean;
  flags: string[];
  reason?: string;
  modifiedContent?: string;
}

export class Guardrails {
  private inputValidator = new InputValidator();
  private outputValidator = new OutputValidator();

  // Maximum amount the AI can approve without human review
  static readonly AUTO_APPROVE_LIMIT = 10_000;
  // Maximum number of tool calls in a single agent turn
  static readonly MAX_TOOL_CALLS_PER_TURN = 5;
  // Blocked operations the AI must never perform
  static readonly BLOCKED_OPERATIONS = new Set([
    'delete_account',
    'modify_ledger_directly',
    'bypass_kyc',
    'disable_fraud_detection',
    'grant_admin_role',
    'export_all_users',
    'raw_database_query',
  ]);

  /**
   * Validate user input before it reaches the LLM.
   */
  async validateInput(userMessage: string, state: AgentState): Promise<GuardrailResult> {
    const flags: string[] = [];

    // 1. Prompt injection detection
    const injectionCheck = this.inputValidator.detectPromptInjection(userMessage);
    if (injectionCheck.detected) {
      logger.warn('[Guardrails] Prompt injection detected', { message: userMessage.slice(0, 200) });
      return {
        allowed: false,
        flags: ['PROMPT_INJECTION'],
        reason: 'Input contains potentially malicious instructions',
      };
    }

    // 2. PII in raw input (we don't want full card numbers, SSNs in LLM context)
    const piiCheck = this.inputValidator.detectPII(userMessage);
    if (piiCheck.found) {
      flags.push('PII_DETECTED');
      return {
        allowed: true,
        flags,
        modifiedContent: piiCheck.redacted,
      };
    }

    // 3. Topic boundary — only financial/banking topics
    const topicCheck = this.inputValidator.checkTopicBoundary(userMessage);
    if (!topicCheck.onTopic) {
      flags.push('OFF_TOPIC');
      return {
        allowed: false,
        flags,
        reason: 'I can only help with banking and financial operations. Please ask about accounts, transactions, payments, or compliance.',
      };
    }

    // 4. Rate check — too many messages in session
    if (state.messages.length > 100) {
      flags.push('SESSION_TOO_LONG');
    }

    return { allowed: true, flags };
  }

  /**
   * Validate tool calls before execution.
   */
  validateToolCalls(toolCalls: ToolCall[], state: AgentState): GuardrailResult {
    const flags: string[] = [];

    // 1. Too many tool calls
    if (toolCalls.length > Guardrails.MAX_TOOL_CALLS_PER_TURN) {
      return {
        allowed: false,
        flags: ['EXCESSIVE_TOOL_CALLS'],
        reason: `Too many tool calls (${toolCalls.length} > ${Guardrails.MAX_TOOL_CALLS_PER_TURN})`,
      };
    }

    // 2. Blocked operations
    for (const tc of toolCalls) {
      if (Guardrails.BLOCKED_OPERATIONS.has(tc.name)) {
        return {
          allowed: false,
          flags: ['BLOCKED_OPERATION'],
          reason: `Operation "${tc.name}" is not permitted`,
        };
      }
    }

    // 3. Financial amount limits
    for (const tc of toolCalls) {
      const amount = tc.arguments.amount as number | undefined;
      if (amount && amount > Guardrails.AUTO_APPROVE_LIMIT) {
        flags.push('HIGH_VALUE_TRANSACTION');
      }
    }

    // 4. Prevent multiple write operations in a single turn
    const writeOps = toolCalls.filter((tc) =>
      tc.name.startsWith('transfer_') || tc.name.startsWith('create_') || tc.name.startsWith('update_'),
    );
    if (writeOps.length > 1) {
      flags.push('MULTIPLE_WRITES');
      return {
        allowed: false,
        flags,
        reason: 'Cannot execute multiple write operations in a single turn for safety',
      };
    }

    return { allowed: true, flags };
  }

  /**
   * Validate LLM output before sending to user.
   */
  validateOutput(content: string, state: AgentState): GuardrailResult {
    const flags: string[] = [];

    // 1. PII leakage in response
    const piiCheck = this.outputValidator.detectPIILeakage(content);
    if (piiCheck.found) {
      flags.push('PII_IN_OUTPUT');
      return {
        allowed: true,
        flags,
        modifiedContent: piiCheck.redacted,
      };
    }

    // 2. Hallucination markers (making up account numbers, transaction IDs)
    const hallucinationCheck = this.outputValidator.detectHallucination(content, state);
    if (hallucinationCheck.detected) {
      flags.push('POTENTIAL_HALLUCINATION');
    }

    // 3. Financial advice disclaimer
    if (this.outputValidator.containsFinancialAdvice(content)) {
      flags.push('FINANCIAL_ADVICE');
      const disclaimer = '\n\n*This is informational only and not financial advice. Please consult a qualified financial advisor.*';
      return {
        allowed: true,
        flags,
        modifiedContent: content + disclaimer,
      };
    }

    return { allowed: true, flags };
  }

  /**
   * Decision guardrail — validate final agent decisions.
   */
  validateDecision(decision: AgentDecision): GuardrailResult {
    // High-risk or critical decisions always require human review
    if (decision.riskLevel === 'critical' || decision.riskLevel === 'high') {
      decision.requiresHumanReview = true;
      decision.action = decision.action === 'approve' ? 'escalate' : decision.action;
    }

    // Low confidence decisions should be escalated
    if (decision.confidence < 0.7) {
      decision.requiresHumanReview = true;
      decision.action = 'escalate';
    }

    return { allowed: true, flags: [] };
  }
}
