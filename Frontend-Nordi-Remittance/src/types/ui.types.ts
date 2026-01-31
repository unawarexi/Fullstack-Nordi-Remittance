// ============================================================================
// UI COMPONENT TYPES - Types for all UI components (Button, Input, Card, etc.)
// ============================================================================

import { ReactNode, HTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { HTMLMotionProps } from 'framer-motion';
import type { BaseProps, SizeVariant, CompactSize } from './common.types';

// ============================================================================
// BUTTON TYPES
// ============================================================================

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'link';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'leftIcon' | 'rightIcon'> {
  icon: ReactNode;
  'aria-label': string;
}

// ============================================================================
// INPUT TYPES
// ============================================================================

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'outline' | 'filled' | 'flushed';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: InputSize;
  variant?: InputVariant;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isInvalid?: boolean;
}

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: InputSize;
  variant?: InputVariant;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isInvalid?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

// ============================================================================
// CARD TYPES
// ============================================================================

export type CardVariant = 'elevated' | 'outline' | 'filled' | 'ghost';
export type CardSize = 'sm' | 'md' | 'lg';

export interface CardProps extends BaseProps {
  variant?: CardVariant;
  size?: CardSize;
  isHoverable?: boolean;
  isClickable?: boolean;
  isPressable?: boolean;
  children: ReactNode;
  onClick?: () => void;
}

export interface CardHeaderProps extends BaseProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  avatar?: ReactNode;
  children?: ReactNode;
}

export interface CardContentProps extends BaseProps {
  children: ReactNode;
  noPadding?: boolean;
}

export interface CardFooterProps extends BaseProps {
  children: ReactNode;
  justify?: 'start' | 'center' | 'end' | 'between';
}

export interface StatCardProps extends BaseProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
}

// ============================================================================
// BADGE TYPES
// ============================================================================

export type BadgeVariant = 'solid' | 'subtle' | 'outline' | 'dot';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';
export type BadgeColorScheme = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface BadgeProps extends BaseProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  colorScheme?: BadgeColorScheme;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export type StatusBadgeType = 'success' | 'error' | 'warning' | 'info' | 'pending' | 'inactive';

export interface StatusBadgeProps extends BaseProps {
  status: StatusBadgeType;
  label?: string;
  showDot?: boolean;
}

export interface NotificationBadgeProps extends BaseProps {
  count: number;
  max?: number;
  showZero?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  children: ReactNode;
}

// ============================================================================
// AVATAR TYPES
// ============================================================================

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface AvatarProps extends BaseProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  fallback?: ReactNode;
  showBorder?: boolean;
  isOnline?: boolean;
  onClick?: () => void;
}

export interface AvatarGroupProps extends BaseProps {
  children: ReactNode;
  max?: number;
  size?: AvatarSize;
  spacing?: 'tight' | 'normal' | 'loose';
}

// ============================================================================
// MODAL TYPES
// ============================================================================

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export interface ConfirmModalProps extends Omit<ModalProps, 'children' | 'footer'> {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export interface AlertModalProps extends Omit<ModalProps, 'children' | 'footer'> {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  buttonText?: string;
}

// ============================================================================
// LOADING/SPINNER TYPES
// ============================================================================

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'circle' | 'dots' | 'bars' | 'pulse';

export interface SpinnerProps extends BaseProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  color?: string;
  thickness?: number;
  speed?: 'slow' | 'normal' | 'fast';
  label?: string;
}

export interface DotsLoaderProps extends BaseProps {
  size?: SpinnerSize;
  color?: string;
}

export interface PulseLoaderProps extends BaseProps {
  size?: CompactSize;
  color?: string;
}

export interface SkeletonProps extends BaseProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  isLoaded?: boolean;
  children?: ReactNode;
}

export interface PageLoaderProps extends BaseProps {
  message?: string;
  showLogo?: boolean;
}

export interface OverlayLoaderProps extends BaseProps {
  isVisible: boolean;
  message?: string;
  blur?: boolean;
}

// ============================================================================
// SELECT TYPES
// ============================================================================

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: ReactNode;
  description?: string;
}

export interface SelectProps<T = string> extends Omit<BaseProps, 'onChange'> {
  options: SelectOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  hint?: string;
  size?: SelectSize;
  isDisabled?: boolean;
  isRequired?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  isMulti?: boolean;
  isLoading?: boolean;
  menuPlacement?: 'auto' | 'top' | 'bottom';
}

