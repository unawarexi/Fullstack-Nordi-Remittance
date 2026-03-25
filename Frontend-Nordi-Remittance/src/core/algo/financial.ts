// ============================================================================
// FINANCIAL ALGORITHMS — Banking-specific validation & calculations
// ============================================================================

/**
 * Luhn algorithm — validates credit/debit card numbers, IMEI, etc.
 * Returns true if the number passes the Luhn checksum.
 */
export function luhnValidate(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  if (digits.length < 2) return false;

  let sum = 0;
  let alternate = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }

  return sum % 10 === 0;
}

/**
 * Generate Luhn check digit for a partial card number.
 */
export function luhnCheckDigit(partial: string): number {
  const digits = partial.replace(/\D/g, "");
  let sum = 0;
  let alternate = true;

  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }

  return (10 - (sum % 10)) % 10;
}

/**
 * Validate IBAN format.
 * Checks length by country, moves first 4 chars to end, converts letters to digits,
 * and performs mod-97 check (ISO 13616).
 */
export function validateIBAN(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)) return false;

  const countryLengths: Record<string, number> = {
    AL: 28, AD: 24, AT: 20, AZ: 28, BH: 22, BY: 28, BE: 16, BA: 20,
    BR: 29, BG: 22, CR: 22, HR: 21, CY: 28, CZ: 24, DK: 18, DO: 28,
    EG: 29, SV: 28, EE: 20, FO: 18, FI: 18, FR: 27, GE: 22, DE: 22,
    GI: 23, GR: 27, GL: 18, GT: 28, HU: 28, IS: 26, IQ: 23, IE: 22,
    IL: 23, IT: 27, JO: 30, KZ: 20, XK: 20, KW: 30, LV: 21, LB: 28,
    LI: 21, LT: 20, LU: 20, MT: 31, MR: 27, MU: 30, MD: 24, MC: 27,
    ME: 22, NL: 18, MK: 19, NO: 15, PK: 24, PS: 29, PL: 28, PT: 25,
    QA: 29, RO: 24, LC: 32, SM: 27, SA: 24, RS: 22, SC: 31, SK: 24,
    SI: 19, ES: 24, SE: 24, CH: 21, TL: 23, TN: 24, TR: 26, UA: 29,
    AE: 23, GB: 22, VG: 24,
  };

  const country = cleaned.substring(0, 2);
  if (countryLengths[country] && cleaned.length !== countryLengths[country]) {
    return false;
  }

  // Move first 4 chars to end, convert letters to digits
  const rearranged = cleaned.substring(4) + cleaned.substring(0, 4);
  const numericStr = rearranged
    .split("")
    .map((ch) => {
      const code = ch.charCodeAt(0);
      return code >= 65 && code <= 90 ? (code - 55).toString() : ch;
    })
    .join("");

  // Mod 97 check using chunked arithmetic (avoids BigInt for compatibility)
  let remainder = 0;
  for (let i = 0; i < numericStr.length; i++) {
    remainder = (remainder * 10 + parseInt(numericStr[i], 10)) % 97;
  }

  return remainder === 1;
}

/**
 * Validate SWIFT/BIC code format.
 */
export function validateSWIFT(swift: string): boolean {
  return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swift.toUpperCase());
}

/**
 * Validate routing number (US ABA) using mod-10 checksum.
 */
export function validateRoutingNumber(routing: string): boolean {
  if (!/^\d{9}$/.test(routing)) return false;
  const d = routing.split("").map(Number);
  const checksum =
    3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5] + d[8]);
  return checksum % 10 === 0;
}

/**
 * Format currency with proper locale and symbol.
 */
export function formatCurrency(
  amount: number,
  currency = "EUR",
  locale = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate compound interest.
 * A = P(1 + r/n)^(nt)
 */
export function compoundInterest(
  principal: number,
  annualRate: number,
  compoundsPerYear: number,
  years: number,
): { total: number; interest: number } {
  const total =
    principal * Math.pow(1 + annualRate / compoundsPerYear, compoundsPerYear * years);
  return { total: Math.round(total * 100) / 100, interest: Math.round((total - principal) * 100) / 100 };
}

/**
 * Calculate simple loan payment (monthly).
 * M = P[r(1+r)^n] / [(1+r)^n - 1]
 */
export function monthlyLoanPayment(
  principal: number,
  annualRate: number,
  totalMonths: number,
): number {
  if (annualRate === 0) return principal / totalMonths;
  const r = annualRate / 12;
  const payment = (principal * r * Math.pow(1 + r, totalMonths)) / (Math.pow(1 + r, totalMonths) - 1);
  return Math.round(payment * 100) / 100;
}

/**
 * Currency conversion with spread/fee.
 */
export function convertCurrency(
  amount: number,
  rate: number,
  spreadPercent = 0,
): { converted: number; fee: number; effectiveRate: number } {
  const fee = amount * (spreadPercent / 100);
  const netAmount = amount - fee;
  const converted = Math.round(netAmount * rate * 100) / 100;
  const effectiveRate = converted / amount;
  return { converted, fee: Math.round(fee * 100) / 100, effectiveRate };
}

/**
 * Mask sensitive data (account number, card number, etc.).
 * Shows only the last N characters.
 */
export function maskSensitive(value: string, visibleChars = 4, maskChar = "•"): string {
  if (value.length <= visibleChars) return value;
  const masked = maskChar.repeat(value.length - visibleChars);
  return masked + value.slice(-visibleChars);
}
