// ============================================================================
// GLOBAL TYPE DECLARATIONS - Auto-imported types across the application
// ============================================================================
// This file makes commonly used types globally available without explicit imports.
// Types defined here can be used anywhere in the project.
// ============================================================================

// Re-export all types as global namespace
import type {
  // Common types
  ChildrenProps,
  OptionalChildrenProps,
  ClassNameProps,
  BaseComponentProps,
  BaseProps,
  IconProps,
  SizeVariant,
  CompactSize,
  StatusType,
  LoadingState,
  ClickHandler,
  ChangeHandler,
  SubmitHandler,
  KeyValue,
  LabelValue,
  PaginationParams,
  PaginationMeta,
  PaginatedData,
  SortDirection,
  SortConfig,
  DateRange,
  Coordinates,
  Breakpoint,
  ResponsiveValue,
  ThemeMode,
  ColorScheme,
} from './common.types';

import type {
  // UI Component types
  ButtonVariant,
  ButtonSize,
  ButtonProps,
  IconButtonProps,
  InputSize,
  InputVariant,
  InputProps,
  TextareaProps,
  CardVariant,
  CardSize,
  CardProps,
  CardHeaderProps,
  CardContentProps,
  CardFooterProps,
  StatCardProps,
  BadgeVariant,
  BadgeSize,
  BadgeColorScheme,
  BadgeProps,
  StatusBadgeType,
  StatusBadgeProps,
  NotificationBadgeProps,
  AvatarSize,
  AvatarProps,
  AvatarGroupProps,
  ModalSize,
  ModalProps,
  ConfirmModalProps,
  AlertModalProps,
  SpinnerSize,
  SpinnerVariant,
  SpinnerProps,
  SkeletonProps,
  PageLoaderProps,
  OverlayLoaderProps,
  SelectSize,
  SelectOption,
  SelectProps,
  ToastVariant,
  ToastPosition,
  ToastProps,
  TooltipPlacement,
  TooltipProps,
  TabItem,
  TabsProps,
  MenuItem,
  DropdownProps,
  TableColumn,
  TableProps,
  ProgressSize,
  ProgressVariant,
  ProgressProps,
  SwitchSize,
  SwitchProps,
  CheckboxProps,
  RadioProps,
  RadioGroupProps,
  AccordionItem,
  AccordionProps,
  AlertStatus,
  AlertVariant,
  AlertProps,
  DrawerPlacement,
  DrawerSize,
  DrawerProps,
  PaginationProps,
} from './ui.types';

import type {
  // Context types
  NavbarContextType,
  NavbarProviderProps,
  ProviderComponent,
  ProviderWithProps,
  ContextStoreProps,
  AuthUser,
  AuthState,
  AuthContextType,
  ToastType,
  Toast,
  ToastContextType,
  ModalState,
  ModalContextType,
  SidebarContextType,
  UserPreferences,
  UserPreferencesContextType,
  LoadingContextType,
  ConfirmationOptions,
  ConfirmationContextType,
} from './context.types';

import type {
  // Navigation types
  NavItem,
  NavGroup,
  MobileNavItemProps,
  MobileNavbarProps,
  MegaMenuLink,
  MegaMenuContent,
  MegaMenuSection,
  MegaNavbarProps,
  SidebarItem,
  SidebarSection,
  SidebarProps,
  TabNavItem,
  TabNavigationProps,
  StepItem,
  StepperProps,
  FooterColumn,
  FooterLink,
  FooterProps,
  SocialLink,
  CommandItem,
  CommandPaletteProps,
} from './navigation.types';

import type {
  // Layout types
  SectionSize,
  SectionBackground,
  SectionProps,
  SectionHeaderProps,
  ContainerMaxWidth,
  ContainerProps,
  GridColumns,
  GridGap,
  GridProps,
  GridItemProps,
  FlexDirection,
  FlexAlign,
  FlexJustify,
  FlexWrap,
  FlexGap,
  FlexProps,
  SpacerSize,
  SpacerProps,
  DividerOrientation,
  DividerVariant,
  DividerProps,
  StackProps,
  HStackProps,
  VStackProps,
  BoxProps,
  CenterProps,
  AspectRatioValue,
  AspectRatioProps,
  SimpleGridProps,
  MainLayoutProps,
  DashboardLayoutProps,
  AuthLayoutProps,
  PageLayoutProps,
  PageHeaderProps,
  PageContentProps,
  SplitLayoutProps,
  StickyProps,
  ScrollAreaProps,
  CollapseProps,
} from './layout.types';

import type {
  // Form types
  FormFieldBase,
  TextFieldProps,
  NumberFieldProps,
  TextAreaFieldProps,
  SelectFieldProps,
  SelectFieldOption,
  CheckboxFieldProps,
  RadioFieldProps,
  RadioOption,
  SwitchFieldProps,
  DateFieldProps,
  DateRangeFieldProps,
  FileFieldProps,
  SliderFieldProps,
  SliderMark,
  FormProps,
  FormGroupProps,
  FormSectionProps,
  FormActionsProps,
  ValidationRule,
  FieldValidation,
  FormError,
  FormState,
  LoginFormValues,
  SignupFormValues,
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
  ProfileFormValues,
  AddressFormValues,
  BankAccountFormValues,
  TransferFormValues,
  ContactFormValues,
  WizardStep,
  WizardProps,
  WizardState,
  OTPInputProps,
  PinInputProps,
  SearchFormProps,
  SearchSuggestion,
  FilterOption,
  FilterFormProps,
} from './form.types';

import type {
  // Page types
  HeroSlide,
  HeroCarouselProps,
  HeroSectionProps,
  Feature,
  FeatureCardProps,
  FeatureSectionProps,
  Testimonial,
  TestimonialCardProps,
  TestimonialSectionProps,
  Statistic,
  StatisticCardProps,
  StatisticsSectionProps,
  TeamMember,
  TeamMemberCardProps,
  TeamSectionProps,
  PricingPlan,
  PricingCardProps,
  PricingSectionProps,
  FAQItem,
  FAQSectionProps,
  CTASectionProps,
  NewsArticle,
  NewsCardProps,
  NewsSectionProps,
  Product,
  ProductCardProps,
  ProductSectionProps,
  Location,
  LocationCardProps,
  LocationSectionProps,
  BankingAccount,
  BankingAccountCardProps,
  LoanProduct,
  LoanProductCardProps,
  CreditCardProduct,
  CreditCardProductCardProps,
  InterestRate,
  InterestRateTableProps,
  SupportChannel,
  SupportCardProps,
  SupportSectionProps,
  RewardTier,
  RewardItem,
  RewardsSectionProps,
  QuickLink,
  QuickLinksSectionProps,
  BannerProps,
  PageMeta,
  PageProps,
} from './pages.types';

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
