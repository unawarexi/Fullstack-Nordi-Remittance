// ============================================================================
// LLM PROVIDER — Google Gemini (Gemini 2.5 Pro)
// ============================================================================
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AgentMessage, LLMResponse, AgentToolDefinition, ToolCall } from '../types.js';

export class GeminiProvider {
  private client: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_KEY;
    if (!apiKey) throw new Error('GOOGLE_AI_KEY is not set');
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async chat(
    messages: AgentMessage[],
    tools?: AgentToolDefinition[],
    options?: { temperature?: number; maxTokens?: number; model?: string },
  ): Promise<LLMResponse> {
    const modelName = options?.model || 'gemini-2.5-pro-preview-05-06';
    const model = this.client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: options?.temperature ?? 0.3,
        maxOutputTokens: options?.maxTokens ?? 4096,
      },
      tools: tools?.length
        ? [{
            functionDeclarations: tools.map((t) => ({
              name: t.name,
              description: t.description,
              parameters: t.parameters,
            })) as any[],
          }]
        : undefined,
    });

    // Convert messages to Gemini format
    const systemMsg = messages.find((m) => m.role === 'system');
    const history = messages
      .filter((m) => m.role !== 'system')
      .slice(0, -1) // all except last
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const lastMsg = messages.filter((m) => m.role !== 'system').slice(-1)[0];

    const chat = model.startChat({
      history: history as any,
      systemInstruction: systemMsg ? { role: 'user', parts: [{ text: systemMsg.content }] } : undefined,
    });

    const result = await chat.sendMessage(lastMsg?.content || '');
    const response = result.response;
    const text = response.text();

    const toolCalls: ToolCall[] = [];
    const candidates = response.candidates || [];
    for (const candidate of candidates) {
      for (const part of candidate.content?.parts || []) {
        if ('functionCall' in part && part.functionCall) {
          toolCalls.push({
            id: `gemini_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name: part.functionCall.name,
            arguments: (part.functionCall.args || {}) as Record<string, unknown>,
          });
        }
      }
    }

    return {
      content: text,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      provider: 'gemini',
      usage: response.usageMetadata
        ? {
            promptTokens: response.usageMetadata.promptTokenCount || 0,
            completionTokens: response.usageMetadata.candidatesTokenCount || 0,
            totalTokens: response.usageMetadata.totalTokenCount || 0,
          }
        : undefined,
      finishReason: candidates[0]?.finishReason || 'STOP',
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-2.5-pro-preview-05-06' });
      await model.generateContent('ping');
      return true;
    } catch {
      return false;
    }
  }
}
