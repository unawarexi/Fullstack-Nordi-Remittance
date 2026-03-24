// ============================================================================
// INPUT VALIDATOR — Pre-LLM input sanitization & detection
// ============================================================================

export class InputValidator {
  // Patterns that indicate prompt injection attempts
  private static readonly INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?previous\s+(instructions|prompts)/i,
    /you\s+are\s+now\s+(a|an|in)\s/i,
    /system\s*:\s*you/i,
    /\[INST\]/i,
    /<\|im_start\|>/i,
    /forget\s+(everything|all|your)\s/i,
    /override\s+(your|the)\s+(instructions|rules|guidelines)/i,
    /pretend\s+(to\s+be|you\s+are)/i,
    /act\s+as\s+(if|though)\s+you/i,
    /jailbreak/i,
    /DAN\s*mode/i,
    /developer\s+mode/i,
  ];

  // PII patterns
  private static readonly PII_PATTERNS: Array<{ pattern: RegExp; name: string; replacement: string }> = [
    { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, name: 'CARD_NUMBER', replacement: '****-****-****-XXXX' },
    { pattern: /\b\d{3}[\s-]?\d{2}[\s-]?\d{4}\b/g, name: 'SSN', replacement: '***-**-XXXX' },
    { pattern: /\b\d{9}\b/g, name: 'ROUTING_NUMBER', replacement: '*********' },
    { pattern: /\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/g, name: 'IBAN', replacement: 'XX**************XXXX' },
  ];

  // Banking-related topic keywords
  private static readonly BANKING_TOPICS = new Set([
    'account', 'balance', 'transfer', 'payment', 'transaction', 'wallet',
    'deposit', 'withdrawal', 'send money', 'receive', 'statement', 'history',
    'card', 'kyc', 'verification', 'limit', 'fee', 'exchange', 'rate',
    'currency', 'loan', 'investment', 'interest', 'compliance', 'fraud',
    'refund', 'reversal', 'beneficiary', 'recipient', 'bank', 'swift',
    'iban', 'routing', 'pending', 'status', 'help', 'support',
  ]);

  detectPromptInjection(input: string): { detected: boolean; pattern?: string } {
    for (const pattern of InputValidator.INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        return { detected: true, pattern: pattern.source };
      }
    }
    return { detected: false };
  }

  detectPII(input: string): { found: boolean; types: string[]; redacted: string } {
    let redacted = input;
    const types: string[] = [];

    for (const { pattern, name, replacement } of InputValidator.PII_PATTERNS) {
      if (pattern.test(input)) {
        types.push(name);
        redacted = redacted.replace(pattern, replacement);
      }
    }

    return { found: types.length > 0, types, redacted };
  }

  checkTopicBoundary(input: string): { onTopic: boolean } {
    const lower = input.toLowerCase();
    // Allow short messages (greetings, thanks, etc.)
    if (lower.length < 20) return { onTopic: true };

    for (const topic of InputValidator.BANKING_TOPICS) {
      if (lower.includes(topic)) return { onTopic: true };
    }

    // Allow questions (user might be asking about their account in natural language)
    if (lower.includes('?') || lower.startsWith('how') || lower.startsWith('what') || lower.startsWith('can')) {
      return { onTopic: true };
    }

    return { onTopic: false };
  }
}
