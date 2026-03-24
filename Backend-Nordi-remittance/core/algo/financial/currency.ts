// ============================================================================
// CURRENCY UTILITIES — Formatting, Conversion, Rounding
// ============================================================================

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'NGN' | 'KES' | 'ZAR' | 'INR' | 'AUD' | 'CAD';

const MINOR_UNITS: Record<CurrencyCode, number> = {
  USD: 2, EUR: 2, GBP: 2, NGN: 2, KES: 2, ZAR: 2, INR: 2, AUD: 2, CAD: 2,
};

const SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$', EUR: '€', GBP: '£', NGN: '₦', KES: 'KSh', ZAR: 'R', INR: '₹', AUD: 'A$', CAD: 'C$',
};

/** Convert a major-unit amount to the smallest unit for storage (e.g. dollars → cents). */
export function toMinorUnits(amount: number, currency: CurrencyCode): number {
  const factor = Math.pow(10, MINOR_UNITS[currency]);
  return Math.round(amount * factor);
}

/** Convert minor units back to a major-unit amount. */
export function toMajorUnits(minorAmount: number, currency: CurrencyCode): number {
  const factor = Math.pow(10, MINOR_UNITS[currency]);
  return minorAmount / factor;
}

/** Banker's rounding (round half to even) to avoid cumulative bias. */
export function bankersRound(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  const shifted = value * factor;
  const rounded = Math.round(shifted);
  // If exactly half, round to even
  if (Math.abs(shifted - rounded) === 0.5) {
    return (rounded % 2 === 0 ? rounded : rounded - 1) / factor;
  }
  return rounded / factor;
}

/** Format for display: "$1,234.56" */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const symbol = SYMBOLS[currency];
  const decimals = MINOR_UNITS[currency];
  const formatted = amount
    .toFixed(decimals)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${symbol}${formatted}`;
}

/** Simple FX conversion (multiply by rate). */
export function convertCurrency(
  amount: number,
  rate: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
): { converted: number; display: string } {
  const converted = bankersRound(amount * rate, MINOR_UNITS[toCurrency]);
  return { converted, display: formatCurrency(converted, toCurrency) };
}

/** Cross-rate calculation: FROM→BASE→TO. */
export function crossRate(
  fromToBase: number,
  toToBase: number,
): number {
  if (toToBase === 0) throw new Error('Division by zero in cross-rate');
  return fromToBase / toToBase;
}
