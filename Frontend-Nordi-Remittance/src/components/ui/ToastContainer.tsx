// ============================================================================
// TOAST CONTAINER COMPONENT - Displays toast notifications
// ============================================================================

import { useEffect, useCallback } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useToastStore, Toast, ToastType } from '../../store/toast.store';
import { cn } from '../../utils/cn';

// ============================================================================
// TOAST ICON COMPONENT
// ============================================================================

const ToastIcon = ({ type }: { type: ToastType }) => {
  const iconProps = {
    className: 'h-5 w-5 flex-shrink-0',
  };

  switch (type) {
    case 'success':
      return <CheckCircle {...iconProps} className={cn(iconProps.className, 'text-green-500')} />;
    case 'error':
      return <XCircle {...iconProps} className={cn(iconProps.className, 'text-red-500')} />;
    case 'warning':
      return <AlertTriangle {...iconProps} className={cn(iconProps.className, 'text-yellow-500')} />;
    case 'info':
    default:
      return <Info {...iconProps} className={cn(iconProps.className, 'text-blue-500')} />;
  }
};

// ============================================================================
// TOAST ITEM COMPONENT
// ============================================================================

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem = ({ toast, onDismiss }: ToastItemProps) => {
  const bgColors: Record<ToastType, string> = {
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  };

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg',
        'animate-in slide-in-from-top duration-300',
        'max-w-md w-full',
        bgColors[toast.type]
      )}
    >
      <ToastIcon type={toast.type} />
      <p className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
};

// ============================================================================
// TOAST CONTAINER COMPONENT
// ============================================================================

export const ToastContainer = () => {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  // Handle keyboard dismiss (Escape key)
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && toasts.length > 0) {
        dismissToast(toasts[0].id);
      }
    },
    [toasts, dismissToast]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