// ============================================================================
// TOAST TYPES
// ============================================================================

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 
  | 'top-right' 
  | 'top-left' 
  | 'top-center' 
  | 'bottom-right' 
  | 'bottom-left' 
  | 'bottom-center';

export interface ToastProps {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
  isClosable?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastContainerProps {
  position?: ToastPosition;
  maxToasts?: number;
}

// ============================================================================
// TOOLTIP TYPES
// ============================================================================

export type TooltipPlacement = 
  | 'top' 
  | 'right' 
  | 'bottom' 
  | 'left' 
  | 'top-start' 
  | 'top-end'
  | 'right-start'
  | 'right-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'left-start'
  | 'left-end';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
  isDisabled?: boolean;
  className?: string;
}

// ============================================================================
// TABS TYPES
// ============================================================================

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

export interface TabsProps extends BaseProps {
  items: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'line' | 'enclosed' | 'soft-rounded' | 'solid-rounded';
  size?: CompactSize;
  isFullWidth?: boolean;
}

export interface TabPanelProps extends BaseProps {
  children: ReactNode;
  isSelected?: boolean;
}

// ============================================================================
// DROPDOWN/MENU TYPES
// ============================================================================

export interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  danger?: boolean;
  children?: MenuItem[];
}

export interface DropdownProps extends BaseProps {
  trigger: ReactNode;
  items: MenuItem[];
  placement?: TooltipPlacement;
  closeOnSelect?: boolean;
}

// ============================================================================
// TABLE TYPES
// ============================================================================

export interface TableColumn<T = unknown> {
  key: string;
  header: string;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: unknown, row: T, index: number) => ReactNode;
}

export interface TableProps<T = unknown> extends BaseProps {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
  selectedRows?: number[];
  onSelectionChange?: (selectedIndexes: number[]) => void;
  sortConfig?: {
    key: string;
    direction: 'asc' | 'desc';
  };
  onSort?: (key: string) => void;
  stickyHeader?: boolean;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
}

// ============================================================================
// PROGRESS TYPES
// ============================================================================

export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';
export type ProgressVariant = 'line' | 'circle';

export interface ProgressProps extends BaseProps {
  value: number;
  max?: number;
  size?: ProgressSize;
  variant?: ProgressVariant;
  colorScheme?: BadgeColorScheme;
  showValue?: boolean;
  isIndeterminate?: boolean;
  label?: string;
}

// ============================================================================
// SWITCH/TOGGLE TYPES
// ============================================================================

export type SwitchSize = 'sm' | 'md' | 'lg';

export interface SwitchProps extends BaseProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: SwitchSize;
  colorScheme?: BadgeColorScheme;
  isDisabled?: boolean;
  label?: string;
  'aria-label'?: string;
}

// ============================================================================
// CHECKBOX & RADIO TYPES
// ============================================================================

export interface CheckboxProps extends BaseProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: CompactSize;
  colorScheme?: BadgeColorScheme;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isIndeterminate?: boolean;
  label?: string;
  children?: ReactNode;
}

export interface RadioProps extends Omit<CheckboxProps, 'isIndeterminate'> {
  value: string;
}

export interface RadioGroupProps extends BaseProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name: string;
  orientation?: 'horizontal' | 'vertical';
  spacing?: CompactSize;
  children: ReactNode;
}

// ============================================================================
// ACCORDION TYPES
// ============================================================================

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps extends BaseProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultExpandedItems?: string[];
  variant?: 'outline' | 'filled' | 'separated';
}

// ============================================================================
// ALERT TYPES
// ============================================================================

export type AlertStatus = 'success' | 'error' | 'warning' | 'info';
export type AlertVariant = 'subtle' | 'solid' | 'left-accent' | 'top-accent';

export interface AlertProps extends BaseProps {
  status: AlertStatus;
  variant?: AlertVariant;
  title?: string;
  description?: string;
  icon?: ReactNode;
  isClosable?: boolean;
  onClose?: () => void;
  children?: ReactNode;
}

// ============================================================================
// POPOVER TYPES
// ============================================================================

export interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: ReactNode;
  children: ReactNode;
  placement?: TooltipPlacement;
  closeOnBlur?: boolean;
  closeOnEsc?: boolean;
  className?: string;
}

// ============================================================================
// DRAWER TYPES
// ============================================================================

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  title?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface PaginationProps extends BaseProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  size?: CompactSize;
  variant?: 'solid' | 'outline' | 'ghost';
  isDisabled?: boolean;
}
