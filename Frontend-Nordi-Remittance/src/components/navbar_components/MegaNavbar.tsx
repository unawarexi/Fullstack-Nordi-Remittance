// ============================================================================
// MEGA NAVBAR - Fixed centered mega menu with dynamic content
// ============================================================================

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@utils/cn";
import { Button } from "@components/ui/Button";
import { useNavbar } from "@contexts/navbar-context";
import Images from "@utils/constants/Image_strings";

// ========================
// MEGA MENU CONTENT DATA
// ========================
interface MegaMenuLink {
  label: string;
  url: string;
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
}

const content: Array<{
  label: string;
  href: string;
  megaContent: MegaMenuContent | null;
}> = [
    {
      label: "Personal",
      href: "/personal",
      megaContent: {
        leftHeader: "Personal Banking",
        leftLinks: [
          { label: "Savings Accounts", url: "/personal#savings" },
          { label: "Loans", url: "/personal#loans" },
          { label: "Investments", url: "/personal#investments" },
          { label: "Credit Cards", url: "/personal#credit-cards" },
          { label: "Everyday Accounts", url: "/personal#everyday-accounts" },
          { label: "Kids & Teens", url: "/personal#kids-teens" },
          { label: "Back to School", url: "/personal#back-to-school" },
          { label: "Bancassurance", url: "/personal#bancassurance" },
          { label: "Diaspora Banking", url: "/personal#diaspora" },
          { label: "Dormant Accounts", url: "/personal#dormant" },
        ],
        rightHeader: "Personal Banking Solutions",
        rightDescription:
          "Explore a wide range of financial services for personal use.",
        imageSrc: Images.MegaNavImage1,
        imageAlt: "Personal banking",
        imageCaption: "Tailored banking solutions for individuals.",
        buttonText: "Learn More",
      },
    },
    {
      label: "Business",
      href: "/business",
      megaContent: {
        leftHeader: "Business Banking",
        leftLinks: [
          { label: "Business Accounts", url: "/business#business-accounts" },
          { label: "CBN Healthcare Sector Loan", url: "/business#cbn-healthcare" },
          { label: "E Solutions & Services", url: "/business#e-solutions" },
          { label: "Emerging Businesses", url: "/business#emerging-businesses" },
          { label: "FX Products", url: "/business#fx-products" },
          { label: "Loans for Businesses", url: "/business#business-loans" },
          { label: "Corporate Finance", url: "/business#corporate-finance" },
          { label: "Cash Management", url: "/business#cash-management" },
        ],
        rightHeader: "Business Accounts",
        rightDescription:
          "Find products and services designed for large and small scale businesses here.",
        imageSrc: Images.MegaNavImage2,
        imageAlt: "Business banking",
        imageCaption: "We offer various banking products for businesses.",
        buttonText: "Access More",
      },
    },
    {
      label: "Corporate",
      href: "/corporate",
      megaContent: {
        leftHeader: "Corporate Banking",
        leftLinks: [
          { label: "Corporate Finance", url: "/corporate#corporate-finance" },
          { label: "Cash Management", url: "/corporate#cash-management" },
          { label: "Treasury Services", url: "/corporate#treasury-services" },
          { label: "Corporate Sector", url: "/corporate#corporate-sector" },
          { label: "Distributors Forum", url: "/corporate#distributors-forum" },
          { label: "Economic Research", url: "/corporate#economic-research" },
          { label: "Exporters Forum", url: "/corporate#exporters-forum" },
          { label: "Corporate Loans", url: "/corporate#corporate-loans" },
        ],
        rightHeader: "Corporate Solutions",
        rightDescription: "Discover tailored solutions for corporate entities.",
        imageSrc: Images.MegaNavImage3,
        imageAlt: "Corporate banking",
        imageCaption: "Supporting businesses with corporate banking services.",
        buttonText: "Explore",
      },
    },
    {
      label: "Private",
      href: "/private-banking",
      megaContent: {
        leftHeader: "Private Banking",
        leftLinks: [
          { label: "Exclusive Private Banker", url: "/private-banking#private-banker" },
          { label: "Investment Management", url: "/private-banking#investment-management" },
          { label: "Our Products & Services", url: "/private-banking#products-services" },
          { label: "Black Card", url: "/private-banking#black-card" },
          { label: "About the Private Bank", url: "/private-banking#about-private-bank" },
          { label: "Sponsored Medicair", url: "/private-banking#sponsored-medicair" },
        ],
        rightHeader: "Private Banking Services",
        rightDescription: "Exclusive wealth management for high-net-worth individuals.",
        imageSrc: Images.MegaNavImage4,
        imageAlt: "Private banking",
        imageCaption: "Exclusive services for private clients.",
        buttonText: "Discover",
      },
    },
    {
      label: "Ways to Bank",
      href: "/ways-to-bank",
      megaContent: {
        leftHeader: "Ways to Bank",
        leftLinks: [
          { label: "*901# USSD Banking", url: "/ways-to-bank#ussd-banking" },
          { label: "Access Money (Cardless)", url: "/ways-to-bank#access-money" },
          { label: "American Express (AMEX) Card", url: "/ways-to-bank#amex-card" },
          { label: "ATM Services", url: "/ways-to-bank#atm-services" },
          { label: "Cards", url: "/ways-to-bank#cards" },
          { label: "FacePay", url: "/ways-to-bank#facepay" },
          { label: "Mobile Banking", url: "/ways-to-bank#mobile-banking" },
          { label: "Xtravaganza Rewards", url: "/ways-to-bank#xtravaganza" },
        ],
        rightHeader: "Multiple Banking Channels",
        rightDescription: "Explore convenient ways to bank with us.",
        imageSrc: Images.MegaNavImage2,
        imageAlt: "Ways to bank",
        imageCaption: "Flexible banking options for every need.",
        buttonText: "Explore",
      },
    },
    {
      label: "Contact Us",
      href: "/contact",
      megaContent: {
        leftHeader: "Contact Us",
        leftLinks: [
          { label: "Agency Banking Details", url: "/contact#agency-banking" },
          { label: "Biometrics Enrollment", url: "/contact#biometrics" },
          { label: "Branch & ATM Locator", url: "/contact#branch-locator" },
          { label: "Branches With Wi-Fi", url: "/contact#wifi-branches" },
          { label: "Customer Feedback", url: "/contact#customer-feedback" },
          { label: "Interactive Voice Response", url: "/contact#ivr" },
          { label: "My Access", url: "/contact#my-access" },
          { label: "We Care", url: "/contact#we-care" },
        ],
        rightHeader: "Agency Banking",
        rightDescription:
          "We are CLOSA than you think. Find an agent near you.",
        imageSrc: Images.MegaNavImage1,
        imageAlt: "Contact Us",
        imageCaption: "Reach out for assistance anytime.",
        buttonText: "Contact Us",
      },
    },
    {
      label: "I am...",
      href: "/iam",
      megaContent: null,
    },
  ];

