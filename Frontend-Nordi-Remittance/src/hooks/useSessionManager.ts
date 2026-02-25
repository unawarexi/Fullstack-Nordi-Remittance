// ============================================================================
// useSessionManager — React hook to wire SessionManager into component tree
// ============================================================================
//
// Usage: Call once in the authenticated layout (UserMainLayout / AdminMainLayout)
//
// This hook:
// 1. Starts SessionManager on mount, stops on unmount
// 2. Subscribes to session events and drives the SessionExpiredModal
// 3. Handles "Stay signed in" and redirect actions
// 4. Listens for WS force-logout events (account_locked, session_revoked)
// ============================================================================

import { useEffect, useState, useCallback, useRef } from "react";
import { sessionManager } from "../core/auth/session.manager";
import type { SessionEvent, SessionExpiredReason } from "../core/auth/session.manager";
import { useSocketEvent } from "./useSocket";
import { WS } from "../core/events/ws-events";

// ============================================================================
// TYPES
// ============================================================================

export interface SessionModalState {
  isOpen: boolean;
  mode: "warning" | "expired";
  reason: SessionExpiredReason;
  countdown: number;
  redirectTo: string;
}

// ============================================================================
// HOOK
// ============================================================================

export function useSessionManager(role: "admin" | "user") {
  const [modalState, setModalState] = useState<SessionModalState>({
    isOpen: false,
    mode: "warning",
    reason: "inactivity",
    countdown: 60,
    redirectTo: role === "admin" ? "/admin" : "/auth/login",
  });

  const redirectToRef = useRef(role === "admin" ? "/admin" : "/auth/login");

  // ── Start / Stop SessionManager ────────────────────────────────────────

  useEffect(() => {
    sessionManager.start(role);

    const unsubscribe = sessionManager.subscribe((event: SessionEvent) => {
      switch (event.type) {
        case "session_warning":
          setModalState({
            isOpen: true,
            mode: "warning",
            reason: event.reason || "inactivity",
            countdown: event.countdown || 60,
            redirectTo: event.redirectTo || redirectToRef.current,
          });
          break;

        case "session_expired":
          if (event.redirectTo) {
            redirectToRef.current = event.redirectTo;
          }
          setModalState({
            isOpen: true,
            mode: "expired",
            reason: event.reason || "token_expired",
            countdown: 0,
            redirectTo: event.redirectTo || redirectToRef.current,
          });
          break;

        case "session_extended":
          setModalState((prev) => ({ ...prev, isOpen: false }));
          break;

        case "force_logout":
          // Immediate — no modal, just redirect
          window.location.href = event.redirectTo || redirectToRef.current;
          break;
      }
    });

    return () => {
      unsubscribe();
      sessionManager.stop();
    };
  }, [role]);

  // ── WebSocket-driven force logout events ───────────────────────────────

  // Server revoked all sessions
  useSocketEvent(WS.SECURITY.ALL_SESSIONS_REVOKED, () => {
    sessionManager.forceLogout("session_revoked");
  });

  // Account locked by admin
  useSocketEvent(WS.AUTH.ACCOUNT_LOCKED, () => {
    sessionManager.forceLogout("account_locked");
  });

  // Auth logout pushed from server (e.g. password changed on another device)
  useSocketEvent(WS.AUTH.PASSWORD_CHANGED, () => {
    sessionManager.forceLogout("session_revoked");
  });

  // ── Actions for the Modal ──────────────────────────────────────────────

  const handleExtendSession = useCallback(() => {
    sessionManager.extendSession();
  }, []);

  const handleRedirect = useCallback(() => {
    // cleanupAppState already called by forceLogout, just redirect
    window.location.href = redirectToRef.current;
  }, []);

  return {
    modalState,
    handleExtendSession,
    handleRedirect,
  };
}

export default useSessionManager;
