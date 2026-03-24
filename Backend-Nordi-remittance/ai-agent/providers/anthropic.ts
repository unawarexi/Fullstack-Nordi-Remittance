// ============================================================================
// LLM PROVIDER — Anthropic Claude (Claude 4 Sonnet)
// ============================================================================
import Anthropic from '@anthropic-ai/sdk';
import type { AgentMessage, LLMResponse, AgentToolDefinition, ToolCall } from '../types.js';

export class AnthropicProvider {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
    this.client = new Anthropic({ apiKey });
  }

  async chat(
    messages: AgentMessage[],
    tools?: AgentToolDefinition[],
    options?: { temperature?: number; maxTokens?: number; model?: string },
  ): Promise<LLMResponse> {
    const model = options?.model || 'claude-sonnet-4-20250514';

    // Separate system from conversation messages
    const systemMsg = messages.find((m) => m.role === 'system');
    const conversationMsgs = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: (m.role === 'tool' ? 'user' : m.role) as 'user' | 'assistant',
        content: m.toolCallId
          ? [{ type: 'tool_result' as const, tool_use_id: m.toolCallId, content: m.content }]
          : m.content,
      }));

    const toolDefs = tools?.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters as Anthropic.Tool.InputSchema,
    }));

    const response = await this.client.messages.create({
      model,
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.3,
      system: systemMsg?.content || '',
      messages: conversationMsgs,
      tools: toolDefs?.length ? toolDefs : undefined,
    });

    let content = '';
    const toolCalls: ToolCall[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        content += block.text;
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          name: block.name,
          arguments: block.input as Record<string, unknown>,
        });
      }
    }

    return {
      content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      provider: 'anthropic',
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      finishReason: response.stop_reason || 'end_turn',
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Simple health check
      await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }],
      });
      return true;
    } catch {
      return false;
    }
  }
}