// ========================
// ANIMATION VARIANTS
// ========================
const containerVariants = {
  hidden: { 
    opacity: 0, 
    y: -10,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.15 }
  }
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2, delay: 0.1 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.1 }
  }
};

// ========================
// MEGA NAVBAR COMPONENT
// ========================
const MegaNavbar: React.FC = () => {
  const { activeMegaMenuItem } = useNavbar();
  
  // Find active content based on hovered item
  const activeContent = content.find((item) => item.label === activeMegaMenuItem)?.megaContent;

  if (!activeContent) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "w-full rounded-2xl bg-slate-50  border-t border-neutral-100",
        "overflow-hidden"
      )}
    >
      {/* Fixed Container - Centered */}
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 px-6 py-4">
          <h3 className="text-lg lg:text-xl font-bold text-neutral-800">
            {activeContent.leftHeader}
          </h3>
        </div>

        {/* Content - Changes based on activeMegaMenuItem */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMegaMenuItem}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="px-6 py-6"
          >
            <div className="grid grid-cols-12 gap-6">
              {/* Left Section - Links */}
              <div className="col-span-12 lg:col-span-4">
                <div className="bg-neutral-50 rounded-xl p-4 lg:p-6 h-full">
                  <ul className="space-y-1">
                    {activeContent.leftLinks?.map((link, idx) => (
                      <li key={idx}>
                        <a
                          href={link.url}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm",
                            "text-neutral-600 hover:text-amber-600 hover:bg-amber-50",
                            "transition-all duration-200 group"
                          )}
                        >
                          <ChevronRight 
                            size={14} 
                            className="text-neutral-400 group-hover:text-amber-500 transition-colors" 
                          />
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Section - Description & Image */}
              <div className="col-span-12 lg:col-span-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  {/* Description */}
                  <div className="flex flex-col justify-center">
                    <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-amber-600 mb-3">
                      {activeContent.rightHeader}
                    </h2>
                    <p className="text-neutral-600 text-sm lg:text-base leading-relaxed mb-4">
                      {activeContent.rightDescription}
                    </p>
                    <Button
                      variant="primary"
                      className="bg-amber-500 hover:bg-amber-600 w-fit"
                    >
                      {activeContent.buttonText}
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>

                  {/* Image */}
                  <div className="flex flex-col items-center justify-center">
                    <motion.img
                      key={activeContent.imageSrc}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      src={activeContent.imageSrc}
                      alt={activeContent.imageAlt}
                      className="w-full max-w-[180px] lg:max-w-[220px] xl:max-w-[250px] "
                    />
                    <p className="text-center text-neutral-500 text-sm mt-3">
                      {activeContent.imageCaption}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MegaNavbar;
