// ============================================================================
// SESSION MANAGER — Banking-grade session lifecycle management
// ============================================================================
//
// Responsibilities:
// 1. Force logout on 401 / token expiry → clean Zustand + cache + socket
// 2. Role-aware redirect (admin → /admin, user → /auth/login)
// 3. Inactivity timeout (configurable, default 10 min for banking)
// 4. Warning modal before timeout (60s countdown)
// 5. Multi-tab synchronisation via BroadcastChannel
// 6. Session event bus so React components can subscribe
// 7. Token-expiry-aware proactive refresh scheduling
// ============================================================================

import { queryClient } from "../lib/queryClient";

// ============================================================================
// TYPES
// ============================================================================

export type SessionExpiredReason =
  | "token_expired"       // 401 from server / refresh failed
  | "inactivity"          // User idle beyond threshold
  | "session_revoked"     // Admin or user revoked session
  | "account_locked"      // Account suspended / locked
  | "manual_logout"       // User clicked logout
  | "concurrent_session"; // Logged in elsewhere

export interface SessionEvent {
  type:
    | "session_warning"       // Inactivity warning (60s before timeout)
    | "session_expired"       // Session ended — show modal
    | "session_extended"      // User interacted → timeout reset
    | "force_logout";         // Immediate logout without modal
  reason?: SessionExpiredReason;
  /** Seconds remaining until auto-logout (for warning) */
  countdown?: number;
  /** Where the user will be redirected */
  redirectTo?: string;
}

type SessionEventListener = (event: SessionEvent) => void;

// ============================================================================
// CONSTANTS
// ============================================================================

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;    // 10 minutes (banking standard)
const WARNING_BEFORE_MS = 60 * 1000;              // Show warning 60s before logout
const ACTIVITY_THROTTLE_MS = 30 * 1000;           // Throttle activity tracking (30s)
const BROADCAST_CHANNEL_NAME = "nordi_session";
const SESSION_EXPIRED_KEY = "nordi_session_expired"; // localStorage flag for cross-tab

// User interaction events to track
const ACTIVITY_EVENTS = [
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "mousemove",
  "click",
] as const;

// ============================================================================
// SESSION MANAGER SINGLETON
// ============================================================================

class SessionManager {
  private listeners: Set<SessionEventListener> = new Set();
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  private warningTimer: ReturnType<typeof setTimeout> | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  private lastActivity: number = Date.now();
  private isWarningActive = false;
  private isMonitoring = false;
  private broadcastChannel: BroadcastChannel | null = null;
  private activityThrottleTimer: ReturnType<typeof setTimeout> | null = null;
  private currentUserRole: string | null = null;

  // ── Event Bus ──────────────────────────────────────────────────────────

