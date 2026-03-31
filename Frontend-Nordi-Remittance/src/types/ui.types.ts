// ============================================================================
// UI COMPONENT TYPES - Types for all UI components (Button, Input, Card, etc.)
// ============================================================================

import { ReactNode } from "react";
import { HTMLMotionProps } from "framer-motion";

declare global {
  // ============================================================================
  // BUTTON TYPES
  // ============================================================================

  type ButtonVariant =
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "success"
    | "link";

  type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

  interface ButtonProps extends Omit<HTMLMotionProps<"button">, "size"> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    isDisabled?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    fullWidth?: boolean;
    children: ReactNode;
  }

  interface IconButtonProps
    extends Omit<ButtonProps, "children" | "leftIcon" | "rightIcon"> {
    icon: ReactNode;
    "aria-label": string;
  }

  // ============================================================================
  // INPUT TYPES
  // ============================================================================

  type InputSize = "sm" | "md" | "lg";
  type InputVariant = "default" | "filled" | "flushed";

  interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    label?: string;
    helperText?: string;
    error?: string;
    success?: string;
    size?: InputSize;
    variant?: InputVariant;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    isRequired?: boolean;
    showPasswordToggle?: boolean;
    fullWidth?: boolean;
  }

  interface TextareaProps
    extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
    label?: string;
    helperText?: string;
    error?: string;
    size?: InputSize;
    isRequired?: boolean;
    resize?: "none" | "vertical" | "horizontal" | "both";
  }

  // ============================================================================
  // CARD TYPES
  // ============================================================================

  type CardVariant = "default" | "elevated" | "outlined" | "filled" | "glass";
  type CardSize = "sm" | "md" | "lg" | "xl";

  interface CardProps extends BaseProps {
    variant?: CardVariant;
    size?: CardSize;
    hoverable?: boolean;
    clickable?: boolean;
    noPadding?: boolean;
    children: ReactNode;
    onClick?: () => void;
  }

  interface CardHeaderProps extends BaseProps {
    title?: string;
    subtitle?: string;
    action?: ReactNode;
    avatar?: ReactNode;
    children?: ReactNode;
  }

  interface CardContentProps extends BaseProps {
    children: ReactNode;
    noPadding?: boolean;
  }

  interface CardFooterProps extends BaseProps {
    children: ReactNode;
    justify?: "start" | "center" | "end" | "between";
  }

  interface StatCardProps extends BaseProps {
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon?: ReactNode;
    trend?: "up" | "down" | "neutral";
    isLoading?: boolean;
  }

  // ============================================================================
  // BADGE TYPES
  // ============================================================================

  type BadgeVariant =
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "outline";

  type BadgeSize = "xs" | "sm" | "md" | "lg";
  type BadgeColorScheme =
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "neutral";

  interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    size?: BadgeSize;
    dot?: boolean;
    pulse?: boolean;
    removable?: boolean;
    onRemove?: () => void;
    icon?: React.ReactNode;
    children: React.ReactNode;
  }

  type StatusBadgeType =
    | "active"
    | "inactive"
    | "pending"
    | "completed"
    | "failed"
    | "processing"
    | "approved"
    | "rejected";

  interface StatusBadgeProps extends Omit<BadgeProps, "variant" | "children"> {
    status: StatusBadgeType;
    showDot?: boolean;
    customLabel?: string;
  }

  interface NotificationBadgeProps {
    count: number;
    max?: number;
    showZero?: boolean;
    children: React.ReactNode;
  }

  // ============================================================================
  // AVATAR TYPES
  // ============================================================================

  type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

  interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string;
    alt?: string;
    name?: string;
    size?: AvatarSize;
    status?: "online" | "offline" | "away" | "busy";
    shape?: "circle" | "square";
    bordered?: boolean;
    fallbackIcon?: React.ReactNode;
  }

  interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    max?: number;
    size?: AvatarSize;
    spacing?: "tight" | "normal" | "loose";
    children: React.ReactNode;
  }

  // ============================================================================
  // MODAL TYPES
  // ============================================================================

  type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";

  interface ModalProps {
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

  interface ConfirmModalProps extends Omit<ModalProps, "children" | "footer"> {
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    variant?: "default" | "danger";
    isLoading?: boolean;
    children: React.ReactNode;
  }

  interface AlertModalProps extends Omit<ModalProps, "children" | "footer"> {
    type?: "info" | "success" | "warning" | "error";
    message: string;
    buttonText?: string;
  }

  // ============================================================================
  // LOADING/SPINNER TYPES
  // ============================================================================

  type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
  type SpinnerVariant = "default" | "primary" | "white";

  interface SpinnerProps {
    size?: SpinnerSize;
    variant?: SpinnerVariant;
    label?: string;
    className?: string;
  }

  interface DotsLoaderProps {
    size?: SpinnerSize;
    variant?: SpinnerVariant;
    className?: string;
  }

  interface PulseLoaderProps {
    size?: SpinnerSize;
    variant?: SpinnerVariant;
    className?: string;
  }

  interface SkeletonProps {
    className?: string;
    variant?: "text" | "circular" | "rectangular" | "rounded";
    width?: string | number;
    height?: string | number;
    animation?: "pulse" | "wave" | "none";
  }

  interface PageLoaderProps {
    message?: string;
    showLogo?: boolean;
  }

  interface OverlayLoaderProps {
    isVisible: boolean;
    message?: string;
  }

  // ============================================================================
  // SELECT TYPES
  // ============================================================================

  type SelectSize = "sm" | "md" | "lg";

  interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
    icon?: React.ReactNode;
    description?: string;
  }

  interface SelectProps {
    options: SelectOption[];
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    label?: string;
    helperText?: string;
    error?: string;
    size?: SelectSize;
    disabled?: boolean;
    isRequired?: boolean;
    searchable?: boolean;
    clearable?: boolean;
    fullWidth?: boolean;
    className?: string;
  }

  // ============================================================================
  // FILE UPLOAD TYPES
  // ============================================================================

  interface FileUploadProps {
    id: string;
    label: string;
    accept?: string;
    description?: string;
    error?: string;
    onChange: (file: File | null) => void;
    value?: File | null;
    required?: boolean;
    maxSize?: number; // in MB
  }

  // ============================================================================
  // TOAST TYPES
  // ============================================================================

  type ToastVariant = "success" | "error" | "warning" | "info";
  type ToastPosition =
    | "top-right"
    | "top-left"
    | "top-center"
    | "bottom-right"
    | "bottom-left"
    | "bottom-center";

  interface ToastProps {
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

  interface ToastContainerProps {
    position?: ToastPosition;
    maxToasts?: number;
  }

  // ============================================================================
  // TOOLTIP TYPES
  // ============================================================================

  type TooltipPlacement =
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "top-start"
    | "top-end"
    | "right-start"
    | "right-end"
    | "bottom-start"
    | "bottom-end"
    | "left-start"
    | "left-end";

  interface TooltipProps {
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

  interface TabItem {
    id: string;
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
    badge?: string | number;
  }

  interface TabsProps extends BaseProps {
    items: TabItem[];
    activeTab: string;
    onChange: (tabId: string) => void;
    variant?: "line" | "enclosed" | "soft-rounded" | "solid-rounded";
    size?: CompactSize;
    isFullWidth?: boolean;
  }

  interface TabPanelProps extends BaseProps {
    children: ReactNode;
    isSelected?: boolean;
  }

  // ============================================================================
  // DROPDOWN/MENU TYPES
  // ============================================================================

  interface MenuItem {
    id: string;
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
    href?: string;
    disabled?: boolean;
    danger?: boolean;
    children?: MenuItem[];
  }

  interface DropdownProps extends BaseProps {
    trigger: ReactNode;
    items: MenuItem[];
    placement?: TooltipPlacement;
    closeOnSelect?: boolean;
  }

  // ============================================================================
  // TABLE TYPES
  // ============================================================================

  interface TableColumn<T = unknown> {
    key: string;
    header: string;
    width?: string | number;
    minWidth?: string | number;
    maxWidth?: string | number;
    align?: "left" | "center" | "right";
    sortable?: boolean;
    render?: (value: unknown, row: T, index: number) => ReactNode;
  }

  interface TableProps<T = unknown> extends BaseProps {
    columns: TableColumn<T>[];
    data: T[];
    isLoading?: boolean;
    emptyMessage?: string;
    onRowClick?: (row: T, index: number) => void;
    selectedRows?: number[];
    onSelectionChange?: (selectedIndexes: number[]) => void;
    sortConfig?: {
      key: string;
      direction: "asc" | "desc";
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

  type ProgressSize = "xs" | "sm" | "md" | "lg";
  type ProgressVariant = "line" | "circle";

  interface ProgressProps extends BaseProps {
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

  type SwitchSize = "sm" | "md" | "lg";

  interface SwitchProps extends BaseProps {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    size?: SwitchSize;
    colorScheme?: BadgeColorScheme;
    isDisabled?: boolean;
    label?: string;
    "aria-label"?: string;
  }

  // ============================================================================
  // CHECKBOX & RADIO TYPES
  // ============================================================================

  interface CheckboxProps extends BaseProps {
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

  interface RadioProps extends Omit<CheckboxProps, "isIndeterminate"> {
    value: string;
  }

  interface RadioGroupProps extends BaseProps {
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    name: string;
    orientation?: "horizontal" | "vertical";
    spacing?: CompactSize;
    children: ReactNode;
  }

  // ============================================================================
  // ACCORDION TYPES
  // ============================================================================

  interface AccordionItem {
    id: string;
    title: string;
    content: ReactNode;
    icon?: ReactNode;
    disabled?: boolean;
  }

  interface AccordionProps extends BaseProps {
    items: AccordionItem[];
    allowMultiple?: boolean;
    defaultExpandedItems?: string[];
    variant?: "outline" | "filled" | "separated";
  }

  // ============================================================================
  // ALERT TYPES
  // ============================================================================

  type AlertStatus = "success" | "error" | "warning" | "info";
  type AlertVariant = "subtle" | "solid" | "left-accent" | "top-accent";

  interface AlertProps extends BaseProps {
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

  interface PopoverProps {
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

  type DrawerPlacement = "left" | "right" | "top" | "bottom";
  type DrawerSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";

  interface DrawerProps {
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

  interface PaginationProps extends BaseProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    siblingCount?: number;
    boundaryCount?: number;
    showFirstLast?: boolean;
    showPrevNext?: boolean;
    size?: CompactSize;
    variant?: "solid" | "outline" | "ghost";
    isDisabled?: boolean;
  }
}
export {};
