// ============================================================================
// AGENT MEMORY — Short-term (Redis) + Long-term (MongoDB) memory
// ============================================================================
import RedisService from '../../services/redis.service.js';
import mongoose from 'mongoose';
import type { AgentMessage } from '../types.js';

// ============================================================================
// CONVERSATION MEMORY SCHEMA (MongoDB — long-term)
// ============================================================================

const ConversationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, unique: true },
  messages: [{
    role: { type: String, enum: ['system', 'user', 'assistant', 'tool'] },
    content: String,
    timestamp: { type: Date, default: Date.now },
  }],
  summary: String,
  context: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

ConversationSchema.index({ userId: 1, createdAt: -1 });

const Conversations = mongoose.model('AgentConversations', ConversationSchema);

// ============================================================================
// MEMORY SERVICE
// ============================================================================

const REDIS_PREFIX = 'agent:memory:';
const SESSION_TTL = 3600; // 1 hour for short-term memory

export class AgentMemory {
  /**
   * Store a message in short-term (Redis) memory.
   */
  static async addMessage(sessionId: string, message: AgentMessage): Promise<void> {
    const key = `${REDIS_PREFIX}${sessionId}`;
    const existing = await RedisService.cacheGet<AgentMessage[]>(key);
    const messages: AgentMessage[] = existing ?? [];
    messages.push(message);

    // Keep last 50 messages in short-term memory
    const trimmed = messages.slice(-50);
    await RedisService.cacheSet(key, trimmed, SESSION_TTL);
  }

  /**
   * Get conversation history from short-term memory.
   */
  static async getMessages(sessionId: string): Promise<AgentMessage[]> {
    const key = `${REDIS_PREFIX}${sessionId}`;
    const data = await RedisService.cacheGet<AgentMessage[]>(key);
    return data ?? [];
  }

  /**
   * Persist the full conversation to long-term storage (MongoDB).
   */
  static async persistConversation(
    userId: string,
    sessionId: string,
    messages: AgentMessage[],
    summary?: string,
    context?: Record<string, unknown>,
  ): Promise<void> {
    await Conversations.findOneAndUpdate(
      { sessionId },
      {
        userId,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: new Date(),
        })),
        summary,
        context,
        updatedAt: new Date(),
      },
      { upsert: true },
    );
  }

  /**
   * Load past conversation summaries for context (RAG-lite).
   */
  static async getRecentConversations(
    userId: string,
    limit = 5,
  ): Promise<Array<{ sessionId: string; summary: string; createdAt: Date }>> {
    const convos = await Conversations.find(
      { userId, summary: { $exists: true, $ne: '' } },
    )
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('sessionId summary createdAt')
      .lean();

    return convos.map((c: any) => ({
      sessionId: c.sessionId,
      summary: c.summary || '',
      createdAt: c.createdAt,
    }));
  }

  /**
   * Generate a conversation summary using the provided summarizer function.
   */
  static async summarizeAndPersist(
    userId: string,
    sessionId: string,
    messages: AgentMessage[],
    summarize: (msgs: AgentMessage[]) => Promise<string>,
  ): Promise<void> {
    const summary = await summarize(messages);
    await AgentMemory.persistConversation(userId, sessionId, messages, summary);
  }

  /**
   * Clear short-term memory for a session.
   */
  static async clearSession(sessionId: string): Promise<void> {
    const key = `${REDIS_PREFIX}${sessionId}`;
    await RedisService.cacheDelete(key);
  }
}
