// ============================================================================
// MODAL COMPONENT - Animated dialog with backdrop
// ============================================================================

import React, { forwardRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@utils/cn';
import { X } from 'lucide-react';
import { IconButton } from './Button';

// ========================
// TYPES
// ========================
export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}

// ========================
// SIZE STYLES
// ========================
const sizeStyles: Record<ModalSize, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
};

// ========================
// ANIMATION VARIANTS
// ========================
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

// ========================
// COMPONENT
// ========================
export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      children,
      size = 'md',
      closeOnOverlayClick = true,
      closeOnEsc = true,
      showCloseButton = true,
      title,
      description,
      footer,
      className,
      overlayClassName,
    },
    ref
  ) => {
    // Handle ESC key
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape' && closeOnEsc) {
          onClose();
        }
      },
      [closeOnEsc, onClose]
    );

    // Add/remove event listeners
    useEffect(() => {
      if (isOpen) {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
      }
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }, [isOpen, handleKeyDown]);

    // Handle overlay click
    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && closeOnOverlayClick) {
        onClose();
      }
    };

    const modalContent = (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[1400] overflow-y-auto">
            {/* Overlay */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={handleOverlayClick}
              className={cn(
                'fixed inset-0 bg-black/50 backdrop-blur-sm',
                'flex items-center justify-center p-4',
                overlayClassName
              )}
            >
              {/* Modal */}
              <motion.div
                ref={ref}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  'relative w-full bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl',
                  'flex flex-col max-h-[90vh]',
                  sizeStyles[size],
                  className
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
                aria-describedby={description ? 'modal-description' : undefined}
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <div className="flex items-start justify-between p-4 sm:p-6 border-b border-neutral-100 dark:border-neutral-700">
                    <div className="flex-1 min-w-0 pr-4">
                      {title && (
                        <h2
                          id="modal-title"
                          className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white"
                        >
                          {title}
                        </h2>
                      )}
                      {description && (
                        <p
                          id="modal-description"
                          className="text-sm text-neutral-500 dark:text-neutral-400 mt-1"
                        >
                          {description}
                        </p>
                      )}
                    </div>
                    {showCloseButton && (
                      <IconButton
                        icon={<X size={20} />}
                        variant="ghost"
                        size="sm"
                        aria-label="Close modal"
                        onClick={onClose}
                        className="flex-shrink-0 -mt-1 -mr-1"
                      />
                    )}
                  </div>
                )}
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-neutral-900 dark:text-white">
                  {children}
                </div>
                
                {/* Footer */}
                {footer && (
                  <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-neutral-100 dark:border-neutral-700">
                    {footer}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );

    // Portal to body
    return typeof window !== 'undefined'
      ? createPortal(modalContent, document.body)
      : null;
  }
);

Modal.displayName = 'Modal';

// ========================
// CONFIRM MODAL
// ========================
export interface ConfirmModalProps extends Omit<ModalProps, 'children' | 'footer'> {
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'danger';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  isLoading = false,
  onClose,
  children,
  ...props
}) => {
  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
  };

  // Import Button dynamically to avoid circular dependency
  const Button = require('./Button').Button;

  return (
    <Modal
      {...props}
      size="sm"
      onClose={onClose}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
};

// ========================
// ALERT MODAL
// ========================
export interface AlertModalProps extends Omit<ModalProps, 'children' | 'footer'> {
  type?: 'info' | 'success' | 'warning' | 'error';
  message: string;
  buttonText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  type = 'info',
  message,
  buttonText = 'OK',
  onClose,
  ...props
}) => {
  const Button = require('./Button').Button;

  const iconColors = {
    info: 'text-info-500 bg-info-100',
    success: 'text-success-500 bg-success-100',
    warning: 'text-warning-500 bg-warning-100',
    error: 'text-error-500 bg-error-100',
  };

  return (
    <Modal
      {...props}
      size="xs"
      onClose={onClose}
      showCloseButton={false}
      footer={
        <Button variant="primary" onClick={onClose} fullWidth>
          {buttonText}
        </Button>
      }
    >
      <div className="text-center">
        <div className={cn(
          'w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center',
          iconColors[type]
        )}>
          {type === 'success' && '✓'}
          {type === 'error' && '✕'}
          {type === 'warning' && '!'}
          {type === 'info' && 'i'}
        </div>
        <p className="text-neutral-600">{message}</p>
      </div>
    </Modal>
  );
};

export default Modal;
