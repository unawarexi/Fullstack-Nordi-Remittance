// ============================================================================
// NAVBAR CONTEXT - Single source of truth for all navbar state management
// ============================================================================

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import Countries from '../core/data/Countries';
import { useGeoLocation } from '../hooks/useGeoLocation';

// ========================
// CONTEXT CREATION
// ========================
const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

// ========================
// PROVIDER COMPONENT
// ========================
export const NavbarProvider: React.FC<NavbarProviderProps> = ({ children }) => {
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mega menu state
  const [activeMegaMenuItem, setActiveMegaMenuItem] = useState<string | null>(null);
  const [isHoveringMegaMenu, setIsHoveringMegaMenu] = useState(false);
  const megaMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Internet banking sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll state
  const [isScrolled, setIsScrolled] = useState(false);

  // Country state
  const [country, setCountry] = useState<{ code: string; name: string; flag: string } | null>(null);


  // SCROLL HANDLER

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // BODY SCROLL LOCK

  useEffect(() => {
    if (isMobileMenuOpen || isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, isSidebarOpen]);


  // MOBILE MENU HANDLERS

  const openMobileMenu = useCallback(() => {
    setIsSidebarOpen(false); // Close sidebar when opening mobile menu
    setActiveMegaMenuItem(null); // Close mega menu
    setIsMobileMenuOpen(true);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    if (isMobileMenuOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }, [isMobileMenuOpen, closeMobileMenu, openMobileMenu]);


  // MEGA MENU HANDLERS

  const handleMegaMenuMouseEnter = useCallback((item: string) => {
    // Clear any pending close timeout
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
      megaMenuTimeoutRef.current = null;
    }
    setActiveMegaMenuItem(item);
  }, []);

  const handleMegaMenuMouseLeave = useCallback(() => {
    // Add small delay before closing to allow mouse to enter mega menu content
    megaMenuTimeoutRef.current = setTimeout(() => {
      if (!isHoveringMegaMenu) {
        setActiveMegaMenuItem(null);
      }
    }, 150);
  }, [isHoveringMegaMenu]);

  const handleMegaMenuContentEnter = useCallback(() => {
    // Clear close timeout when entering mega menu content
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
      megaMenuTimeoutRef.current = null;
    }
    setIsHoveringMegaMenu(true);
  }, []);

  const handleMegaMenuContentLeave = useCallback(() => {
    setIsHoveringMegaMenu(false);
    setActiveMegaMenuItem(null);
  }, []);


  // SIDEBAR HANDLERS

  const openSidebar = useCallback(() => {
    setIsMobileMenuOpen(false); // Close mobile menu when opening sidebar
    setActiveMegaMenuItem(null); // Close mega menu
    setIsSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (isSidebarOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }, [isSidebarOpen, closeSidebar, openSidebar]);

  const handleSidebarMouseEnter = useCallback(() => {
    // Clear any pending close timeout
    if (sidebarTimeoutRef.current) {
      clearTimeout(sidebarTimeoutRef.current);
      sidebarTimeoutRef.current = null;
    }
    setIsSidebarOpen(true);
  }, []);

  const handleSidebarMouseLeave = useCallback(() => {
    // Add small delay before closing
    sidebarTimeoutRef.current = setTimeout(() => {
      setIsSidebarOpen(false);
    }, 200);
  }, []);


  // CLOSE ALL

  const closeAll = useCallback(() => {
    setIsMobileMenuOpen(false);
    setActiveMegaMenuItem(null);
    setIsHoveringMegaMenu(false);
    setIsSidebarOpen(false);
  }, []);


  // COUNTRY AUTO-DETECTION - Using refactored hook
  const { detectedCountry } = useGeoLocation();

  useEffect(() => {
    // If user hasn't manually selected yet, and we have a detection
    if (!country && detectedCountry) {
      setCountry({
        code: detectedCountry.code,
        name: detectedCountry.name,
        flag: detectedCountry.flag,
      });
    }
  }, [detectedCountry, country]);


  // CLEANUP TIMEOUTS


  // CONTEXT VALUE

  const value: NavbarContextType = {
    // Mobile menu
    isMobileMenuOpen,
    openMobileMenu,
    closeMobileMenu,
    toggleMobileMenu,

    // Mega menu
    activeMegaMenuItem,
    setActiveMegaMenuItem,
    isHoveringMegaMenu,
    setIsHoveringMegaMenu,
    handleMegaMenuMouseEnter,
    handleMegaMenuMouseLeave,
    handleMegaMenuContentEnter,
    handleMegaMenuContentLeave,

    // Sidebar
    isSidebarOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    handleSidebarMouseEnter,
    handleSidebarMouseLeave,

    // Scroll
    isScrolled,

    // Country
    country,
    setCountry,

    // Close all
    closeAll,
  };

  return (
    <NavbarContext.Provider value={value}>
      {children}
    </NavbarContext.Provider>
  );
};

// ========================
// CUSTOM HOOK
// ========================
export const useNavbar = (): NavbarContextType => {
  const context = useContext(NavbarContext);
  if (context === undefined) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
};

export default NavbarContext;
