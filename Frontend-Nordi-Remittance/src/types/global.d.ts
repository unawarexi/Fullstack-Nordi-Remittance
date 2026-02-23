// ============================================================================
// GLOBAL TYPE DECLARATIONS - Auto-imported types across the application
// ============================================================================
// This file makes commonly used types globally available without explicit imports.
// Types defined here can be used anywhere in the project.
// ============================================================================

// Re-export all types as global namespace
// Declare global types
declare global {
  // Common
  type GlobalChildrenProps = ChildrenProps;
  type GlobalClassNameProps = ClassNameProps;
  type GlobalBaseProps = BaseProps;
  type GlobalSizeVariant = SizeVariant;
  type GlobalStatusType = StatusType;
  type GlobalLoadingState = LoadingState;
  type GlobalThemeMode = ThemeMode;
  type GlobalBreakpoint = Breakpoint;

  // UI
  type GlobalButtonVariant = ButtonVariant;
  type GlobalButtonSize = ButtonSize;
  type GlobalInputSize = InputSize;
  type GlobalCardVariant = CardVariant;
  type GlobalBadgeVariant = BadgeVariant;
  type GlobalAvatarSize = AvatarSize;
  type GlobalModalSize = ModalSize;
  type GlobalSpinnerSize = SpinnerSize;
  type GlobalToastVariant = ToastVariant;
  type GlobalAlertStatus = AlertStatus;

  // Navigation
  type GlobalNavItem = NavItem;
  type GlobalSidebarItem = SidebarItem;
  type GlobalBreadcrumbItem = BreadcrumbItem;
  type GlobalMenuItem = MenuItem;
}

export {};
