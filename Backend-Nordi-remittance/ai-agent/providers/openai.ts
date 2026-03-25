// ============================================================================
// LLM PROVIDER — OpenAI (GPT-4o)
// ============================================================================
import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import type { AgentMessage, LLMResponse, AgentToolDefinition, ToolCall } from '../types.js';
import logger from '../../logs/logger.js';

export class OpenAIProvider {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
    this.client = new OpenAI({ apiKey });
  }

  async chat(
    messages: AgentMessage[],
    tools?: AgentToolDefinition[],
    options?: { temperature?: number; maxTokens?: number; model?: string },
  ): Promise<LLMResponse> {
    const model = options?.model || 'gpt-4o';
    const openAiMessages: ChatCompletionMessageParam[] = messages.map((m) => {
      if (m.role === 'tool') {
        return { role: 'tool' as const, content: m.content, tool_call_id: m.toolCallId || '' };
      }
      if (m.role === 'assistant') {
        return { role: 'assistant' as const, content: m.content };
      }
      if (m.role === 'system') {
        return { role: 'system' as const, content: m.content };
      }
      return { role: 'user' as const, content: m.content };
    });

    const toolDefs: ChatCompletionTool[] | undefined = tools?.map((t) => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters as Record<string, unknown>,
      },
    }));

    const response = await this.client.chat.completions.create({
      model,
      messages: openAiMessages,
      tools: toolDefs?.length ? toolDefs : undefined,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 4096,
    });

    const choice = response.choices[0];
    const toolCalls: ToolCall[] = (choice.message.tool_calls || []).filter((tc) => tc.type === 'function').map((tc) => ({
      id: tc.id,
      name: tc.function!.name,
      arguments: JSON.parse(tc.function!.arguments),
    }));

    return {
      content: choice.message.content || '',
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      provider: 'openai',
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
      finishReason: choice.finish_reason || 'stop',
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}
