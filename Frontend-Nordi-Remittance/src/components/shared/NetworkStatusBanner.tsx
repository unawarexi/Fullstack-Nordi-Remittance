// ============================================================================
// NETWORK STATUS BANNER — Sticky top-bar showing network quality changes
//
// • Offline  → Red:   "You're offline. Showing cached data."
// • Poor/Slow → Amber: "Slow connection detected. Some data may be delayed."
// • Recovery → Green:  "Connection restored. Refreshing data…" (auto-dismiss)
// ============================================================================

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import type { NetworkQuality } from '@core/network/network';

// ─── Banner config per quality ───────────────────────────────────────────────

interface BannerConfig {
  icon: React.ReactNode;
  message: string;
  bgClass: string;
  textClass: string;
  autoDismissMs?: number;
}

const BANNER_MAP: Partial<Record<NetworkQuality | 'recovered', BannerConfig>> = {
  offline: {
    icon: <WifiOff size={18} />,
    message: "You're offline. Showing cached data.",
    bgClass: 'nsb-offline',
    textClass: 'nsb-text-offline',
  },
  poor: {
    icon: <AlertTriangle size={18} />,
    message: 'Poor connection detected. Some data may be delayed.',
    bgClass: 'nsb-poor',
    textClass: 'nsb-text-poor',
  },
  slow: {
    icon: <Wifi size={18} />,
    message: 'Slow connection detected. Data may take longer to load.',
    bgClass: 'nsb-slow',
    textClass: 'nsb-text-slow',
  },
  recovered: {
    icon: <CheckCircle size={18} />,
    message: 'Connection restored. Refreshing data…',
    bgClass: 'nsb-recovered',
    textClass: 'nsb-text-recovered',
    autoDismissMs: 3000,
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export const NetworkStatusBanner: React.FC = () => {
  const { quality, isOnline } = useNetworkStatus();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [config, setConfig] = useState<BannerConfig | null>(null);
  const prevQualityRef = useRef<NetworkQuality>(quality);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const prev = prevQualityRef.current;
    prevQualityRef.current = quality;

    // Clear any pending auto-dismiss
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }

    // Determine which banner to show
    let nextConfig: BannerConfig | null = null;

    if (quality === 'offline') {
      nextConfig = BANNER_MAP.offline!;
      setDismissed(false);
    } else if (quality === 'poor') {
      nextConfig = BANNER_MAP.poor!;
      setDismissed(false);
    } else if (quality === 'slow') {
      nextConfig = BANNER_MAP.slow!;
      setDismissed(false);
    } else if (
      (prev === 'offline' || prev === 'poor' || prev === 'slow') &&
      (quality === 'good' || quality === 'excellent')
    ) {
      // Recovery! Show green banner briefly
      nextConfig = BANNER_MAP.recovered!;
      setDismissed(false);
    } else {
      // Good/Excellent with no prior degradation — hide
      nextConfig = null;
    }

    setConfig(nextConfig);
    setVisible(!!nextConfig && !dismissed);

    // Auto-dismiss recovery banner
    if (nextConfig?.autoDismissMs) {
      dismissTimerRef.current = setTimeout(() => {
        setVisible(false);
        setConfig(null);
      }, nextConfig.autoDismissMs);
    }

    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [quality, isOnline, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && config && (
        <motion.div
          key="network-banner"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`nsb-root ${config.bgClass}`}
          role="alert"
          aria-live="polite"
        >
          <div className={`nsb-inner ${config.textClass}`}>
            <span className="nsb-icon">{config.icon}</span>
            <span className="nsb-message">{config.message}</span>
            {/* Only allow dismissing non-offline banners */}
            {quality !== 'offline' && (
              <button
                onClick={handleDismiss}
                className="nsb-dismiss"
                aria-label="Dismiss network notification"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Styles (injected via CSS-in-JS-like approach using vanilla CSS) ─────────
// We'll add these to index.css or App.css. For now, define the class names
// so the component is self-documenting.
//
// .nsb-root        → position: sticky; top: 0; z-index: 9999; overflow: hidden;
// .nsb-inner       → display: flex; align-items: center; gap: 8px; padding: 10px 16px; font-size: 14px;
// .nsb-icon        → flex-shrink: 0;
// .nsb-message     → flex: 1;
// .nsb-dismiss     → cursor: pointer; background: none; border: none; opacity: 0.7; &:hover { opacity: 1; }
//
// .nsb-offline     → background: linear-gradient(135deg, #dc2626, #b91c1c);
// .nsb-text-offline → color: #fff;
// .nsb-poor        → background: linear-gradient(135deg, #d97706, #b45309);
// .nsb-text-poor   → color: #fff;
// .nsb-slow        → background: linear-gradient(135deg, #f59e0b, #d97706);
// .nsb-text-slow   → color: #fff;
// .nsb-recovered   → background: linear-gradient(135deg, #059669, #047857);
// .nsb-text-recovered → color: #fff;

export default NetworkStatusBanner;
