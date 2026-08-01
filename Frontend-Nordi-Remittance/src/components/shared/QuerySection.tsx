// ============================================================================
// QUERY SECTION — Section-level error isolation wrapper
//
// Wraps a dashboard widget/section so that:
// • Loading → Shows skeleton or spinner for that section only
// • Error + stale data → Shows stale data with "data may be outdated" badge
// • Error + no data → Shows compact inline error with retry button
// • Offline + stale data → Shows stale data with "offline" badge
// • Render crash → Caught by internal ErrorBoundary, not full-page crash
// ============================================================================

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, WifiOff, Clock } from 'lucide-react';
import { useNetworkStatus } from '@hooks/useNetworkStatus';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface QuerySectionProps {
  children: ReactNode;
  /** Whether data is currently loading */
  isLoading?: boolean;
  /** Whether the query errored */
  isError?: boolean;
  /** The error object (for dev display) */
  error?: Error | unknown;
  /** Whether meaningful data exists (e.g., array.length > 0) */
  hasData?: boolean;
  /** Section title for error messages */
  title?: string;
  /** Retry callback (usually query refetch) */
  onRetry?: () => void;
  /** Custom loading skeleton */
  loadingSkeleton?: ReactNode;
  /** Custom className for the wrapper */
  className?: string;
  /** Min-height for the section (prevents layout shift) */
  minHeight?: string | number;
}

// ─── Internal Error Boundary ─────────────────────────────────────────────────

interface RenderBoundaryState {
  hasRenderError: boolean;
  renderError: Error | null;
}

class SectionRenderBoundary extends Component<
  { children: ReactNode; title?: string; onRetry?: () => void },
  RenderBoundaryState
> {
  state: RenderBoundaryState = { hasRenderError: false, renderError: null };

  static getDerivedStateFromError(error: Error): RenderBoundaryState {
    return { hasRenderError: true, renderError: error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[QuerySection:${this.props.title || 'unknown'}] Render crash:`, error, info);
  }

  handleReset = (): void => {
    this.setState({ hasRenderError: false, renderError: null });
    this.props.onRetry?.();
  };

  render(): ReactNode {
    if (this.state.hasRenderError) {
      return (
        <SectionError
          title={this.props.title}
          message="This section encountered a rendering error."
          onRetry={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Default loading skeleton */
const SectionLoadingSkeleton: React.FC<{ minHeight?: string | number }> = ({ minHeight }) => (
  <div className="qs-skeleton" style={{ minHeight: minHeight || 120 }}>
    <div className="qs-skeleton-bar qs-skeleton-bar--wide" />
    <div className="qs-skeleton-bar qs-skeleton-bar--medium" />
    <div className="qs-skeleton-bar qs-skeleton-bar--narrow" />
  </div>
);

/** Compact inline error */
const SectionError: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = ({ title, message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    className="qs-error"
  >
    <div className="qs-error-icon">
      <AlertTriangle size={24} />
    </div>
    <div className="qs-error-body">
      <p className="qs-error-title">
        {title ? `${title}: Something went wrong` : 'Something went wrong'}
      </p>
      <p className="qs-error-msg">
        {message || 'Failed to load this section. Please try again.'}
      </p>
    </div>
    {onRetry && (
      <button onClick={onRetry} className="qs-error-retry">
        <RefreshCw size={14} />
        <span>Retry</span>
      </button>
    )}
  </motion.div>
);

/** Stale data badge — shown atop children when data is outdated */
const StaleBadge: React.FC<{ isOffline: boolean }> = ({ isOffline }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="qs-stale-badge"
  >
    {isOffline ? (
      <>
        <WifiOff size={12} />
        <span>Offline — showing cached data</span>
      </>
    ) : (
      <>
        <Clock size={12} />
        <span>Data may be outdated</span>
      </>
    )}
  </motion.div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export const QuerySection: React.FC<QuerySectionProps> = ({
  children,
  isLoading = false,
  isError = false,
  error,
  hasData = true,
  title,
  onRetry,
  loadingSkeleton,
  className = '',
  minHeight,
}) => {
  const { isOnline } = useNetworkStatus();

  // Determine what to render
  const showLoading = isLoading && !hasData;
  const showError = isError && !hasData;
  const showStale = isError && hasData;
  const showOfflineStale = !isOnline && hasData && !isLoading;

  return (
    <div className={`qs-root ${className}`} style={{ minHeight }}>
      <SectionRenderBoundary title={title} onRetry={onRetry}>
        <AnimatePresence mode="wait">
          {showLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {loadingSkeleton || <SectionLoadingSkeleton minHeight={minHeight} />}
            </motion.div>
          ) : showError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SectionError
                title={title}
                message={
                  error instanceof Error
                    ? error.message
                    : 'Failed to load this section.'
                }
                onRetry={onRetry}
              />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Show stale/offline badge if applicable */}
              {(showStale || showOfflineStale) && (
                <StaleBadge isOffline={!isOnline} />
              )}
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </SectionRenderBoundary>
    </div>
  );
};

// ─── CSS Class Documentation ─────────────────────────────────────────────────
//
// .qs-root             → position: relative; (container)
//
// .qs-skeleton         → padding: 16px; display: flex; flex-direction: column; gap: 12px;
// .qs-skeleton-bar     → height: 14px; border-radius: 6px; background: var(--skeleton-bg);
//                        animation: qs-pulse 1.5s ease-in-out infinite;
// .qs-skeleton-bar--wide   → width: 90%;
// .qs-skeleton-bar--medium → width: 65%;
// .qs-skeleton-bar--narrow → width: 40%;
//
// .qs-error            → display: flex; align-items: center; gap: 12px; padding: 16px;
//                        border-radius: 12px; background: rgba(239,68,68,0.06);
//                        border: 1px solid rgba(239,68,68,0.15);
// .qs-error-icon       → color: #ef4444; flex-shrink: 0;
// .qs-error-body       → flex: 1;
// .qs-error-title      → font-weight: 600; font-size: 14px; color: #ef4444;
// .qs-error-msg        → font-size: 12px; color: #9ca3af; margin-top: 2px;
// .qs-error-retry      → display: flex; align-items: center; gap: 4px; padding: 6px 12px;
//                        border-radius: 8px; border: 1px solid rgba(239,68,68,0.3);
//                        background: transparent; color: #ef4444; cursor: pointer; font-size: 13px;
//                        transition: all 0.2s; &:hover { background: rgba(239,68,68,0.08); }
//
// .qs-stale-badge      → display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px;
//                        border-radius: 6px; font-size: 11px; font-weight: 500;
//                        background: rgba(245,158,11,0.1); color: #d97706;
//                        margin-bottom: 8px;
//
// @keyframes qs-pulse  → 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; }

export default QuerySection;
