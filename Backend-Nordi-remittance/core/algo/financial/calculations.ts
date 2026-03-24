// ============================================================================
// FINANCIAL CALCULATIONS — Interest, Loan Amortization, Fees, FX
// ============================================================================

/** Compound interest: A = P(1 + r/n)^(nt) */
export function compoundInterest(
  principal: number,
  annualRate: number,
  compoundsPerYear: number,
  years: number,
): number {
  return principal * Math.pow(1 + annualRate / compoundsPerYear, compoundsPerYear * years);
}

/** Monthly payment for a fixed-rate loan (amortization). */
export function loanPayment(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

/** Full amortization schedule. */
export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function amortizationSchedule(
  principal: number,
  annualRate: number,
  months: number,
): AmortizationRow[] {
  const pmt = loanPayment(principal, annualRate, months);
  const rows: AmortizationRow[] = [];
  let balance = principal;
  const r = annualRate / 12;
  for (let m = 1; m <= months; m++) {
    const interest = balance * r;
    const principalPart = pmt - interest;
    balance = Math.max(0, balance - principalPart);
    rows.push({
      month: m,
      payment: round2(pmt),
      principal: round2(principalPart),
      interest: round2(interest),
      balance: round2(balance),
    });
  }
  return rows;
}

/** Tiered fee calculation (e.g., progressive transfer fees). */
export interface FeeTier {
  upTo: number;       // upper bound of this tier (Infinity for last)
  flatFee: number;    // fixed fee component
  percentFee: number; // percentage of amount in this tier
}

export function tieredFee(amount: number, tiers: FeeTier[]): number {
  const sorted = [...tiers].sort((a, b) => a.upTo - b.upTo);
  let remaining = amount;
  let prev = 0;
  let totalFee = 0;
  for (const tier of sorted) {
    const slice = Math.min(remaining, tier.upTo - prev);
    if (slice <= 0) break;
    totalFee += tier.flatFee + slice * tier.percentFee;
    remaining -= slice;
    prev = tier.upTo;
  }
  return round2(totalFee);
}

/** Present value of a future cash flow. */
export function presentValue(futureValue: number, rate: number, periods: number): number {
  return futureValue / Math.pow(1 + rate, periods);
}

/** Internal rate of return (Newton-Raphson). */
export function irr(cashflows: number[], guess = 0.1, maxIter = 100, tolerance = 1e-7): number | null {
  let rate = guess;
  for (let i = 0; i < maxIter; i++) {
    let npv = 0, dnpv = 0;
    for (let t = 0; t < cashflows.length; t++) {
      const factor = Math.pow(1 + rate, t);
      npv += cashflows[t] / factor;
      dnpv -= t * cashflows[t] / (factor * (1 + rate));
    }
    if (Math.abs(npv) < tolerance) return rate;
    if (dnpv === 0) return null;
    rate -= npv / dnpv;
  }
  return null;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
