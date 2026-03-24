// ============================================================================
// LANGGRAPH ORCHESTRATOR — State-machine agent with tool execution loop
// ============================================================================
//
// Graph topology:
//   START → input_guard → route_intent → [tool_execution | direct_response]
//   tool_execution → output_guard → END
//   direct_response → output_guard → END
//   (any node) → escalate → END (if guardrails trigger)
//
// ============================================================================
import { StateGraph, END, START, Annotation } from '@langchain/langgraph';
import type {
  AgentState,
  AgentMessage,
  AgentConfig,
  LLMProvider,
  ToolCall,
  ToolResult,
  AgentDecision,
  AgentToolDefinition,
} from './types.js';
import { LLMProviderManager } from './providers/manager.js';
import { Guardrails } from './guardrails/guardrails.js';
import { agentTools } from './tools/registry.js';
import { AgentMemory } from './memory/agent-memory.js';
import logger from '../logs/logger.js';

// ============================================================================
// STATE ANNOTATION (LangGraph state schema)
// ============================================================================

const AgentAnnotation = Annotation.Root({
  messages: Annotation<AgentMessage[]>({ reducer: (a, b) => [...a, ...b], default: () => [] }),
  toolCalls: Annotation<ToolCall[]>({ reducer: (_, b) => b, default: () => [] }),
  toolResults: Annotation<ToolResult[]>({ reducer: (a, b) => [...a, ...b], default: () => [] }),
  currentProvider: Annotation<LLMProvider>({ reducer: (_, b) => b, default: () => 'openai' }),
  retryCount: Annotation<number>({ reducer: (_, b) => b, default: () => 0 }),
  userId: Annotation<string | undefined>({ reducer: (_, b) => b, default: () => undefined }),
  sessionId: Annotation<string | undefined>({ reducer: (_, b) => b, default: () => undefined }),
  context: Annotation<Record<string, unknown>>({ reducer: (a, b) => ({ ...a, ...b }), default: () => ({}) }),
  guardrailFlags: Annotation<string[]>({ reducer: (a, b) => [...a, ...b], default: () => [] }),
  decision: Annotation<AgentDecision | undefined>({ reducer: (_, b) => b, default: () => undefined }),
  output: Annotation<string>({ reducer: (_, b) => b, default: () => '' }),
  status: Annotation<'running' | 'completed' | 'escalated' | 'error'>(
    { reducer: (_, b) => b, default: () => 'running' as const },
  ),
});

type GraphState = typeof AgentAnnotation.State;

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const SYSTEM_PROMPT = `You are Nordi, an AI banking assistant for Nordi Remittance — a secure international money transfer platform.

CAPABILITIES:
- Check account balances and transaction history
- Assist with transfers and payments
- Provide account statements
- Assess transaction risk and fraud signals
- Look up user information (non-sensitive only)
- Explain fees, exchange rates, and transaction status

RULES (STRICTLY ENFORCED):
1. NEVER reveal full card numbers, SSNs, or raw passwords
2. NEVER approve transactions over $10,000 without flagging for human review
3. NEVER modify ledger entries directly — always use the ledger engine
4. NEVER provide specific investment/financial advice — only factual information
5. If uncertain about a transaction's legitimacy, ALWAYS escalate to human review
6. Always confirm transaction details with the user before executing
7. For fraud-related queries, provide analysis but let compliance team make final decisions
8. Respect KYC status — restrict operations for unverified users

PERSONALITY:
- Professional, concise, and helpful
- Use plain language, avoid jargon
- Proactively suggest relevant actions`;

// ============================================================================
// ORCHESTRATOR CLASS
// ============================================================================

export class AgentOrchestrator {
  private graph: any;
  private llm: LLMProviderManager;
  private guardrails: Guardrails;
  private tools: AgentToolDefinition[];

  constructor(config?: Partial<AgentConfig>) {
    this.llm = new LLMProviderManager(
      config?.fallbackChain || ['openai', 'anthropic', 'gemini', 'huggingface'],
    );
    this.guardrails = new Guardrails();
    this.tools = agentTools;
    this.graph = this.buildGraph();
  }

  private buildGraph() {
    const workflow = new StateGraph(AgentAnnotation)
      .addNode('input_guard', this.inputGuardNode.bind(this))
      .addNode('llm_call', this.llmCallNode.bind(this))
      .addNode('tool_execution', this.toolExecutionNode.bind(this))
      .addNode('output_guard', this.outputGuardNode.bind(this))
      .addNode('escalate', this.escalateNode.bind(this))
      .addEdge(START, 'input_guard')
      .addConditionalEdges('input_guard', (state: GraphState) => {
        if (state.status === 'escalated') return 'escalate';
        return 'llm_call';
      })
      .addConditionalEdges('llm_call', (state: GraphState) => {
        if (state.status === 'error') return 'escalate';
        if (state.toolCalls.length > 0) return 'tool_execution';
        return 'output_guard';
      })
      .addConditionalEdges('tool_execution', (state: GraphState) => {
        if (state.status === 'escalated') return 'escalate';
        // After tool execution, go back to LLM to synthesize results
        return 'llm_call';
      })
      .addEdge('output_guard', END)
      .addEdge('escalate', END);

    return workflow.compile();
  }

  // ---- GRAPH NODES ----

