// ============================================================================
// useNetworkStatus — React hook for real-time network quality
//
// Uses useSyncExternalStore for tear-free reads from the NetworkDetector
// singleton. Components re-render only when network state actually changes.
// ============================================================================

import { useSyncExternalStore } from 'react';
import { networkDetector, type NetworkState } from '@core/network/network';

/**
 * Subscribe to real-time network quality changes.
 *
 * @example
 * ```tsx
 * const { quality, isOnline, isSlowNetwork } = useNetworkStatus();
 *
 * if (!isOnline) return <OfflineBanner />;
 * if (isSlowNetwork) return <SlowNetworkWarning />;
 * ```
 */
export function useNetworkStatus(): NetworkState {
  return useSyncExternalStore(
    networkDetector.subscribe,
    networkDetector.getSnapshot,
    // Server snapshot (SSR fallback) — assume good connection
    () => ({
      quality: 'good' as const,
      isOnline: true,
      isSlowNetwork: false,
      effectiveType: null,
      rtt: 0,
      downlink: -1,
      lastChanged: Date.now(),
      hasConfirmedConnection: false,
    }),
  );
}

export default useNetworkStatus;
