// ============================================================================
// MOBILE NAVBAR - Responsive mobile navigation with hamburger menu
// ============================================================================

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavbar } from "@contexts/navbar-context";
import {
  X,
  ChevronDown,
  ChevronRight,
  Search,
  Lock,
  Globe,
  Home,
  User,
  Briefcase,
  Building2,
  Shield,
  CreditCard,
  Phone,
} from "lucide-react";
import { Logo } from "@components/shared/Logo";
import { Button } from "@components/ui/Button";
import { ThemeToggle } from "@components/shared/ThemeToggle";
import { CountrySelect } from "@components/shared/CountrySelect";

// ========================
// NAV DATA - Synced with MegaNavbar routes
// ========================
const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: <Home size={18} /> },
  {
    label: "Personal",
    href: "/personal",
    icon: <User size={18} />,
    children: [
      { label: "Savings Accounts", href: "/personal#savings" },
      { label: "Loans", href: "/personal#loans" },
      { label: "Investments", href: "/personal#investments" },
      { label: "Credit Cards", href: "/personal#credit-cards" },
      { label: "Everyday Accounts", href: "/personal#everyday-accounts" },
      { label: "Kids & Teens", href: "/personal#kids-teens" },
      { label: "Back to School", href: "/personal#back-to-school" },
      { label: "Bancassurance", href: "/personal#bancassurance" },
      { label: "Diaspora Banking", href: "/personal#diaspora" },
      { label: "Dormant Accounts", href: "/personal#dormant" },
    ],
  },
  {
    label: "Business",
    href: "/business",
    icon: <Briefcase size={18} />,
    children: [
      { label: "Business Accounts", href: "/business#business-accounts" },
      { label: "CBN Healthcare Sector Loan", href: "/business#cbn-healthcare" },
      { label: "E Solutions & Services", href: "/business#e-solutions" },
      { label: "Emerging Businesses", href: "/business#emerging-businesses" },
      { label: "FX Products", href: "/business#fx-products" },
      { label: "Loans for Businesses", href: "/business#business-loans" },
      { label: "Corporate Finance", href: "/business#corporate-finance" },
      { label: "Cash Management", href: "/business#cash-management" },
    ],
  },
  {
    label: "Corporate",
    href: "/corporate",
    icon: <Building2 size={18} />,
    children: [
      { label: "Corporate Finance", href: "/corporate#corporate-finance" },
      { label: "Cash Management", href: "/corporate#cash-management" },
      { label: "Treasury Services", href: "/corporate#treasury-services" },
      { label: "Corporate Sector", href: "/corporate#corporate-sector" },
      { label: "Distributors Forum", href: "/corporate#distributors-forum" },
      { label: "Economic Research", href: "/corporate#economic-research" },
      { label: "Exporters Forum", href: "/corporate#exporters-forum" },
      { label: "Corporate Loans", href: "/corporate#corporate-loans" },
    ],
  },
  {
    label: "Private",
    href: "/private-banking",
    icon: <Shield size={18} />,
    children: [
      {
        label: "Exclusive Private Banker",
        href: "/private-banking#private-banker",
      },
      {
        label: "Investment Management",
        href: "/private-banking#investment-management",
      },
      {
        label: "Our Products & Services",
        href: "/private-banking#products-services",
      },
      { label: "Black Card", href: "/private-banking#black-card" },
      {
        label: "About the Private Bank",
        href: "/private-banking#about-private-bank",
      },
      {
        label: "Sponsored Medicair",
        href: "/private-banking#sponsored-medicair",
      },
    ],
  },
  {
    label: "Ways to Bank",
    href: "/ways-to-bank",
    icon: <CreditCard size={18} />,
    children: [
      { label: "*901# USSD Banking", href: "/ways-to-bank#ussd-banking" },
      { label: "Access Money (Cardless)", href: "/ways-to-bank#access-money" },
      {
        label: "American Express (AMEX) Card",
        href: "/ways-to-bank#amex-card",
      },
      { label: "ATM Services", href: "/ways-to-bank#atm-services" },
      { label: "Cards", href: "/ways-to-bank#cards" },
      { label: "FacePay", href: "/ways-to-bank#facepay" },
      { label: "Mobile Banking", href: "/ways-to-bank#mobile-banking" },
      { label: "Xtravaganza Rewards", href: "/ways-to-bank#xtravaganza" },
    ],
  },
  {
    label: "Contact Us",
    href: "/contact",
    icon: <Phone size={18} />,
    children: [
      { label: "Agency Banking Details", href: "/contact#agency-banking" },
      { label: "Biometrics Enrollment", href: "/contact#biometrics" },
      { label: "Branch & ATM Locator", href: "/contact#branch-locator" },
      { label: "Branches With Wi-Fi", href: "/contact#wifi-branches" },
      { label: "Customer Feedback", href: "/contact#customer-feedback" },
      { label: "Interactive Voice Response", href: "/contact#ivr" },
      { label: "My Access", href: "/contact#my-access" },
      { label: "We Care", href: "/contact#we-care" },
    ],
  },
];

