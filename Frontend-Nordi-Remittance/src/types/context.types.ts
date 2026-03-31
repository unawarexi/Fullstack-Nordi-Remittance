// ============================================================================
// CONTEXT TYPES - Types for all React Context providers
// ============================================================================

import { ReactNode } from 'react';

// ============================================================================
// NAVBAR CONTEXT TYPES
// ============================================================================
// ============================================================================
// CONTEXT STORE TYPES
// ============================================================================
// ============================================================================
// AUTH CONTEXT TYPES
// ============================================================================
// ============================================================================
// THEME CONTEXT TYPES
// ============================================================================

// ThemeMode is defined in common.types.ts
// ============================================================================
// TOAST CONTEXT TYPES
// ============================================================================
// ============================================================================
// MODAL CONTEXT TYPES
// ============================================================================
// ============================================================================
// SIDEBAR/DRAWER CONTEXT TYPES
// ============================================================================
// ============================================================================
// USER PREFERENCES CONTEXT TYPES
// ============================================================================
// ============================================================================
// LOADING CONTEXT TYPES
// ============================================================================
// ============================================================================
// CONFIRMATION CONTEXT TYPES
// ============================================================================

declare global {
    interface NavbarContextType {
        isMobileMenuOpen: boolean;
        openMobileMenu: () => void;
        closeMobileMenu: () => void;
        toggleMobileMenu: () => void;
        activeMegaMenuItem: string | null;
        setActiveMegaMenuItem: (item: string | null) => void;
        isHoveringMegaMenu: boolean;
        setIsHoveringMegaMenu: (hovering: boolean) => void;
        handleMegaMenuMouseEnter: (item: string) => void;
        handleMegaMenuMouseLeave: () => void;
        handleMegaMenuContentEnter: () => void;
        handleMegaMenuContentLeave: () => void;
        isSidebarOpen: boolean;
        openSidebar: () => void;
        closeSidebar: () => void;
        toggleSidebar: () => void;
        handleSidebarMouseEnter: () => void;
        handleSidebarMouseLeave: () => void;
        isScrolled: boolean;
        closeAll: () => void;
        country: { code: string; name: string; flag: string } | null;
        setCountry: (country: { code: string; name: string; flag: string } | null) => void;
    }

    interface NavbarProviderProps {
        children: ReactNode;
    }

    /** Provider with additional props */
    interface ProviderWithProps {
        Provider: ProviderComponent;
        props?: Record<string, unknown>;
    }

    interface ContextStoreProps {
        children: ReactNode;
    }

    interface AuthUser {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatar?: string;
        role: 'admin' | 'user' | 'support';
    }

    interface AuthState {
        user: AuthUser | null;
        isAuthenticated: boolean;
        isLoading: boolean;
        error: string | null;
    }

    interface AuthContextType extends AuthState {
        login: (email: string, password: string) => Promise<void>;
        logout: () => Promise<void>;
        register: (data: RegisterData) => Promise<void>;
        resetPassword: (email: string) => Promise<void>;
        updateProfile: (data: Partial<AuthUser>) => Promise<void>;
        clearError: () => void;
    }

    interface RegisterData {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
    }

    interface AuthProviderProps {
        children: ReactNode;
    }

    interface ThemeContextType {
        theme: ThemeMode;
        setTheme: (theme: ThemeMode) => void;
        toggleTheme: () => void;
        isDark: boolean;
    }

    interface ThemeProviderProps {
        children: ReactNode;
        defaultTheme?: ThemeMode;
        storageKey?: string;
    }

    interface Toast {
        id: string;
        type: ToastType;
        title: string;
        message?: string;
        duration?: number;
        isClosable?: boolean;
    }

    interface ToastContextType {
        toasts: Toast[];
        addToast: (toast: Omit<Toast, 'id'>) => string;
        removeToast: (id: string) => void;
        clearToasts: () => void;
        success: (title: string, message?: string) => string;
        error: (title: string, message?: string) => string;
        warning: (title: string, message?: string) => string;
        info: (title: string, message?: string) => string;
    }

    interface ToastProviderProps {
        children: ReactNode;
        position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
        maxToasts?: number;
    }

    interface ModalState {
        id: string;
        isOpen: boolean;
        data?: unknown;
    }

    interface ModalContextType {
        modals: Map<string, ModalState>;
        openModal: (id: string, data?: unknown) => void;
        closeModal: (id: string) => void;
        closeAllModals: () => void;
        isModalOpen: (id: string) => boolean;
        getModalData: <T = unknown>(id: string) => T | undefined;
    }

    interface ModalProviderProps {
        children: ReactNode;
    }

    interface SidebarContextType {
        isOpen: boolean;
        isCollapsed: boolean;
        open: () => void;
        close: () => void;
        toggle: () => void;
        collapse: () => void;
        expand: () => void;
        toggleCollapse: () => void;
    }

    interface SidebarProviderProps {
        children: ReactNode;
        defaultOpen?: boolean;
        defaultCollapsed?: boolean;
    }

    interface UserPreferences {
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

    interface UserPreferencesContextType {
        preferences: UserPreferences;
        updatePreferences: (prefs: Partial<UserPreferences>) => void;
        resetPreferences: () => void;
    }

    interface UserPreferencesProviderProps {
        children: ReactNode;
        defaultPreferences?: Partial<UserPreferences>;
    }

    interface LoadingContextType {
        isLoading: boolean;
        loadingMessage: string | null;
        startLoading: (message?: string) => void;
        stopLoading: () => void;
        setLoadingMessage: (message: string) => void;
    }

    interface LoadingProviderProps {
        children: ReactNode;
    }

    interface ConfirmationOptions {
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        isDestructive?: boolean;
    }

    interface ConfirmationContextType {
        confirm: (options: ConfirmationOptions) => Promise<boolean>;
        isOpen: boolean;
        options: ConfirmationOptions | null;
    }

    interface ConfirmationProviderProps {
        children: ReactNode;
    }

    /** Generic provider component type */
    type ProviderComponent = React.FC<{ children: ReactNode }>;
    type ToastType = 'success' | 'error' | 'warning' | 'info';
}
export {};
