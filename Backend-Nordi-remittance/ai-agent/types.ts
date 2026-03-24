// ============================================================================
// AI AGENT TYPES
// ============================================================================

export type LLMProvider = 'openai' | 'anthropic' | 'gemini' | 'huggingface';

export interface AgentConfig {
  primaryProvider: LLMProvider;
  fallbackChain: LLMProvider[];
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  guardrailsEnabled: boolean;
}

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  result: unknown;
  error?: string;
}

export interface AgentState {
  messages: AgentMessage[];
  toolCalls: ToolCall[];
  toolResults: ToolResult[];
  currentProvider: LLMProvider;
  retryCount: number;
  userId?: string;
  sessionId?: string;
  context: Record<string, unknown>;
  guardrailFlags: string[];
  decision?: AgentDecision;
}

export interface AgentDecision {
  action: 'approve' | 'deny' | 'escalate' | 'ask_clarification';
  reason: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  requiresHumanReview: boolean;
}

export interface LLMResponse {
  content: string;
  toolCalls?: ToolCall[];
  provider: LLMProvider;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  finishReason: string;
}

export interface AgentToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>, state: AgentState) => Promise<unknown>;
  requiresApproval?: boolean;
}