// ========================
// ANIMATION VARIANTS
// ========================
const menuVariants = {
  closed: {
    x: "100%",
    transition: { type: "spring", stiffness: 400, damping: 40 },
  },
  open: {
    x: 0,
    transition: { type: "spring", stiffness: 400, damping: 40 },
  },
};

const itemVariants = {
  closed: { opacity: 0, x: 20 },
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05 },
  }),
};

const childrenVariants = {
  closed: { height: 0, opacity: 0 },
  open: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

// ========================
// MOBILE NAV ITEM
// ========================
interface MobileNavItemProps {
  item: NavItem;
  index: number;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ item, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { closeMobileMenu } = useNavbar();
  const hasChildren = item.children && item.children.length > 0;

  return (
    <motion.div
      custom={index}
      variants={itemVariants}
      className="border-b border-neutral-100 last:border-b-0 dark:border-neutral-800"
    >
      <div className="flex items-center">
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center justify-between px-4 py-4 text-left"
          >
            <span className="flex items-center gap-3">
              {item.icon && (
                <span className="text-primary-500">{item.icon}</span>
              )}
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {item.label}
              </span>
            </span>
            <motion.span
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown
                size={18}
                className="text-neutral-400 dark:text-neutral-500"
              />
            </motion.span>
          </button>
        ) : (
          <Link
            to={item.href}
            onClick={closeMobileMenu}
            className="flex w-full items-center gap-3 px-4 py-4"
          >
            {item.icon && <span className="text-primary-500">{item.icon}</span>}
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {item.label}
            </span>
          </Link>
        )}
      </div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            variants={childrenVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="overflow-hidden bg-neutral-50 dark:bg-neutral-800/50"
          >
            {item.children!.map((child, childIndex) => (
              <Link
                key={childIndex}
                to={child.href}
                onClick={closeMobileMenu}
                className="flex items-center gap-2 px-8 py-3 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-primary-600 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-primary-400"
              >
                <ChevronRight size={14} />
                {child.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ========================
// MOBILE NAVBAR COMPONENT
// ========================
export const MobileNavbar: React.FC = () => {
  const { isMobileMenuOpen, closeMobileMenu } = useNavbar();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
            className="fixed inset-0 z-[100] bg-[#000000]/50 backdrop-blur-sm"
          />
      )}

      {isMobileMenuOpen && (
          <motion.div
            key="panel"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed right-0 top-0 z-[101] flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl transition-colors duration-300 dark:bg-neutral-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
              <Logo size="sm" />
              <div className="flex items-center gap-2">
                <ThemeToggle size="sm" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeMobileMenu();
                  }}
                  className="z-10 cursor-pointer rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  aria-label="Close menu"
                >
                  <X
                    size={24}
                    className="text-neutral-600 dark:text-neutral-400"
                  />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="border-b border-neutral-100 p-4 dark:border-neutral-800">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full rounded-lg border-none bg-neutral-100 py-2.5 pl-10 pr-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
                />
              </div>
            </div>

            {/* Nav Items */}
            <motion.nav
              initial="closed"
              animate="open"
              className="flex-1 overflow-y-auto"
            >
              {navItems.map((item, index) => (
                <MobileNavItem key={index} item={item} index={index} />
              ))}
            </motion.nav>

            {/* Country Selector */}
            <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
              <div className="mb-4 flex items-center gap-2 relative z-50">
                <Globe
                  size={18}
                  className="text-neutral-500 dark:text-neutral-400"
                />
                <CountrySelect className="flex-1 w-full" value="US" />
              </div>

              {/* CTA Buttons */}
              <div className="space-y-2">
                <Link to="/auth/login" onClick={closeMobileMenu}>
                  <Button variant="primary" className="w-full">
                    <Lock size={16} className="mr-2" />
                    Internet Banking
                  </Button>
                </Link>
                <Link to="/auth/signup" onClick={closeMobileMenu}>
                  <Button variant="outline" className="w-full">
                    Open Account
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileNavbar;
