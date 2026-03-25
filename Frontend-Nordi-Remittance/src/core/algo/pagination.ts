// ============================================================================
// PAGINATION UTILITIES — Client-side pagination helpers
// ============================================================================

export interface PaginationResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginate an in-memory array.
 * O(1) slicing via index calculation.
 */
export function paginate<T>(
  items: T[],
  page: number,
  limit: number,
): PaginationResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * limit;
  const end = Math.min(start + limit, total);

  return {
    items: items.slice(start, end),
    page: safePage,
    limit,
    total,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  };
}

/**
 * Generate visible page numbers for a pagination UI.
 * Returns an array like [1, 2, 3, '...', 8, 9, 10] with ellipsis markers.
 */
export function getPageNumbers(
  current: number,
  totalPages: number,
  maxVisible = 7,
): (number | "...")[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];
  const sideCount = Math.floor((maxVisible - 3) / 2); // pages on each side of current

  // Always show first page
  pages.push(1);

  const leftBound = Math.max(2, current - sideCount);
  const rightBound = Math.min(totalPages - 1, current + sideCount);

  if (leftBound > 2) pages.push("...");

  for (let i = leftBound; i <= rightBound; i++) {
    pages.push(i);
  }

  if (rightBound < totalPages - 1) pages.push("...");

  // Always show last page
  pages.push(totalPages);

  return pages;
}

/**
 * Cursor-based pagination state helper.
 * More efficient than offset pagination for large datasets.
 */
export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
}

export function cursorPaginate<T>(
  items: T[],
  getCursor: (item: T) => string,
  limit: number,
  afterCursor?: string,
): CursorPage<T> {
  let startIndex = 0;
  if (afterCursor) {
    const idx = items.findIndex((item) => getCursor(item) === afterCursor);
    if (idx >= 0) startIndex = idx + 1;
  }

  const slice = items.slice(startIndex, startIndex + limit + 1);
  const hasMore = slice.length > limit;
  const pageItems = hasMore ? slice.slice(0, limit) : slice;

  return {
    items: pageItems,
    nextCursor: pageItems.length > 0 ? getCursor(pageItems[pageItems.length - 1]) : null,
    prevCursor: startIndex > 0 ? getCursor(items[startIndex - 1]) : null,
    hasMore,
  };
}
