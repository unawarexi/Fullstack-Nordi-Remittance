// ============================================================================
// NETWORK DETECTOR — Real-time network quality monitoring
//
// Detects: offline, poor, slow, good, excellent
// Sources: navigator.onLine, navigator.connection, request latency tracking
// Pattern: Singleton + useSyncExternalStore-compatible (getSnapshot/subscribe)
// ============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ───────────────────────────────────────────────────────────────────

export type NetworkQuality = 'excellent' | 'good' | 'slow' | 'poor' | 'offline';

export interface NetworkState {
  /** Current network quality tier */
  quality: NetworkQuality;
  /** Whether the browser reports navigator.onLine */
  isOnline: boolean;
  /** True when quality is 'slow' or 'poor' */
  isSlowNetwork: boolean;
  /** The effective connection type from Network Information API (or null) */
  effectiveType: string | null;
  /** Estimated round-trip time in ms (from API or navigator.connection) */
  rtt: number;
  /** Estimated downlink Mbps (from navigator.connection, or -1) */
  downlink: number;
  /** Timestamp of the last quality change */
  lastChanged: number;
  /** Whether we've ever confirmed connectivity with a real request */
  hasConfirmedConnection: boolean;
}

type Listener = () => void;

// ─── Connection API type (not all browsers expose this) ──────────────────────

interface NetworkInformationLike {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener?(type: string, listener: () => void): void;
  removeEventListener?(type: string, listener: () => void): void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const LATENCY_SAMPLE_SIZE = 10;
const EXCELLENT_RTT = 150;  // ms
const GOOD_RTT = 400;       // ms
const SLOW_RTT = 1000;      // ms
// Above SLOW_RTT → "poor"

// ─── Singleton Class ─────────────────────────────────────────────────────────

class NetworkDetector {
  private state: NetworkState;
  private listeners = new Set<Listener>();
  private latencySamples: number[] = [];
  private connectionApi: NetworkInformationLike | null = null;

  constructor() {
    this.state = {
      quality: navigator.onLine ? 'good' : 'offline',
      isOnline: navigator.onLine,
      isSlowNetwork: false,
      effectiveType: null,
      rtt: 0,
      downlink: -1,
      lastChanged: Date.now(),
      hasConfirmedConnection: false,
    };

    this.init();
  }

  // ─── Initialization ────────────────────────────────────────────────────

  private init(): void {
    // 1. Browser online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // 2. Network Information API (Chrome/Edge/Android)
    const nav = navigator as any;
    const conn: NetworkInformationLike | undefined =
      nav.connection || nav.mozConnection || nav.webkitConnection;

    if (conn) {
      this.connectionApi = conn;
      this.syncFromConnectionApi();
      conn.addEventListener?.('change', this.handleConnectionChange);
    }
  }

  // ─── Event handlers ────────────────────────────────────────────────────

  private handleOnline = (): void => {
    this.updateState({ isOnline: true });
    this.recomputeQuality();
  };

  private handleOffline = (): void => {
    this.updateState({
      isOnline: false,
      quality: 'offline',
      isSlowNetwork: false,
      hasConfirmedConnection: false,
    });
  };

  private handleConnectionChange = (): void => {
    this.syncFromConnectionApi();
    this.recomputeQuality();
  };

  // ─── Connection API sync ───────────────────────────────────────────────

  private syncFromConnectionApi(): void {
    if (!this.connectionApi) return;

    const updates: Partial<NetworkState> = {};

    if (this.connectionApi.effectiveType) {
      updates.effectiveType = this.connectionApi.effectiveType;
    }
    if (typeof this.connectionApi.rtt === 'number') {
      updates.rtt = this.connectionApi.rtt;
    }
    if (typeof this.connectionApi.downlink === 'number') {
      updates.downlink = this.connectionApi.downlink;
    }

    this.updateState(updates);
  }

  // ─── Quality computation ──────────────────────────────────────────────

