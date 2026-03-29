// ============================================================================
// SESSION EXPIRED MODAL — Banking-grade session expiry overlay
// ============================================================================
//
// Shows when session expires due to inactivity or token expiry.
// Two modes:
//   1. WARNING — "Your session is about to expire" with countdown + "Stay signed in"
//   2. EXPIRED — "Your session has expired" with redirect countdown
//
// Follows Chase / Revolut / Wise patterns:
//   - Full-screen backdrop blur overlay (blocks interaction)
//   - Lock icon + clear messaging
//   - Auto-redirect after brief delay
// ============================================================================

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SessionExpiredReason } from "@core/auth/session.manager";

// ============================================================================
// TYPES
// ============================================================================

interface SessionExpiredModalProps {
  /** Whether modal is visible */
  isOpen: boolean;
  /** "warning" = about to expire, "expired" = already expired */
  mode: "warning" | "expired";
  /** Reason for session end */
  reason?: SessionExpiredReason;
  /** Countdown seconds (for warning mode) */
  countdown?: number;
  /** Called when user clicks "Stay signed in" (warning mode) */
  onExtend?: () => void;
  /** Called when user clicks "Sign in again" or redirect fires */
  onRedirect?: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

const REASON_MESSAGES: Record<SessionExpiredReason, { title: string; message: string }> = {
  token_expired: {
    title: "Session Expired",
    message: "Your session has expired. Please sign in again to continue.",
  },
  inactivity: {
    title: "Session Timed Out",
    message: "You've been inactive for too long. For your security, you've been signed out.",
  },
  session_revoked: {
    title: "Session Revoked",
    message: "Your session was ended by an administrator. Please sign in again.",
  },
  account_locked: {
    title: "Account Locked",
    message: "Your account has been locked. Please contact support for assistance.",
  },
  manual_logout: {
    title: "Signed Out",
    message: "You have been signed out successfully.",
  },
  concurrent_session: {
    title: "Signed In Elsewhere",
    message: "Your account was signed in from another device. This session has ended.",
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  isOpen,
  mode,
  reason = "token_expired",
  countdown = 60,
  onExtend,
  onRedirect,
}) => {
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Auto-redirect countdown when session is expired
  useEffect(() => {
    if (mode !== "expired" || !isOpen) return;
    setRedirectCountdown(5);

    const interval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onRedirect?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, isOpen, onRedirect]);

  const handleExtend = useCallback(() => {
    onExtend?.();
  }, [onExtend]);

  const handleSignIn = useCallback(() => {
    onRedirect?.();
  }, [onRedirect]);

  const reasonInfo = REASON_MESSAGES[reason] || REASON_MESSAGES.token_expired;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-modal-title"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative mx-4 w-full max-w-md rounded-2xl bg-white dark:bg-neutral-800 p-8 shadow-2xl dark:bg-gray-900"
          >
            {/* Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20">
              {mode === "warning" ? (
                // Clock warning icon
                <svg
                  className="h-8 w-8 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                // Lock icon
                <svg
                  className="h-8 w-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              )}
            </div>

            {/* Title */}
            <h2
              id="session-modal-title"
              className="mb-2 text-center text-xl font-semibold text-gray-900 dark:text-white"
            >
              {mode === "warning" ? "Session About to Expire" : reasonInfo.title}
            </h2>

            {/* Message */}
            <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400 dark:text-neutral-500">
              {mode === "warning"
                ? "For your security, your session will expire due to inactivity."
                : reasonInfo.message}
            </p>

            {/* Countdown Display */}
            {mode === "warning" && (
              <div className="mb-6 flex flex-col items-center">
                <div className="relative h-20 w-20">
                  {/* Circular progress */}
                  <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-gray-200 dark:text-gray-700 dark:text-neutral-200"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - countdown / 60)}`}
                      strokeLinecap="round"
                      className="text-amber-500 transition-all duration-1000"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900 dark:text-white">
                    {countdown}
                  </span>
                </div>
                <span className="mt-2 text-xs text-gray-400 dark:text-neutral-500">seconds remaining</span>
              </div>
            )}

            {/* Expired redirect countdown */}
            {mode === "expired" && (
              <p className="mb-6 text-center text-xs text-gray-400 dark:text-neutral-500">
                Redirecting to sign in page in{" "}
                <span className="font-semibold text-gray-600 dark:text-gray-300">
                  {redirectCountdown}s
                </span>
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {mode === "warning" ? (
                <>
                  <button
                    onClick={handleExtend}
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white
                      shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-blue-600/30
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      active:scale-[0.98]"
                  >
                    Stay Signed In
                  </button>
                  <button
                    onClick={handleSignIn}
                    className="w-full rounded-xl px-4 py-3 text-sm font-medium text-gray-500 dark:text-neutral-400
                      transition-all hover:bg-gray-100 dark:bg-neutral-700 hover:text-gray-700 dark:text-neutral-200
                      focus:outline-none focus:ring-2 focus:ring-gray-300
                      dark:text-gray-400 dark:text-neutral-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  >
                    Sign Out Now
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white
                    shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-blue-600/30
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    active:scale-[0.98]"
                >
                  Sign In Again
                </button>
              )}
            </div>

            {/* Security footer */}
            <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-neutral-500">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Protected by Nordi Security</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SessionExpiredModal;
