// ============================================================================
// TOAST STORE - Zustand store for toast notifications (Client State Only)
// ============================================================================

import { create } from 'zustand';

// ============================================================================
// TYPES
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  createdAt: number;
}

interface ToastState {
  toasts: Toast[];
  maxToasts: number;
}

interface ToastActions {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  setMaxToasts: (max: number) => void;
}

type ToastStore = ToastState & ToastActions;

// ============================================================================
// HELPERS
// ============================================================================

const generateId = (): string => {
  return `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3000,
};

// ============================================================================
// STORE
// ============================================================================

export const useToastStore = create<ToastStore>((set, get) => ({
  // State
  toasts: [],
  maxToasts: 5,

  // Actions
  showToast: (message: string, type: ToastType = 'info', duration?: number) => {
    const { toasts, maxToasts } = get();
    const id = generateId();
    const finalDuration = duration ?? DEFAULT_DURATION[type];

    const newToast: Toast = {
      id,
      message,
      type,
      duration: finalDuration,
      createdAt: Date.now(),
    };

    // Add new toast and limit to maxToasts
    const updatedToasts = [newToast, ...toasts].slice(0, maxToasts);

    set({ toasts: updatedToasts });

    // Auto dismiss after duration
    if (finalDuration > 0) {
      setTimeout(() => {
        get().dismissToast(id);
      }, finalDuration);
    }
  },

  dismissToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },

  setMaxToasts: (max: number) => {
    set({ maxToasts: max });
  },
}));

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

export const useToast = () => {
  const showToast = useToastStore((state) => state.showToast);
  const dismissToast = useToastStore((state) => state.dismissToast);
  const clearAllToasts = useToastStore((state) => state.clearAllToasts);
  const toasts = useToastStore((state) => state.toasts);

  return {
    toasts,
    showToast,
    dismissToast,
    clearAllToasts,
    success: (message: string, duration?: number) => showToast(message, 'success', duration),
    error: (message: string, duration?: number) => showToast(message, 'error', duration),
    warning: (message: string, duration?: number) => showToast(message, 'warning', duration),
    info: (message: string, duration?: number) => showToast(message, 'info', duration),
  };
};