  private recomputeQuality(): void {
    if (!this.state.isOnline) {
      this.updateState({ quality: 'offline', isSlowNetwork: false });
      return;
    }

    let quality: NetworkQuality;

    // Prefer connection API effective type as a primary signal
    const etype = this.state.effectiveType;
    if (etype === 'slow-2g' || etype === '2g') {
      quality = 'poor';
    } else if (etype === '3g') {
      quality = 'slow';
    } else if (etype === '4g') {
      // Refine 4g with RTT measurements
      quality = this.qualityFromRtt(this.getEffectiveRtt());
    } else {
      // No connection API — rely on latency samples
      quality = this.qualityFromRtt(this.getEffectiveRtt());
    }

    this.updateState({
      quality,
      isSlowNetwork: quality === 'slow' || quality === 'poor',
    });
  }

  private qualityFromRtt(rtt: number): NetworkQuality {
    if (rtt <= 0) return 'good'; // No data yet, assume good
    if (rtt <= EXCELLENT_RTT) return 'excellent';
    if (rtt <= GOOD_RTT) return 'good';
    if (rtt <= SLOW_RTT) return 'slow';
    return 'poor';
  }

  private getEffectiveRtt(): number {
    // Prefer measured latency from actual API calls
    if (this.latencySamples.length >= 3) {
      // Use median for robustness
      const sorted = [...this.latencySamples].sort((a, b) => a - b);
      return sorted[Math.floor(sorted.length / 2)];
    }
    // Fall back to connection API rtt
    return this.state.rtt;
  }

  // ─── Public API: Report request latency (called from axios interceptor) ─

  reportLatency(ms: number): void {
    this.latencySamples.push(ms);
    if (this.latencySamples.length > LATENCY_SAMPLE_SIZE) {
      this.latencySamples.shift();
    }

    this.updateState({ rtt: this.getEffectiveRtt(), hasConfirmedConnection: true });
    this.recomputeQuality();
  }

  /** Call when a network request fails with a network error (not HTTP error) */
  reportNetworkError(): void {
    // Push a high latency sample to degrade quality
    this.latencySamples.push(5000);
    if (this.latencySamples.length > LATENCY_SAMPLE_SIZE) {
      this.latencySamples.shift();
    }
    this.recomputeQuality();
  }

  /** Call when a request succeeds to confirm we're online */
  reportRequestSuccess(): void {
    if (!this.state.hasConfirmedConnection) {
      this.updateState({ hasConfirmedConnection: true });
    }
    if (!this.state.isOnline) {
      // Browser thought we were offline but a request succeeded
      this.updateState({ isOnline: true });
      this.recomputeQuality();
    }
  }

  // ─── State management ─────────────────────────────────────────────────

  private updateState(partial: Partial<NetworkState>): void {
    const prev = this.state;
    const next = { ...prev, ...partial };

    // Only notify if something actually changed
    if (
      prev.quality !== next.quality ||
      prev.isOnline !== next.isOnline ||
      prev.isSlowNetwork !== next.isSlowNetwork ||
      prev.effectiveType !== next.effectiveType
    ) {
      next.lastChanged = Date.now();
    }

    this.state = next;
    this.emit();
  }

  private emit(): void {
    this.listeners.forEach((fn) => fn());
  }

  // ─── useSyncExternalStore interface ────────────────────────────────────

  /** For useSyncExternalStore — returns immutable snapshot */
  getSnapshot = (): NetworkState => {
    return this.state;
  };

  /** For useSyncExternalStore — subscribe to changes */
  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  // ─── Convenience getters ──────────────────────────────────────────────

  get isOnline(): boolean {
    return this.state.isOnline;
  }

  get quality(): NetworkQuality {
    return this.state.quality;
  }

  get isSlowNetwork(): boolean {
    return this.state.isSlowNetwork;
  }

  // ─── Cleanup (for tests) ──────────────────────────────────────────────

  destroy(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    if (this.connectionApi) {
      this.connectionApi.removeEventListener?.('change', this.handleConnectionChange);
    }
    this.listeners.clear();
    this.latencySamples = [];
  }
}

// ─── Singleton Export ────────────────────────────────────────────────────────

export const networkDetector = new NetworkDetector();
export default networkDetector;
