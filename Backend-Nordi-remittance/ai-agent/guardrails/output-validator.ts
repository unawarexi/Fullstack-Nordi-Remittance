// ============================================================================
// OUTPUT VALIDATOR — Post-LLM output sanitization
// ============================================================================
import type { AgentState } from '../types.js';

export class OutputValidator {
  // PII patterns that should never appear in agent responses
  private static readonly PII_OUTPUT_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
    { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: '****-****-****-XXXX' },
    { pattern: /\b\d{3}[\s-]?\d{2}[\s-]?\d{4}\b/g, replacement: '***-**-XXXX' },
    // Partial card numbers should also be redacted
    { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: '****-****-****' },
  ];

  detectPIILeakage(output: string): { found: boolean; redacted: string } {
    let redacted = output;
    let found = false;

    for (const { pattern, replacement } of OutputValidator.PII_OUTPUT_PATTERNS) {
      if (pattern.test(output)) {
        found = true;
        redacted = redacted.replace(pattern, replacement);
      }
    }

    return { found, redacted };
  }

  /**
   * Detect likely hallucinations — made-up IDs, account numbers, or amounts
   * that don't match anything in the current agent state context.
   */
  detectHallucination(output: string, state: AgentState): { detected: boolean; indicators: string[] } {
    const indicators: string[] = [];

    // Check for fabricated transaction reference numbers
    const refPattern = /\b(TXN|REF|TX)-[A-Z0-9]{6,}\b/g;
    const refs = output.match(refPattern) || [];
    const knownRefs = new Set(
      state.toolResults
        .filter((tr) => tr.result && typeof tr.result === 'object')
        .flatMap((tr) => {
          const r = tr.result as any;
          return [r.referenceNumber, r.transactionId].filter(Boolean);
        }),
    );

    for (const ref of refs) {
      if (!knownRefs.has(ref)) {
        indicators.push(`Unverified reference: ${ref}`);
      }
    }

    // Check for specific dollar amounts not present in tool results
    const amountPattern = /\$[\d,]+\.?\d{0,2}/g;
    const mentionedAmounts = output.match(amountPattern) || [];
    if (mentionedAmounts.length > 0 && state.toolResults.length === 0) {
      indicators.push('Specific amounts mentioned without supporting data');
    }

    return { detected: indicators.length > 0, indicators };
  }

  /**
   * Check if the output contains financial advice that needs a disclaimer.
   */
  containsFinancialAdvice(output: string): boolean {
    const advicePatterns = [
      /you\s+should\s+(invest|buy|sell|trade)/i,
      /i\s+(recommend|suggest|advise)\s+(you\s+)?(invest|buy|sell)/i,
      /best\s+(investment|strategy|option)\s/i,
      /guaranteed\s+(return|profit|income)/i,
    ];
    return advicePatterns.some((p) => p.test(output));
  }
}
