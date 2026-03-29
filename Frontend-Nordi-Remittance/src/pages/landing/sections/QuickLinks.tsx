// ============================================================================
// QUICK LINKS SECTION - Popular services quick access
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Send,
  CreditCard,
  FileText,
  Calculator,
  Shield,
  HelpCircle,
  Building2,
  UserPlus,
  Settings,
  PiggyBank,
  Home,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";

// ========================
// QUICK LINKS DATA
// ========================
interface QuickLink {
  icon: React.ReactNode;
  title: string;
  href: string;
  description: string;
}

const quickLinks: QuickLink[] = [
  {
    icon: <Send className="w-5 h-5" />,
    title: "Transfer Money",
    href: "/transfer",
    description: "Send funds instantly",
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    title: "Pay Bills",
    href: "/bills",
    description: "Schedule payments",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: "View Statements",
    href: "/statements",
    description: "Download history",
  },
  {
    icon: <Calculator className="w-5 h-5" />,
    title: "Loan Calculator",
    href: "/calculators/loan",
    description: "Estimate payments",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Security Center",
    href: "/security",
    description: "Protect your account",
  },
  {
    icon: <HelpCircle className="w-5 h-5" />,
    title: "Help & Support",
    href: "/help",
    description: "Get assistance",
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    title: "Find Branch",
    href: "/locations",
    description: "Nearby locations",
  },
  {
    icon: <UserPlus className="w-5 h-5" />,
    title: "Open Account",
    href: "/open-account",
    description: "Join us today",
  },
  {
    icon: <Settings className="w-5 h-5" />,
    title: "Manage Cards",
    href: "/cards/manage",
    description: "Card settings",
  },
  {
    icon: <PiggyBank className="w-5 h-5" />,
    title: "Savings Goals",
    href: "/savings",
    description: "Track progress",
  },
  {
    icon: <Home className="w-5 h-5" />,
    title: "Mortgage Rates",
    href: "/mortgage",
    description: "Today's rates",
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    title: "Business Solutions",
    href: "/business",
    description: "For companies",
  },
];

// ========================
// QUICK LINK CARD COMPONENT
// ========================
interface QuickLinkCardProps {
  link: QuickLink;
  index: number;
}

const QuickLinkCard: React.FC<QuickLinkCardProps> = ({ link, index }) => (
  <motion.a
    href={link.href}
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.3, delay: index * 0.04 }}
    className={cn(
      "group flex items-center gap-3 p-4 rounded-xl",
      "bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700",
      "hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-700 transition-all duration-300"
    )}
  >
    <div
      className={cn(
        "flex-shrink-0 p-2.5 rounded-lg",
        "bg-neutral-50 dark:bg-neutral-700/50 text-neutral-600 dark:text-neutral-300",
        "group-hover:bg-indigo-50 dark:bg-indigo-900/30 group-hover:text-indigo-600 transition-colors"
      )}
    >
      {link.icon}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-neutral-900 dark:text-white text-sm group-hover:text-indigo-600 transition-colors">
        {link.title}
      </h4>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{link.description}</p>
    </div>
    <ArrowRight
      className={cn(
        "w-4 h-4 text-neutral-300",
        "group-hover:text-indigo-500 group-hover:translate-x-1 transition-all"
      )}
    />
  </motion.a>
);

// ========================
// MAIN COMPONENT
// ========================
const QuickLinks: React.FC = () => {
  return (
    <Section background="light" className="py-12 lg:py-16">
      <Container size="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-3">
            Quick Access
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
            Popular Services
          </h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Quick shortcuts to the things you do most
          </p>
        </motion.div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <QuickLinkCard key={link.title} link={link} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn(
            "mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
            "p-6 rounded-2xl",
            "bg-indigo-600"
          )}
        >
          <div>
            <h3 className="font-semibold text-white">
              Can't find what you're looking for?
            </h3>
            <p className="mt-1 text-sm text-indigo-200">
              Browse our complete list of services or contact support.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/services"
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg",
                "bg-white dark:bg-neutral-800 text-indigo-600",
                "text-sm font-medium",
                "hover:bg-indigo-50 dark:bg-indigo-900/30 transition-colors"
              )}
            >
              All Services
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/contact"
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg",
                "bg-indigo-50 dark:bg-indigo-900/300 text-white",
                "text-sm font-medium",
                "hover:bg-indigo-400 transition-colors"
              )}
            >
              Contact Us
            </a>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default QuickLinks;
