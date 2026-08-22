import { FilterQuery } from 'mongoose';

/**
 * Normalizes pagination parameters and calculates skip value.
 */
export function buildPagination(
  pageParam?: number | string,
  limitParam?: number | string,
  defaultLimit = 50,
  maxLimit = 200,
) {
  const page = Math.max(1, parseInt(pageParam as string) || 1);
  const limit = Math.min(parseInt(limitParam as string) || defaultLimit, maxLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Builds a text search query using RegExp for Mongoose.
 * Sanitizes input and generates regex patterns for specified fields.
 */
export function buildTextSearchQuery(
  searchTerm: string,
  fields: string[],
  mode: 'startsWith' | 'contains' = 'startsWith',
): FilterQuery<any> {
  const q = searchTerm.trim();
  if (!q) return {};

  const sanitized = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexPattern = mode === 'startsWith' ? `^${sanitized}` : sanitized;

  return {
    $or: fields.map((field) => ({
      [field]: new RegExp(regexPattern, 'i'),
    })),
  };
}

/**
 * Builds a date range query for Mongoose.
 */
export function buildDateRangeQuery(
  startDate?: string | Date,
  endDate?: string | Date,
): FilterQuery<any> {
  if (!startDate && !endDate) return {};

  const dateQuery: Record<string, any> = {};

  if (startDate) {
    dateQuery.$gte = new Date(startDate);
  }

  if (endDate) {
    dateQuery.$lte = new Date(endDate);
  }

  return dateQuery;
}
