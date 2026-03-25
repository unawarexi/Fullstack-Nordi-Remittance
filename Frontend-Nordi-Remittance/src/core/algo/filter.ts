// ============================================================================
// FILTER ALGORITHMS — Composable filter pipelines for admin tables
// ============================================================================

type Predicate<T> = (item: T) => boolean;

/**
 * Compose multiple predicates into a single AND filter.
 * All predicates must return true for the item to pass.
 */
export function composeFilters<T>(...predicates: Predicate<T>[]): Predicate<T> {
  return (item) => predicates.every((p) => p(item));
}

/**
 * Compose multiple predicates into a single OR filter.
 * At least one predicate must return true.
 */
export function composeAnyFilter<T>(...predicates: Predicate<T>[]): Predicate<T> {
  return (item) => predicates.some((p) => p(item));
}

/**
 * Create a date range filter.
 * Inclusive on both ends. Handles string and Date inputs.
 */
export function dateRangeFilter<T>(
  getter: (item: T) => string | Date | null | undefined,
  from?: Date | string,
  to?: Date | string,
): Predicate<T> {
  const start = from ? new Date(from).getTime() : -Infinity;
  const end = to ? new Date(to).getTime() : Infinity;

  return (item) => {
    const raw = getter(item);
    if (!raw) return false;
    const t = new Date(raw).getTime();
    return t >= start && t <= end;
  };
}

/**
 * Create a numeric range filter.
 * Useful for filtering transactions by amount range.
 */
export function numericRangeFilter<T>(
  getter: (item: T) => number | null | undefined,
  min?: number,
  max?: number,
): Predicate<T> {
  return (item) => {
    const val = getter(item);
    if (val == null) return false;
    if (min !== undefined && val < min) return false;
    if (max !== undefined && val > max) return false;
    return true;
  };
}

/**
 * Create an enum/set membership filter.
 * e.g. filter users whose status is in ["active", "suspended"].
 */
export function enumFilter<T>(
  getter: (item: T) => string,
  allowedValues: string[],
): Predicate<T> {
  const set = new Set(allowedValues.map((v) => v.toLowerCase()));
  return (item) => set.has(getter(item).toLowerCase());
}

/**
 * Create a text search filter that checks multiple fields.
 */
export function textSearchFilter<T>(
  query: string,
  getters: ((item: T) => string)[],
): Predicate<T> {
  const q = query.toLowerCase().trim();
  if (!q) return () => true;

  const terms = q.split(/\s+/);
  return (item) =>
    terms.every((term) =>
      getters.some((getter) => getter(item).toLowerCase().includes(term)),
    );
}

/**
 * Apply a full filter pipeline: text search + enum filters + range filters.
 * Returns filtered array without mutating the original.
 */
export function applyFilterPipeline<T>(
  items: T[],
  predicates: Predicate<T>[],
): T[] {
  if (predicates.length === 0) return items;
  const combined = composeFilters(...predicates);
  return items.filter(combined);
}
