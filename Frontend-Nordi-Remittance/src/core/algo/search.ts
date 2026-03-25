// ============================================================================
// SEARCH ALGORITHMS — Optimized for banking data lookups
// ============================================================================

/**
 * Binary search on a sorted array. Returns index or -1.
 * O(log n) — ideal for sorted transaction IDs, account numbers, dates.
 */
export function binarySearch<T>(
  arr: T[],
  target: T,
  compareFn: (a: T, b: T) => number = (a, b) =>
    a < b ? -1 : a > b ? 1 : 0,
): number {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const cmp = compareFn(arr[mid], target);
    if (cmp === 0) return mid;
    if (cmp < 0) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

/**
 * Binary search returning the insertion index (lower bound).
 * Useful for date-range queries on sorted transactions.
 */
export function lowerBound<T>(
  arr: T[],
  target: T,
  compareFn: (a: T, b: T) => number = (a, b) =>
    a < b ? -1 : a > b ? 1 : 0,
): number {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (compareFn(arr[mid], target) < 0) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * Fuzzy text search using Levenshtein distance.
 * Good for user name / email autocomplete with typo tolerance.
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);

  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] =
        a[i - 1] === b[j - 1]
          ? prev
          : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[n];
}

/**
 * Fuzzy search across an array of items.
 * Returns items sorted by relevance (lowest distance first).
 */
export function fuzzySearch<T>(
  items: T[],
  query: string,
  getField: (item: T) => string,
  maxDistance = 3,
): T[] {
  const q = query.toLowerCase();
  return items
    .map((item) => ({
      item,
      distance: levenshteinDistance(getField(item).toLowerCase(), q),
    }))
    .filter((r) => r.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .map((r) => r.item);
}

/**
 * Multi-field text search with weighted scoring.
 * Fields with higher weight contribute more to the score.
 */
export function weightedSearch<T>(
  items: T[],
  query: string,
  fields: { getter: (item: T) => string; weight: number }[],
): { item: T; score: number }[] {
  const q = query.toLowerCase().trim();
  if (!q) return items.map((item) => ({ item, score: 0 }));

  const terms = q.split(/\s+/);

  return items
    .map((item) => {
      let score = 0;
      for (const { getter, weight } of fields) {
        const value = getter(item).toLowerCase();
        for (const term of terms) {
          if (value === term) score += weight * 3;
          else if (value.startsWith(term)) score += weight * 2;
          else if (value.includes(term)) score += weight;
        }
      }
      return { item, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}
