// ============================================================================
// useEligibilityError — Hook to manage user eligibility error modal state
// ============================================================================

import { useState, useCallback } from "react";
import {
  parseEligibilityError,
  type EligibilityErrorDetails,
} from "@components/shared/UserEligibilityModal";

/**
 * Hook that manages the state for UserEligibilityModal.
 *
 * Usage:
 * ```ts
 * const eligibility = useEligibilityError();
 *
 * // In mutation onError:
 * onError: (err) => {
 *   if (!eligibility.handleError(err)) {
 *     toast.error(err.message); // Not an eligibility error — handle normally
 *   }
 * }
 *
 * // In JSX:
 * <UserEligibilityModal
 *   isOpen={eligibility.isOpen}
 *   onClose={eligibility.close}
 *   error={eligibility.error}
 *   onResolved={() => refetch()}
 * />
 * ```
 */
export function useEligibilityError() {
  const [error, setError] = useState<EligibilityErrorDetails | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Try to parse an API error as an eligibility error.
   * If it is one, opens the modal and returns `true`.
   * If not, returns `false` so the caller can handle it in the normal flow.
   */
  const handleError = useCallback((err: unknown): boolean => {
    const parsed = parseEligibilityError(err);
    if (parsed) {
      setError(parsed);
      setIsOpen(true);
      return true;
    }
    return false;
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  return { error, isOpen, handleError, close };
}
