// ============================================================================
// FINANCIAL VALIDATION — IBAN, SWIFT/BIC, Luhn, Routing Numbers
// ============================================================================

// ------------- Luhn (MOD-10) Algorithm ---------------
/** Validate credit/debit card numbers. */
export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

// ------------- IBAN Validation ---------------
const IBAN_LENGTHS: Record<string, number> = {
  AL: 28, AD: 24, AT: 20, AZ: 28, BH: 22, BY: 28, BE: 16, BA: 20, BR: 29,
  BG: 22, CR: 22, HR: 21, CY: 28, CZ: 24, DK: 18, DO: 28, TL: 23, EE: 20,
  FO: 18, FI: 18, FR: 27, GE: 22, DE: 22, GI: 23, GR: 27, GL: 18, GT: 28,
  HU: 28, IS: 26, IQ: 23, IE: 22, IL: 23, IT: 27, JO: 30, KZ: 20, XK: 20,
  KW: 30, LV: 21, LB: 28, LI: 21, LT: 20, LU: 20, MK: 19, MT: 31, MR: 27,
  MU: 30, MC: 27, MD: 24, ME: 22, NL: 18, NO: 15, PK: 24, PS: 29, PL: 28,
  PT: 25, QA: 29, RO: 24, SM: 27, SA: 24, RS: 22, SK: 24, SI: 19, ES: 24,
  SE: 24, CH: 21, TN: 24, TR: 26, UA: 29, AE: 23, GB: 22, VG: 24, SC: 31,
};

export function validateIBAN(iban: string): { valid: boolean; country?: string; error?: string } {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)) {
    return { valid: false, error: 'Invalid IBAN format' };
  }
  const country = cleaned.slice(0, 2);
  const expectedLen = IBAN_LENGTHS[country];
  if (!expectedLen) return { valid: false, error: `Unsupported country code: ${country}` };
  if (cleaned.length !== expectedLen) {
    return { valid: false, error: `Expected ${expectedLen} chars for ${country}, got ${cleaned.length}` };
  }
  // MOD-97 check (ISO 7064)
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));
  if (mod97(numeric) !== 1) return { valid: false, error: 'IBAN checksum failed' };
  return { valid: true, country };
}

function mod97(numStr: string): number {
  let remainder = 0;
  for (let i = 0; i < numStr.length; i++) {
    remainder = (remainder * 10 + parseInt(numStr[i], 10)) % 97;
  }
  return remainder;
}

// ------------- SWIFT / BIC Code ---------------
const SWIFT_RE = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

export function validateSWIFT(code: string): { valid: boolean; bank?: string; country?: string; error?: string } {
  const cleaned = code.replace(/\s/g, '').toUpperCase();
  if (!SWIFT_RE.test(cleaned)) return { valid: false, error: 'Invalid SWIFT/BIC format' };
  return {
    valid: true,
    bank: cleaned.slice(0, 4),
    country: cleaned.slice(4, 6),
  };
}

// ------------- US Routing Number (ABA) ---------------
export function validateRoutingNumber(routing: string): boolean {
  if (!/^\d{9}$/.test(routing)) return false;
  const d = routing.split('').map(Number);
  const checksum = 3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5] + d[8]);
  return checksum % 10 === 0;
}

// ------------- Sort Code (UK) ---------------
export function validateSortCode(code: string): boolean {
  return /^\d{2}-?\d{2}-?\d{2}$/.test(code.replace(/\s/g, ''));
}
