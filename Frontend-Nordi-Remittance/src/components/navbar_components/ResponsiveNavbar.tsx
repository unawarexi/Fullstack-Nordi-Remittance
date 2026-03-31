// ============================================================================
// RESPONSIVE NAVBAR - Main navbar with mobile/desktop switching
// ============================================================================

import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@utils/cn";
import { Menu, Search, Lock, Globe, ChevronDown, X } from "lucide-react";
import { Button } from "@components/ui/Button";
import { useIsMobile, useBreakpoint } from "@hooks/index";
import { useNavbar } from "@contexts/navbar-context";
import MobileNavbar from "./MobileNavbar";
import MegaNavbar from "./MegaNavbar";
import InternetBankingSideBar from "./InternetBankingSideBar";
import { ThemeToggle } from "@components/shared/ThemeToggle";
import { CountrySelect } from "@components/shared/CountrySelect";
import Images from '@constants/images';

// ========================
// NAV ITEMS DATA
// ========================
const navItems = [
  { label: "Home", href: "/" },
  { label: "Personal", href: "/personal" },
  { label: "Business", href: "/business" },
  { label: "Corporate", href: "/corporate" },
  { label: "Private", href: "/private-banking" },
  { label: "Ways to Bank", href: "/ways-to-bank" },
  { label: "Contact Us", href: "/contact" },
];

const topNavItems = [
  "About Us",
  "Sustainable Banking",
  "Investor Relations",
  "Media",
  "Careers",
  "Branch & ATM Locator",
  "Market Rates",
  "HELP",
];

// ========================
// RESPONSIVE SUB NAVBAR
// ========================
const SubNavBar: React.FC = () => {
  const { isMdUp } = useBreakpoint();

  return (
    <div className="w-full border-b border-border-primary bg-surface-secondary dark:bg-neutral-900">
      <div className="container mx-auto px-4 py-1 sm:py-3">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          {/* Nav Items - Hidden on mobile, visible on md+ */}
          <div
            className={cn(
              "flex-wrap items-center gap-4 text-xs sm:text-sm",
              isMdUp ? "flex" : "hidden",
            )}
          >
            {topNavItems.map((item, index) => (
              <a
                key={index}
                href={`#${item.replace(/\s+/g, "-").toLowerCase()}`}
                className="whitespace-nowrap text-foreground-secondary transition-colors hover:text-primary-600 dark:hover:text-primary-400"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Country Selector - Always visible but smaller on mobile */}
          <div className="flex items-center gap-2 z-50">
            <Globe size={16} className="text-foreground-muted hidden sm:block" />
            <CountrySelect compact={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================
// DESKTOP NAV ITEMS
// ========================
const DesktopNavItems: React.FC = () => {
  const { activeMegaMenuItem, handleMegaMenuMouseEnter } = useNavbar();

  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {navItems.map((item, index) => (
        <div
          key={index}
          className="relative"
          onMouseEnter={() => handleMegaMenuMouseEnter(item.label)}
        >
          <Link
            to={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-all",
              "hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-primary-600 dark:text-neutral-200 dark:hover:text-primary-400",
              activeMegaMenuItem === item.label && "bg-amber-50 dark:bg-amber-950/30 text-amber-500",
            )}
          >
            {item.label}
            {item.label !== "Home" && (
              <ChevronDown size={14} className="ml-1 inline" />
            )}
          </Link>
        </div>
      ))}
    </nav>
  );
};

// ========================
// SEARCH BAR
// ========================
const SearchBar: React.FC<{ className?: string }> = ({ className }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: 200, opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              className="w-full rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 py-2 pl-10 pr-8 text-sm dark:text-neutral-200 outline-none focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:placeholder-neutral-500"
              onBlur={() => setIsExpanded(false)}
            />
            <Search size={16} className="absolute left-3 text-neutral-400 dark:text-neutral-500" />
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute right-2 rounded-full p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              <X size={14} className="text-neutral-500 dark:text-neutral-400" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsExpanded(true)}
            className="rounded-full bg-neutral-100 dark:bg-neutral-800 p-2.5 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <Search size={18} className="text-neutral-600 dark:text-neutral-300" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

// ========================
// MAIN RESPONSIVE NAVBAR
// ========================
export const ResponsiveNavbar: React.FC = () => {
  const {
    isScrolled,
    activeMegaMenuItem,
    handleMegaMenuMouseLeave,
    handleMegaMenuContentEnter,
    handleMegaMenuContentLeave,
    openMobileMenu,
    isSidebarOpen,
    toggleSidebar,
  } = useNavbar();

  const navRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { isLgUp } = useBreakpoint();

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-[90] transition-all duration-300",
          isScrolled ? "shadow-lg" : "",
        )}
      >
        {/* Sub NavBar - Hidden on scroll on mobile */}
        <div
          className={cn(
            "transition-all duration-300",
            isScrolled && isMobile ? "h-0 overflow-hidden" : "",
          )}
        >
          <SubNavBar />
        </div>

        {/* Main NavBar */}
        <div
          ref={navRef}
          onMouseLeave={handleMegaMenuMouseLeave}
          className={cn(
            "bg-surface-primary/95 border-b border-border-primary backdrop-blur-md dark:bg-neutral-900/95",
            isScrolled ? "py-1.5" : "py-2 sm:py-4",
          )}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-4">
              {/* Logo */}
              <Link to="/" className="flex-shrink-0">
                <img
                  src={Images.headerLogo}
                  alt="Nordea"
                  className={cn(
                    "transition-all duration-300",
                    isScrolled ? "w-24 sm:w-32" : "w-28 sm:w-40",
                  )}
                />
              </Link>

              {/* Desktop Navigation */}
              {isLgUp && (
                <div className="flex flex-1 items-center justify-center">
                  <DesktopNavItems />
                </div>
              )}

              {/* Right Section */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Theme Toggle */}
                <ThemeToggle size="md" className="hidden sm:flex" />

                {/* Search - Hidden on very small screens */}
                <div className="hidden sm:block">
                  <SearchBar />
                </div>

                {/* Internet Banking Button */}
                <Button
                  variant="primary"
                  size={isMobile ? "sm" : "md"}
                  onClick={() =>
                    isMobile ? openMobileMenu() : toggleSidebar()
                  }
                  className="hidden bg-blue-700 hover:bg-blue-800 sm:flex"
                >
                  <Lock size={16} className="mr-1 sm:mr-2" />
                  <span className="hidden md:inline">Internet Banking</span>
                  <span className="md:hidden">Login</span>
                </Button>

                {/* Mobile Menu Button */}
                <button
                  onClick={openMobileMenu}
                  className="rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu size={24} className="text-neutral-700 dark:text-neutral-200" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mega Menu - Desktop only, Fixed below navbar */}
        <AnimatePresence>
          {isLgUp && activeMegaMenuItem && activeMegaMenuItem !== "Home" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg"
              onMouseEnter={handleMegaMenuContentEnter}
              onMouseLeave={handleMegaMenuContentLeave}
            >
              <MegaNavbar />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Navigation */}
      <MobileNavbar />

      {/* Internet Banking Sidebar */}
      {!isMobile && <InternetBankingSideBar />}

      {/* Spacer for fixed header */}
      <div
        className={cn(
          "transition-all duration-300",
          isScrolled ? "h-12 sm:h-20" : "h-[85px] sm:h-32 lg:h-36",
        )}
      />
    </>
  );
};

export default ResponsiveNavbar;
