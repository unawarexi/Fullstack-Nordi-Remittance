// ============================================================================
// CONTEXT TYPES - Types for all React Context providers
// ============================================================================

import { ReactNode } from 'react';

// ============================================================================
// NAVBAR CONTEXT TYPES
// ============================================================================

export interface NavbarContextType {
  // Mobile menu state
  isMobileMenuOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;

  // Mega menu state
  activeMegaMenuItem: string | null;
  setActiveMegaMenuItem: (item: string | null) => void;
  isHoveringMegaMenu: boolean;
  setIsHoveringMegaMenu: (hovering: boolean) => void;
  handleMegaMenuMouseEnter: (item: string) => void;
  handleMegaMenuMouseLeave: () => void;
  handleMegaMenuContentEnter: () => void;
  handleMegaMenuContentLeave: () => void;

  // Internet banking sidebar state
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  handleSidebarMouseEnter: () => void;
  handleSidebarMouseLeave: () => void;

  // Scroll state
  isScrolled: boolean;

  // Close all modals/menus
  closeAll: () => void;
}

export interface NavbarProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXT STORE TYPES
// ============================================================================

/** Generic provider component type */
export type ProviderComponent = React.FC<{ children: ReactNode }>;

/** Provider with additional props */
export interface ProviderWithProps {
  Provider: ProviderComponent;
  props?: Record<string, unknown>;
}

export interface ContextStoreProps {
  children: ReactNode;
}

// ============================================================================
// AUTH CONTEXT TYPES
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'admin' | 'user' | 'support';
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  clearError: () => void;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthProviderProps {
  children: ReactNode;
}

// ============================================================================
// THEME CONTEXT TYPES
// ============================================================================

// ThemeMode is defined in common.types.ts
import type { ThemeMode } from './common.types';

export interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

// ============================================================================
// TOAST CONTEXT TYPES
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  isClosable?: boolean;
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
}

export interface ToastProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

// ============================================================================
// MODAL CONTEXT TYPES
// ============================================================================

export interface ModalState {
  id: string;
  isOpen: boolean;
  data?: unknown;
}

export interface ModalContextType {
  modals: Map<string, ModalState>;
  openModal: (id: string, data?: unknown) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  isModalOpen: (id: string) => boolean;
  getModalData: <T = unknown>(id: string) => T | undefined;
}

export interface ModalProviderProps {
  children: ReactNode;
}

// ============================================================================
// SIDEBAR/DRAWER CONTEXT TYPES
// ============================================================================

export interface SidebarContextType {
  isOpen: boolean;
  isCollapsed: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  collapse: () => void;
  expand: () => void;
  toggleCollapse: () => void;
}

export interface SidebarProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
  defaultCollapsed?: boolean;
}

// ============================================================================
// USER PREFERENCES CONTEXT TYPES
// ============================================================================

export interface UserPreferences {
  currency: string;
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

export interface UserPreferencesProviderProps {
  children: ReactNode;
  defaultPreferences?: Partial<UserPreferences>;
}

// ============================================================================
// LOADING CONTEXT TYPES
// ============================================================================

export interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string | null;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  setLoadingMessage: (message: string) => void;
}

export interface LoadingProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONFIRMATION CONTEXT TYPES
// ============================================================================

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
  isOpen: boolean;
  options: ConfirmationOptions | null;
}

export interface ConfirmationProviderProps {
  children: ReactNode;
}
