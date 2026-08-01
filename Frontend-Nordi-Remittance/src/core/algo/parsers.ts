// ============================================================================
// DATA PARSERS — Reusable parsers for safe data extraction
// ============================================================================

/**
 * Safely extracts an array from various API response structures.
 * 
 * Handles cases where the backend might return:
 * - A direct array: [...]
 * - An object with a 'data' array: { data: [...] }
 * - An object with a domain-specific key: { cards: [...] }
 * - Nested structures: { data: { cards: [...] } }
 * 
 * @param raw The raw API response
 * @param preferredKey An optional key to look for first (e.g., 'cards', 'loans')
 * @returns An array of type T, or an empty array if none found
 */
export function extractArray<T = any>(raw: unknown, preferredKey?: string): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as T[];

  if (typeof raw === 'object' && raw !== null) {
    const rawObj = raw as Record<string, unknown>;

    // 1. Check preferred key directly
    if (preferredKey && preferredKey in rawObj) {
      const val = rawObj[preferredKey];
      if (Array.isArray(val)) return val as T[];
    }

    // 2. Check common keys
    const commonKeys = [
      'data', 'items', 'results', 'transactions', 'cards', 'loans', 
      'portfolios', 'assets', 'goals', 'savingsGoals', 'notifications', 
      'insights', 'recommendations', 'categories', 'wallets'
    ];
    
    for (const key of commonKeys) {
      if (key in rawObj) {
        const val = rawObj[key];
        
        // Direct array match
        if (Array.isArray(val)) return val as T[];
        
        // Nested structure match (e.g., raw.data.cards)
        if (val && typeof val === 'object' && !Array.isArray(val)) {
             const nestedObj = val as Record<string, unknown>;
             // Check preferred key inside nested object
             if (preferredKey && preferredKey in nestedObj && Array.isArray(nestedObj[preferredKey])) {
                 return nestedObj[preferredKey] as T[];
             }
             // Check common keys inside nested object
             for (const nestedKey of commonKeys) {
                 if (nestedKey in nestedObj && Array.isArray(nestedObj[nestedKey])) {
                     return nestedObj[nestedKey] as T[];
                 }
             }
        }
      }
    }

    // 3. Fallback: Search the top-level keys for any array
    for (const key of Object.keys(rawObj)) {
      if (Array.isArray(rawObj[key])) {
        return rawObj[key] as T[];
      }
    }
  }

  return [];
}

/**
 * Safely extracts an object from various API response structures.
 * 
 * @param raw The raw API response
 * @param preferredKey An optional key to look for first
 * @returns An object of type T
 */
export function extractObject<T = any>(raw: unknown, preferredKey?: string): T | Partial<T> {
  if (!raw) return {} as Partial<T>;
  if (typeof raw !== 'object' || Array.isArray(raw)) return {} as Partial<T>;
  
  const rawObj = raw as Record<string, unknown>;
  
  if (preferredKey && preferredKey in rawObj && typeof rawObj[preferredKey] === 'object' && !Array.isArray(rawObj[preferredKey])) {
      return rawObj[preferredKey] as T;
  }

  if ('data' in rawObj && typeof rawObj['data'] === 'object' && !Array.isArray(rawObj['data'])) {
      return rawObj['data'] as T;
  }

  return rawObj as T;
}
