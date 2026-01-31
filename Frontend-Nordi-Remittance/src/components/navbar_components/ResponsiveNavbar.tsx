// ============================================================================
// RESPONSIVE NAVBAR - Main navbar with mobile/desktop switching
// ============================================================================

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '@utils/cn';
import { Menu, Search, Lock, Globe, ChevronDown, X } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { useIsMobile, useBreakpoint } from '@hooks/index';
import { useNavbar } from '@contexts/navbar-context';
import MobileNavbar from './MobileNavbar';
import MegaNavbar from './MegaNavbar';
import InternetBankingSideBar from './InternetBankingSideBar';
import Countries from '@core/data/Countries';
import Images from '@utils/constants/Image_strings';

// ========================
// NAV ITEMS DATA
// ========================
const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Personal', href: '/personal' },
  { label: 'Business', href: '/business' },
  { label: 'Corporate', href: '/corporate' },
  { label: 'Private', href: '/private-banking' },
  { label: 'Ways to Bank', href: '/ways-to-bank' },
  { label: 'Contact Us', href: '/contact' },
];

const topNavItems = [
  'About Us',
  'Sustainable Banking',
  'Investor Relations',
  'Media',
  'Careers',
  'Branch & ATM Locator',
  'Market Rates',
  'HELP',
];

// ========================
// RESPONSIVE SUB NAVBAR
// ========================
const SubNavBar: React.FC = () => {
  const { isMdUp } = useBreakpoint();

  return (
    <div className="w-full bg-slate-200 border-b border-neutral-200">
      <div className="container mx-auto px-4 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Nav Items - Hidden on mobile, visible on md+ */}
          <div className={cn(
            'flex-wrap items-center gap-4 text-xs sm:text-sm',
            isMdUp ? 'flex' : 'hidden'
          )}>
            {topNavItems.map((item, index) => (
              <a
                key={index}
                href={`#${item.replace(/\s+/g, '-').toLowerCase()}`}
                className="text-neutral-600 hover:text-primary-600 transition-colors whitespace-nowrap"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Country Selector - Always visible but smaller on mobile */}
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-neutral-500" />
            <select className="bg-transparent border border-neutral-300 rounded-md px-2 py-1 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary-500">
              {Countries.slice(0, 10).map((country, index) => (
                <option key={index} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
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
    <nav className="hidden lg:flex items-center gap-1">
      {navItems.map((item, index) => (
        <div
          key={index}
          className="relative"
          onMouseEnter={() => handleMegaMenuMouseEnter(item.label)}
        >
          <Link
            to={item.href}
            className={cn(
              'px-3 py-2 text-sm font-medium rounded-md transition-all',
              'hover:bg-neutral-100 hover:text-primary-600',
              activeMegaMenuItem === item.label && 'text-amber-500 bg-amber-50'
            )}
          >
            {item.label}
            {item.label !== 'Home' && (
              <ChevronDown size={14} className="inline ml-1" />
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
    <div className={cn('relative', className)}>
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
              className="w-full pl-10 pr-8 py-2 rounded-full bg-neutral-100 border border-neutral-200 text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              onBlur={() => setIsExpanded(false)}
            />
            <Search size={16} className="absolute left-3 text-neutral-400" />
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute right-2 p-1 hover:bg-neutral-200 rounded-full"
            >
              <X size={14} className="text-neutral-500" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsExpanded(true)}
            className="p-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
          >
            <Search size={18} className="text-neutral-600" />
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
    handleSidebarMouseEnter,
  } = useNavbar();

  const navRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { isLgUp } = useBreakpoint();

  return (
    <>
      <header 
        className={cn(
          'fixed top-0 left-0 right-0 z-[90] transition-all duration-300',
          isScrolled ? 'shadow-lg' : ''
        )}
      >
        {/* Sub NavBar - Hidden on scroll on mobile */}
        <div className={cn(
          'transition-all duration-300',
          isScrolled && isMobile ? 'h-0 overflow-hidden' : ''
        )}>
          <SubNavBar />
        </div>

        {/* Main NavBar */}
        <div 
          ref={navRef}
          onMouseLeave={handleMegaMenuMouseLeave}
          className={cn(
            'bg-white/95 backdrop-blur-md border-b border-neutral-100',
            isScrolled ? 'py-2' : 'py-3 sm:py-4'
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
                    'transition-all duration-300',
                    isScrolled ? 'w-28 sm:w-32' : 'w-32 sm:w-40'
                  )}
                />
              </Link>

              {/* Desktop Navigation */}
              {isLgUp && (
                <div className="flex-1 flex items-center justify-center">
                  <DesktopNavItems />
                </div>
              )}

              {/* Right Section */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Search - Hidden on very small screens */}
                <div className="hidden sm:block">
                  <SearchBar />
                </div>

                {/* Internet Banking Button */}
                <Button
                  variant="primary"
                  size={isMobile ? 'sm' : 'md'}
                  onMouseEnter={() => !isMobile && handleSidebarMouseEnter()}
                  onClick={() => isMobile && openMobileMenu()}
                  className="hidden sm:flex bg-blue-700 hover:bg-blue-800"
                >
                  <Lock size={16} className="mr-1 sm:mr-2" />
                  <span className="hidden md:inline">Internet Banking</span>
                  <span className="md:hidden">Login</span>
                </Button>

                {/* Mobile Menu Button */}
                <button
                  onClick={openMobileMenu}
                  className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu size={24} className="text-neutral-700" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Mega Menu - Desktop only, Fixed below navbar */}
        <AnimatePresence>
          {isLgUp && activeMegaMenuItem && activeMegaMenuItem !== 'Home' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full bg-white border-t border-neutral-100 shadow-lg"
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
      <AnimatePresence>
        {isSidebarOpen && !isMobile && (
          <InternetBankingSideBar />
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className={cn(
        'transition-all duration-300',
        isScrolled ? 'h-16 sm:h-20' : 'h-24 sm:h-32 lg:h-36'
      )} />
    </>
  );
};

export default ResponsiveNavbar;
