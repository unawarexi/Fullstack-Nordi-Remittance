// ============================================================================
// SOCKET CLIENT — Socket.IO client wrapper with auth, reconnect & lifecycle
// ============================================================================

import { io, Socket } from "socket.io-client";
import { TokenManager } from "../api/client";
import type { WSEventName } from "../events/ws-events";

// ============================================================================
// CONFIGURATION
// ============================================================================

const SOCKET_URL =
  import.meta.env.VITE_WS_URL ||
  import.meta.env.VITE_API_URL?.replace("/api/v1", "") ||
  "http://localhost:3000";

const SOCKET_OPTIONS = {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,
  timeout: 20000,
  transports: ["websocket", "polling"] as string[],
};

// ============================================================================
// SINGLETON SOCKET INSTANCE
// ============================================================================

let socket: Socket | null = null;
let connectionAttemptInProgress = false;

// ============================================================================
// LIFECYCLE FUNCTIONS
// ============================================================================

/**
 * Initialise & connect the WebSocket.
 * Safe to call multiple times — only creates one socket.
 */
export function connectSocket(token?: string): Socket {
  // Already connected — just return
  if (socket?.connected) return socket;

  // Prevent concurrent connect races
  if (connectionAttemptInProgress && socket) return socket;
  connectionAttemptInProgress = true;

  const authToken = token || TokenManager.getAccessToken();
  if (!authToken) {
    connectionAttemptInProgress = false;
    throw new Error("[WS] Cannot connect — no auth token available");
  }

  // Create socket instance if not exists, otherwise update auth
  if (!socket) {
    socket = io(SOCKET_URL, {
      ...SOCKET_OPTIONS,
      auth: { token: authToken },
    });

    // ── Built-in event listeners ───────────────────────────────────────
    socket.on("connect", () => {
      connectionAttemptInProgress = false;
      console.info("[WS] Connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      connectionAttemptInProgress = false;
      console.warn("[WS] Disconnected:", reason);

      // Server-initiated disconnects — don't auto-reconnect
      if (reason === "io server disconnect") {
        console.info("[WS] Server forced disconnect — not reconnecting");
      }
    });

    socket.on("connect_error", (err) => {
      connectionAttemptInProgress = false;
      console.error("[WS] Connection error:", err.message);

      // If auth fails, don't keep hammering
      if (err.message.includes("auth") || err.message.includes("unauthorized")) {
        console.warn("[WS] Auth failure — disconnecting");
        socket?.disconnect();
      }
    });

    socket.io.on("reconnect", (attempt) => {
      console.info(`[WS] Reconnected after ${attempt} attempt(s)`);
    });

    socket.io.on("reconnect_attempt", (attempt) => {
      // Refresh token on reconnect so the handshake uses a fresh JWT
      const freshToken = TokenManager.getAccessToken();
      if (freshToken && socket) {
        socket.auth = { token: freshToken };
      }
      console.info(`[WS] Reconnect attempt #${attempt}`);
    });

    socket.io.on("reconnect_failed", () => {
      console.error("[WS] Reconnect failed after all attempts");
    });
  } else {
    // Socket already exists — update auth token and reconnect
    socket.auth = { token: authToken };
  }

  socket.connect();
  return socket;
}

/**
 * Gracefully disconnect the socket and clean up.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    connectionAttemptInProgress = false;
    console.info("[WS] Socket disconnected & cleaned up");
  }
}

/**
 * Get the current socket instance (may be null if not connected).
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Check if the socket is currently connected.
 */
export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

// ============================================================================
// TYPED EVENT HELPERS
// ============================================================================

/**
 * Subscribe to a typed WebSocket event.
 * Returns an unsubscribe function for easy cleanup.
 */
export function onSocketEvent<T = unknown>(
  event: WSEventName | string,
  handler: (data: T) => void,
): () => void {
  if (!socket) {
    console.warn(`[WS] Cannot subscribe to "${event}" — socket not initialised`);
    return () => {};
  }
  socket.on(event, handler as (...args: unknown[]) => void);
  return () => {
    socket?.off(event, handler as (...args: unknown[]) => void);
  };
}

/**
 * Emit a typed event to the server.
 */
export function emitSocketEvent<T = unknown>(
  event: WSEventName | string,
  data?: T,
): void {
  if (!socket?.connected) {
    console.warn(`[WS] Cannot emit "${event}" — socket not connected`);
    return;
  }
  socket.emit(event, data);
}
