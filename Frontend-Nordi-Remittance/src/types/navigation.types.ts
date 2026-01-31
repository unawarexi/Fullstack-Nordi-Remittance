// ============================================================================
// NAVIGATION TYPES - Types for navigation components (Navbar, MegaMenu, etc.)
// ============================================================================

import { ReactNode } from 'react';

// ============================================================================
// NAV ITEM TYPES
// ============================================================================

export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  children?: NavItem[];
  badge?: string | number;
  isExternal?: boolean;
  isDisabled?: boolean;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

// ============================================================================
// MOBILE NAVBAR TYPES
// ============================================================================

export interface MobileNavItemProps {
  item: NavItem;
  index: number;
  depth?: number;
}

export interface MobileNavbarProps {
  items?: NavItem[];
}

// ============================================================================
// MEGA MENU TYPES
// ============================================================================

export interface MegaMenuLink {
  label: string;
  url: string;
  description?: string;
  icon?: ReactNode;
  isNew?: boolean;
}

export interface MegaMenuContent {
  leftHeader: string;
  leftLinks: MegaMenuLink[];
  rightHeader: string;
  rightDescription: string;
  imageSrc: string;
  imageAlt: string;
  imageCaption: string;
  buttonText: string;
  buttonHref?: string;
}

export interface MegaMenuSection {
  label: string;
  href: string;
  megaContent: MegaMenuContent | null;
}

export interface MegaNavbarProps {
  sections?: MegaMenuSection[];
}

// ============================================================================
// SIDEBAR TYPES
// ============================================================================

export interface SidebarItem {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  badge?: string | number;
  badgeColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  children?: SidebarItem[];
  isDisabled?: boolean;
  onClick?: () => void;
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  sections: SidebarSection[];
  isCollapsed?: boolean;
  onCollapse?: () => void;
  activeItem?: string;
  onItemClick?: (item: SidebarItem) => void;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

// ============================================================================
// BREADCRUMB TYPES
// ============================================================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  isCurrent?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  maxItems?: number;
  className?: string;
}

// ============================================================================
// TAB NAVIGATION TYPES
// ============================================================================

export interface TabNavItem {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  badge?: string | number;
  isDisabled?: boolean;
}

export interface TabNavigationProps {
  items: TabNavItem[];
  activeItem: string;
  onChange?: (itemId: string) => void;
  variant?: 'line' | 'enclosed' | 'pills';
  size?: 'sm' | 'md' | 'lg';
  isFullWidth?: boolean;
  className?: string;
}

// ============================================================================
// PAGINATION NAVIGATION TYPES
// ============================================================================

export interface PaginationNavProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  className?: string;
}

// ============================================================================
// STEPPER NAVIGATION TYPES
// ============================================================================

export interface StepItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  isOptional?: boolean;
  isCompleted?: boolean;
  isError?: boolean;
}

export interface StepperProps {
  steps: StepItem[];
  activeStep: number;
  onChange?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'simple' | 'circles' | 'bullets';
  size?: 'sm' | 'md' | 'lg';
  isClickable?: boolean;
  className?: string;
}

// ============================================================================
// FOOTER NAVIGATION TYPES
// ============================================================================

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterLink {
  label: string;
  href: string;
  isExternal?: boolean;
  icon?: ReactNode;
}

export interface FooterProps {
  columns: FooterColumn[];
  socialLinks?: SocialLink[];
  copyright?: string;
  logo?: ReactNode;
  className?: string;
}

export interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'github';
  href: string;
  label?: string;
}

// ============================================================================
// COMMAND PALETTE / SEARCH NAV TYPES
// ============================================================================

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: string;
  category?: string;
  action: () => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  items: CommandItem[];
  placeholder?: string;
  emptyMessage?: string;
  recentItems?: CommandItem[];
  className?: string;
}
