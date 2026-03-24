// ============================================================================
// LLM PROVIDER MANAGER — Failover chain with health checks
// ============================================================================
import type { AgentMessage, LLMProvider, LLMResponse, AgentToolDefinition } from '../types.js';
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { GeminiProvider } from './gemini.js';
import { HuggingFaceProvider } from './huggingface.js';
import logger from '../../logs/logger.js';

interface ProviderInstance {
  chat(
    messages: AgentMessage[],
    tools?: AgentToolDefinition[],
    options?: { temperature?: number; maxTokens?: number; model?: string },
  ): Promise<LLMResponse>;
  isAvailable(): Promise<boolean>;
}

export class LLMProviderManager {
  private providers = new Map<LLMProvider, ProviderInstance>();
  private failoverChain: LLMProvider[];
  private healthCache = new Map<LLMProvider, { healthy: boolean; checkedAt: number }>();
  private static readonly HEALTH_TTL_MS = 60_000; // re-check every 60s

  constructor(fallbackChain: LLMProvider[] = ['openai', 'anthropic', 'gemini', 'huggingface']) {
    this.failoverChain = fallbackChain;
    this.initProviders();
  }

  private initProviders(): void {
    const tryInit = (name: LLMProvider, factory: () => ProviderInstance) => {
      try {
        this.providers.set(name, factory());
      } catch (err: any) {
        logger.warn(`[AI] ${name} provider not configured: ${err.message}`);
      }
    };

    tryInit('openai', () => new OpenAIProvider());
    tryInit('anthropic', () => new AnthropicProvider());
    tryInit('gemini', () => new GeminiProvider());
    tryInit('huggingface', () => new HuggingFaceProvider());
  }

  /**
   * Send a chat request with automatic failover through the provider chain.
   */
  async chat(
    messages: AgentMessage[],
    tools?: AgentToolDefinition[],
    options?: { temperature?: number; maxTokens?: number; preferredProvider?: LLMProvider },
  ): Promise<LLMResponse> {
    // Build ordered provider list — preferred first, then failover chain
    const order = options?.preferredProvider
      ? [options.preferredProvider, ...this.failoverChain.filter((p) => p !== options.preferredProvider)]
      : [...this.failoverChain];

    const errors: Array<{ provider: LLMProvider; error: string }> = [];

    for (const providerName of order) {
      const provider = this.providers.get(providerName);
      if (!provider) continue;

      // Health check cache
      const cached = this.healthCache.get(providerName);
      if (cached && !cached.healthy && Date.now() - cached.checkedAt < LLMProviderManager.HEALTH_TTL_MS) {
        continue; // skip known-unhealthy provider
      }

      try {
        const response = await provider.chat(messages, tools, {
          temperature: options?.temperature,
          maxTokens: options?.maxTokens,
        });
        this.healthCache.set(providerName, { healthy: true, checkedAt: Date.now() });
        logger.info(`[AI] Response from ${providerName} (${response.usage?.totalTokens || '?'} tokens)`);
        return response;
      } catch (err: any) {
        logger.warn(`[AI] ${providerName} failed: ${err.message}`);
        this.healthCache.set(providerName, { healthy: false, checkedAt: Date.now() });
        errors.push({ provider: providerName, error: err.message });
      }
    }

    throw new Error(
      `All LLM providers failed: ${errors.map((e) => `${e.provider}: ${e.error}`).join('; ')}`,
    );
  }

  /**
   * Get the health status of all configured providers.
   */
  async healthCheck(): Promise<Record<LLMProvider, boolean>> {
    const results: Record<string, boolean> = {};
    for (const [name, provider] of this.providers) {
      try {
        results[name] = await provider.isAvailable();
      } catch {
        results[name] = false;
      }
    }
    return results as Record<LLMProvider, boolean>;
  }

  getConfiguredProviders(): LLMProvider[] {
    return [...this.providers.keys()];
  }
}
