// ============================================================================
// SOCKET STORE — Zustand store for WebSocket connection state
// ============================================================================

import { create } from "zustand";
import {
  connectSocket,
  disconnectSocket,
  isSocketConnected,
  getSocket,
} from "../core/socket/socket.client";

// ============================================================================
// TYPES
// ============================================================================

interface SocketState {
  /** Whether the socket is currently connected */
  isConnected: boolean;
  /** Last connection error message (null if none) */
  connectionError: string | null;
  /** Number of reconnect attempts made */
  reconnectAttempts: number;
  /** Timestamp of last received event (for stale-connection detection) */
  lastEventAt: number | null;
}

interface SocketActions {
  /** Initialise the socket connection with an auth token */
  connect: (token?: string) => void;
  /** Gracefully disconnect and reset state */
  disconnect: () => void;
  /** Update connection status (called by socket event listeners) */
  setConnected: (connected: boolean) => void;
  /** Record a connection error */
  setError: (error: string | null) => void;
  /** Bump reconnect attempt counter */
  incrementReconnect: () => void;
  /** Reset reconnect counter */
  resetReconnect: () => void;
  /** Stamp latest event time */
  touchLastEvent: () => void;
}

type SocketStore = SocketState & SocketActions;

// ============================================================================
// STORE
// ============================================================================

export const useSocketStore = create<SocketStore>()((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────
  isConnected: false,
  connectionError: null,
  reconnectAttempts: 0,
  lastEventAt: null,

  // ── Actions ────────────────────────────────────────────────────────────
  connect: (token?: string) => {
    try {
      const sock = connectSocket(token);

      // Wire up state listeners once
      sock.off("connect").on("connect", () => {
        set({ isConnected: true, connectionError: null, reconnectAttempts: 0 });
      });

      sock.off("disconnect").on("disconnect", () => {
        set({ isConnected: false });
      });

      sock.off("connect_error").on("connect_error", (err) => {
        set({ connectionError: err.message, isConnected: false });
      });

      sock.io.off("reconnect_attempt").on("reconnect_attempt", () => {
        get().incrementReconnect();
      });

      sock.io.off("reconnect").on("reconnect", () => {
        set({ isConnected: true, connectionError: null, reconnectAttempts: 0 });
      });

      sock.io.off("reconnect_failed").on("reconnect_failed", () => {
        set({ connectionError: "Reconnect failed after all attempts" });
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Socket connection failed";
      set({ connectionError: message, isConnected: false });
    }
  },

  disconnect: () => {
    disconnectSocket();
    set({
      isConnected: false,
      connectionError: null,
      reconnectAttempts: 0,
      lastEventAt: null,
    });
  },

  setConnected: (connected) => set({ isConnected: connected }),
  setError: (error) => set({ connectionError: error }),
  incrementReconnect: () =>
    set((s) => ({ reconnectAttempts: s.reconnectAttempts + 1 })),
  resetReconnect: () => set({ reconnectAttempts: 0 }),
  touchLastEvent: () => set({ lastEventAt: Date.now() }),
}));

// ============================================================================
// SELECTORS
// ============================================================================

export const selectIsSocketConnected = (s: SocketStore) => s.isConnected;
export const selectSocketError = (s: SocketStore) => s.connectionError;
export const selectReconnectAttempts = (s: SocketStore) => s.reconnectAttempts;

// ============================================================================
// CONVENIENCE HOOK
// ============================================================================

export const useSocketConnection = () => {
  const isConnected = useSocketStore(selectIsSocketConnected);
  const error = useSocketStore(selectSocketError);
  const attempts = useSocketStore(selectReconnectAttempts);
  const connect = useSocketStore((s) => s.connect);
  const disconnect = useSocketStore((s) => s.disconnect);

  return { isConnected, error, attempts, connect, disconnect };
};