  private async inputGuardNode(state: GraphState): Promise<Partial<GraphState>> {
    const lastUserMsg = [...state.messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return {};

    const result = await this.guardrails.validateInput(lastUserMsg.content, state as AgentState);

    if (!result.allowed) {
      return {
        status: 'escalated',
        output: result.reason || 'Input blocked by guardrails',
        guardrailFlags: result.flags,
      };
    }

    // If PII was redacted, update the message
    if (result.modifiedContent) {
      const updatedMessages = state.messages.map((m) =>
        m === lastUserMsg ? { ...m, content: result.modifiedContent! } : m,
      );
      return { messages: updatedMessages, guardrailFlags: result.flags };
    }

    return { guardrailFlags: result.flags };
  }

  private async llmCallNode(state: GraphState): Promise<Partial<GraphState>> {
    // Build messages with system prompt
    const messagesForLLM: AgentMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...state.messages,
    ];

    // Add tool results as assistant context
    if (state.toolResults.length > 0) {
      for (const tr of state.toolResults) {
        messagesForLLM.push({
          role: 'tool',
          content: JSON.stringify(tr.result),
          toolCallId: tr.toolCallId,
          name: 'tool_result',
        });
      }
    }

    try {
      const response = await this.llm.chat(messagesForLLM, this.tools, {
        temperature: 0.3,
        maxTokens: 4096,
      });

      const updates: Partial<GraphState> = {
        currentProvider: response.provider,
        messages: [{ role: 'assistant', content: response.content }],
      };

      if (response.toolCalls && response.toolCalls.length > 0) {
        updates.toolCalls = response.toolCalls;
      } else {
        updates.toolCalls = [];
        updates.output = response.content;
      }

      return updates;
    } catch (err: any) {
      logger.error('[Agent] All LLM providers failed', { error: err.message });
      return {
        status: 'error',
        output: 'I apologize, but I am temporarily unable to assist. Please try again shortly or contact support.',
      };
    }
  }

  private async toolExecutionNode(state: GraphState): Promise<Partial<GraphState>> {
    // Guardrail: validate tool calls first
    const guardResult = this.guardrails.validateToolCalls(state.toolCalls, state as AgentState);
    if (!guardResult.allowed) {
      return {
        status: 'escalated',
        output: guardResult.reason || 'Tool calls blocked by guardrails',
        guardrailFlags: guardResult.flags,
      };
    }

    const results: ToolResult[] = [];

    for (const tc of state.toolCalls) {
      const tool = this.tools.find((t) => t.name === tc.name);
      if (!tool) {
        results.push({ toolCallId: tc.id, result: null, error: `Unknown tool: ${tc.name}` });
        continue;
      }

      // Check if tool requires human approval and amount is high
      if (tool.requiresApproval) {
        const amount = tc.arguments.amount as number | undefined;
        if (amount && amount > Guardrails.AUTO_APPROVE_LIMIT) {
          results.push({
            toolCallId: tc.id,
            result: {
              requiresApproval: true,
              message: `This transaction of ${amount} requires human approval before execution.`,
            },
          });
          continue;
        }
      }

      try {
        const result = await tool.execute(tc.arguments, state as AgentState);
        results.push({ toolCallId: tc.id, result });
      } catch (err: any) {
        logger.error(`[Agent] Tool ${tc.name} failed`, { error: err.message, args: tc.arguments });
        results.push({ toolCallId: tc.id, result: null, error: err.message });
      }
    }

    return {
      toolResults: results,
      toolCalls: [], // clear after execution
    };
  }

  private async outputGuardNode(state: GraphState): Promise<Partial<GraphState>> {
    const result = this.guardrails.validateOutput(state.output, state as AgentState);

    if (result.modifiedContent) {
      return {
        output: result.modifiedContent,
        guardrailFlags: result.flags,
        status: 'completed',
      };
    }

    return { guardrailFlags: result.flags, status: 'completed' };
  }

  private async escalateNode(state: GraphState): Promise<Partial<GraphState>> {
    logger.warn('[Agent] Escalated to human review', {
      flags: state.guardrailFlags,
      userId: state.userId,
    });
    return { status: 'escalated' };
  }

  // ---- PUBLIC API ----

  /**
   * Process a user message and return the agent's response.
   */
  async chat(
    userMessage: string,
    userId?: string,
    sessionId?: string,
  ): Promise<{ response: string; status: string; flags: string[]; provider: string }> {
    const sId = sessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Load conversation history from memory
    const history = await AgentMemory.getMessages(sId);

    // Add the new user message
    const userMsg: AgentMessage = { role: 'user', content: userMessage };
    await AgentMemory.addMessage(sId, userMsg);

    // Run the graph
    const result = await this.graph.invoke({
      messages: [...history, userMsg],
      userId,
      sessionId: sId,
    });

    // Store assistant response in memory
    if (result.output) {
      await AgentMemory.addMessage(sId, { role: 'assistant', content: result.output });
    }

    return {
      response: result.output || 'I was unable to generate a response.',
      status: result.status,
      flags: result.guardrailFlags || [],
      provider: result.currentProvider || 'unknown',
    };
  }

  /**
   * End a session — summarize and persist to long-term memory.
   */
  async endSession(userId: string, sessionId: string): Promise<void> {
    const messages = await AgentMemory.getMessages(sessionId);
    if (messages.length > 0) {
      await AgentMemory.summarizeAndPersist(userId, sessionId, messages, async (msgs) => {
        // Use a cheap LLM call to summarize
        const response = await this.llm.chat([
          { role: 'system', content: 'Summarize this banking conversation in 2-3 sentences. Focus on what the user needed and what was resolved.' },
          { role: 'user', content: msgs.map((m) => `${m.role}: ${m.content}`).join('\n') },
        ]);
        return response.content;
      });
    }
    await AgentMemory.clearSession(sessionId);
  }

  /**
   * Get health status of all LLM providers.
   */
  async healthCheck() {
    return this.llm.healthCheck();
  }
}