  /** Subscribe to session events. Returns unsubscribe function. */
  subscribe(listener: SessionEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: SessionEvent): void {
    this.listeners.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.error("[SessionManager] Listener error:", err);
      }
    });
  }

  // ── Initialisation ─────────────────────────────────────────────────────

  /**
   * Start monitoring. Call once from the authenticated layout.
   * @param role - "admin" | "user" — determines redirect target
   */
  start(role: string): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.currentUserRole = role;
    this.lastActivity = Date.now();

    // Listen for user activity
    ACTIVITY_EVENTS.forEach((evt) => {
      window.addEventListener(evt, this.handleActivity, { passive: true });
    });

    // Start inactivity timers
    this.resetTimers();

    // Multi-tab sync
    this.initBroadcastChannel();

    // Cross-tab logout detection via storage event
    window.addEventListener("storage", this.handleStorageEvent);

    // Visibility change — when tab becomes visible, check if session expired
    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    console.info(`[SessionManager] Started — role: ${role}, timeout: ${INACTIVITY_TIMEOUT_MS / 1000}s`);
  }

  /** Stop monitoring. Call on unmount or manual logout. */
  stop(): void {
    if (!this.isMonitoring) return;
    this.isMonitoring = false;

    // Remove activity listeners
    ACTIVITY_EVENTS.forEach((evt) => {
      window.removeEventListener(evt, this.handleActivity);
    });

    // Clear all timers
    this.clearAllTimers();

    // Close broadcast channel
    this.broadcastChannel?.close();
    this.broadcastChannel = null;

    // Remove other listeners
    window.removeEventListener("storage", this.handleStorageEvent);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);

    this.currentUserRole = null;
    console.info("[SessionManager] Stopped");
  }

  // ── Core: Force Logout ─────────────────────────────────────────────────

  /**
   * Force logout and redirect. Called by:
   * - 401 interceptor after refresh failure
   * - Inactivity timeout
   * - WS session_revoked / account_locked events
   * - Multi-tab sync
   */
  forceLogout(reason: SessionExpiredReason = "token_expired"): void {
    // Prevent multiple simultaneous logouts
    if (!this.isMonitoring && reason !== "token_expired") return;

    this.stop();

    const redirectTo = this.getRedirectPath();

    // Signal other tabs via localStorage (BroadcastChannel might not work in all browsers)
    try {
      localStorage.setItem(
        SESSION_EXPIRED_KEY,
        JSON.stringify({ reason, timestamp: Date.now() }),
      );
    } catch {
      // localStorage might be full or blocked
    }

    // Broadcast to other tabs
    this.broadcastLogout(reason);

    // Emit session_expired event so the modal can show
    if (reason !== "manual_logout") {
      this.emit({
        type: "session_expired",
        reason,
        redirectTo,
      });
    }

    // Clean up application state
    this.cleanupAppState();

    // For manual logout, redirect immediately. For others, give modal time to show.
    if (reason === "manual_logout") {
      window.location.href = redirectTo;
    } else {
      // Let the SessionExpiredModal display for 3 seconds, then redirect
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 3500);
    }
  }

  // ── Inactivity Monitoring ──────────────────────────────────────────────

  private handleActivity = (): void => {
    // Throttle to avoid excessive timer resets
    if (this.activityThrottleTimer) return;

    this.activityThrottleTimer = setTimeout(() => {
      this.activityThrottleTimer = null;
    }, ACTIVITY_THROTTLE_MS);

    this.lastActivity = Date.now();

    // If warning was showing, dismiss it
    if (this.isWarningActive) {
      this.isWarningActive = false;
      this.clearCountdown();
      this.emit({ type: "session_extended" });
    }

    // Reset timers
    this.resetTimers();

    // Sync activity to other tabs
    this.broadcastActivity();
  };

  /** Extend session — called when user clicks "Stay signed in" on warning modal */
  extendSession(): void {
    this.lastActivity = Date.now();
    this.isWarningActive = false;
    this.clearCountdown();
    this.resetTimers();
    this.emit({ type: "session_extended" });
    this.broadcastActivity();
  }

  private resetTimers(): void {
    // Clear existing timers
    if (this.warningTimer) clearTimeout(this.warningTimer);
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    this.clearCountdown();

    // Set warning timer (fires 60s before logout)
    this.warningTimer = setTimeout(() => {
      this.showInactivityWarning();
    }, INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS);

    // Set hard timeout
    this.inactivityTimer = setTimeout(() => {
      this.forceLogout("inactivity");
    }, INACTIVITY_TIMEOUT_MS);
  }

  private showInactivityWarning(): void {
    this.isWarningActive = true;
    let remaining = Math.floor(WARNING_BEFORE_MS / 1000);

    this.emit({
      type: "session_warning",
      reason: "inactivity",
      countdown: remaining,
      redirectTo: this.getRedirectPath(),
    });

    // Emit countdown every second
    this.countdownInterval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        this.clearCountdown();
        return;
      }
      this.emit({
        type: "session_warning",
        reason: "inactivity",
        countdown: remaining,
      });
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  private clearAllTimers(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.activityThrottleTimer) {
      clearTimeout(this.activityThrottleTimer);
      this.activityThrottleTimer = null;
    }
    this.clearCountdown();
  }

  // ── Multi-Tab Sync ─────────────────────────────────────────────────────

  private initBroadcastChannel(): void {
    try {
      this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      this.broadcastChannel.onmessage = (event) => {
        const { type, reason } = event.data || {};
        if (type === "logout") {
          // Another tab logged out — follow suit
          this.stop();
          this.cleanupAppState();
          this.emit({
            type: "session_expired",
            reason: reason || "concurrent_session",
            redirectTo: this.getRedirectPath(),
          });
          setTimeout(() => {
            window.location.href = this.getRedirectPath();
          }, 2000);
        } else if (type === "activity") {
          // Another tab had activity — reset our timers
          this.lastActivity = Date.now();
          if (this.isWarningActive) {
            this.isWarningActive = false;
            this.clearCountdown();
            this.emit({ type: "session_extended" });
          }
          this.resetTimers();
        }
      };
    } catch {
      // BroadcastChannel not supported — fall back to storage events only
      console.warn("[SessionManager] BroadcastChannel not available");
    }
  }

  private broadcastLogout(reason: SessionExpiredReason): void {
    try {
      this.broadcastChannel?.postMessage({ type: "logout", reason });
    } catch {
      // Channel might be closed
    }
  }

  private broadcastActivity(): void {
    try {
      this.broadcastChannel?.postMessage({ type: "activity" });
    } catch {
      // Non-critical
    }
  }

  private handleStorageEvent = (e: StorageEvent): void => {
    if (e.key === SESSION_EXPIRED_KEY && e.newValue) {
      try {
        const { reason } = JSON.parse(e.newValue);
        this.stop();
        this.cleanupAppState();
        this.emit({
          type: "session_expired",
          reason: reason || "concurrent_session",
          redirectTo: this.getRedirectPath(),
        });
        setTimeout(() => {
          window.location.href = this.getRedirectPath();
        }, 2000);
      } catch {
        // Malformed data
      }
    }
  };

  // ── Visibility ─────────────────────────────────────────────────────────

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === "visible" && this.isMonitoring) {
      // Tab became visible — check if we've been idle too long while hidden
      const elapsed = Date.now() - this.lastActivity;
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        this.forceLogout("inactivity");
      } else if (elapsed >= INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS) {
        // We're in the warning zone
        this.showInactivityWarning();
      }
    }
  };

  // ── Cleanup ────────────────────────────────────────────────────────────

  private cleanupAppState(): void {
    try {
      // Clear React Query cache
      queryClient.clear();

      // Clear tokens from localStorage directly to avoid circular import
      localStorage.removeItem("remit_access_token");
      localStorage.removeItem("remit_refresh_token");

      // Clear persisted Zustand auth state
      localStorage.removeItem("remit-auth-storage");

      // Disconnect socket if available
      import("../socket/socket.client")
        .then(({ disconnectSocket }) => disconnectSocket())
        .catch(() => {});
    } catch (err) {
      console.error("[SessionManager] Cleanup error:", err);
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  private getRedirectPath(): string {
    if (this.currentUserRole === "admin") {
      return "/admin";
    }
    return "/auth/login";
  }

  /** Get the current monitoring state (for debugging) */
  getState() {
    return {
      isMonitoring: this.isMonitoring,
      isWarningActive: this.isWarningActive,
      lastActivity: this.lastActivity,
      currentRole: this.currentUserRole,
      idleMs: Date.now() - this.lastActivity,
    };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const sessionManager = new SessionManager();
export default sessionManager;
