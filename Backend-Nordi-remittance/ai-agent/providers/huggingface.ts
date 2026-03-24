// ============================================================================
// LLM PROVIDER — HuggingFace Inference (Fallback)
// ============================================================================
import { HfInference } from '@huggingface/inference';
import type { AgentMessage, LLMResponse, AgentToolDefinition } from '../types.js';

export class HuggingFaceProvider {
  private client: HfInference;

  constructor() {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) throw new Error('HUGGINGFACE_API_KEY is not set');
    this.client = new HfInference(apiKey);
  }

  async chat(
    messages: AgentMessage[],
    _tools?: AgentToolDefinition[],
    options?: { temperature?: number; maxTokens?: number; model?: string },
  ): Promise<LLMResponse> {
    const model = options?.model || 'mistralai/Mixtral-8x7B-Instruct-v0.1';

    const response = await this.client.chatCompletion({
      model,
      messages: messages.map((m) => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      })),
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 4096,
    });

    const choice = response.choices[0];

    return {
      content: choice.message.content || '',
      // HuggingFace doesn't natively support tool calling for most models
      toolCalls: undefined,
      provider: 'huggingface',
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
      await this.client.chatCompletion({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
      });
      return true;
    } catch {
      return false;
    }
  }
}
