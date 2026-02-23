// ============================================================================
// NAVIGATION TYPES - Types for navigation components (Navbar, MegaMenu, etc.)
// ============================================================================

import { ReactNode } from 'react';

// ============================================================================
// NAV ITEM TYPES
// ============================================================================
// ============================================================================
// MOBILE NAVBAR TYPES
// ============================================================================
// ============================================================================
// MEGA MENU TYPES
// ============================================================================
// ============================================================================
// SIDEBAR TYPES
// ============================================================================
// ============================================================================
// BREADCRUMB TYPES
// ============================================================================
// ============================================================================
// TAB NAVIGATION TYPES
// ============================================================================
// ============================================================================
// PAGINATION NAVIGATION TYPES
// ============================================================================
// ============================================================================
// STEPPER NAVIGATION TYPES
// ============================================================================
// ============================================================================
// FOOTER NAVIGATION TYPES
// ============================================================================
// ============================================================================
// COMMAND PALETTE / SEARCH NAV TYPES
// ============================================================================

declare global {
    interface NavItem {
        label: string;
        href: string;
        icon?: ReactNode;
        children?: NavItem[];
        badge?: string | number;
        isExternal?: boolean;
        isDisabled?: boolean;
    }

    interface NavGroup {
        title?: string;
        items: NavItem[];
    }

    interface MobileNavItemProps {
        item: NavItem;
        index: number;
        depth?: number;
    }

    interface MobileNavbarProps {
        items?: NavItem[];
    }

    interface MegaMenuLink {
        label: string;
        url: string;
        description?: string;
        icon?: ReactNode;
        isNew?: boolean;
    }

    interface MegaMenuContent {
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

    interface MegaMenuSection {
        label: string;
        href: string;
        megaContent: MegaMenuContent | null;
    }

    interface MegaNavbarProps {
        sections?: MegaMenuSection[];
    }

    interface SidebarItem {
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

    interface SidebarSection {
        title?: string;
        items: SidebarItem[];
    }

    interface SidebarProps {
        sections: SidebarSection[];
        isCollapsed?: boolean;
        onCollapse?: () => void;
        activeItem?: string;
        onItemClick?: (item: SidebarItem) => void;
        header?: ReactNode;
        footer?: ReactNode;
        className?: string;
    }

    interface BreadcrumbItem {
        label: string;
        href?: string;
        icon?: ReactNode;
        isCurrent?: boolean;
    }

    interface BreadcrumbProps {
        items: BreadcrumbItem[];
        separator?: ReactNode;
        maxItems?: number;
        className?: string;
    }

    interface TabNavItem {
        id: string;
        label: string;
        href?: string;
        icon?: ReactNode;
        badge?: string | number;
        isDisabled?: boolean;
    }

    interface TabNavigationProps {
        items: TabNavItem[];
        activeItem: string;
        onChange?: (itemId: string) => void;
        variant?: 'line' | 'enclosed' | 'pills';
        size?: 'sm' | 'md' | 'lg';
        isFullWidth?: boolean;
        className?: string;
    }

    interface PaginationNavProps {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
        siblingCount?: number;
        showFirstLast?: boolean;
        showPrevNext?: boolean;
        className?: string;
    }

    interface StepItem {
        id: string;
        label: string;
        description?: string;
        icon?: ReactNode;
        isOptional?: boolean;
        isCompleted?: boolean;
        isError?: boolean;
    }

    interface StepperProps {
        steps: StepItem[];
        activeStep: number;
        onChange?: (step: number) => void;
        orientation?: 'horizontal' | 'vertical';
        variant?: 'simple' | 'circles' | 'bullets';
        size?: 'sm' | 'md' | 'lg';
        isClickable?: boolean;
        className?: string;
    }

    interface FooterColumn {
        title: string;
        links: FooterLink[];
    }

    interface FooterLink {
        label: string;
        href: string;
        isExternal?: boolean;
        icon?: ReactNode;
    }

    interface FooterProps {
        columns: FooterColumn[];
        socialLinks?: SocialLink[];
        copyright?: string;
        logo?: ReactNode;
        className?: string;
    }

    interface SocialLink {
        platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'github';
        href: string;
        label?: string;
    }

    interface CommandItem {
        id: string;
        label: string;
        description?: string;
        icon?: ReactNode;
        shortcut?: string;
        category?: string;
        action: () => void;
    }

    interface CommandPaletteProps {
        isOpen: boolean;
        onClose: () => void;
        items: CommandItem[];
        placeholder?: string;
        emptyMessage?: string;
        recentItems?: CommandItem[];
        className?: string;
    }
}
export {};
