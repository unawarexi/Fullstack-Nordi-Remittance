// ============================================================================
// PERSONAL BANKING HERO SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, PiggyBank, CreditCard, Home } from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";
import { Link } from "react-router-dom";

// ========================
// QUICK STATS
// ========================
const stats = [
  { label: "Active Customers", value: "2.5M+", icon: Users },
  { label: "Savings Rate", value: "4.5%", icon: PiggyBank },
  { label: "Card Options", value: "15+", icon: CreditCard },
  { label: "Loan Products", value: "25+", icon: Home },
];

// ========================
// QUICK LINKS
// ========================
const quickLinks = [
  { label: "Savings Accounts", href: "#savings-accounts" },
  { label: "Personal Loans", href: "#loans" },
  { label: "Credit Cards", href: "#credit-cards" },
  { label: "Investments", href: "#investments" },
];

// ========================
// COMPONENT
// ========================
const PersonalHero: React.FC = () => {
  return (
    <Section noPadding className="relative overflow-hidden bg-indigo-900 min-h-[70vh]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <Container className="relative z-10 py-10 sm:py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 text-indigo-200 text-[10px] sm:text-xs font-medium mb-4 sm:mb-6">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Personal Banking
            </span>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 sm:mb-6">
              Banking Solutions{" "}
              <span className="text-amber-400">Tailored For You</span>
            </h1>

            <p className="text-sm sm:text-lg text-indigo-100 mb-6 sm:mb-8 max-w-xl">
              Experience personalized banking services designed around your lifestyle. 
              From savings accounts to investment portfolios, we have everything you need 
              to achieve your financial goals.
            </p>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium",
                    "bg-white/10 text-white hover:bg-white/20",
                    "transition-all duration-300"
                  )}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Button
                variant="primary"
                size="md"
                className="bg-amber-50 dark:bg-amber-900/200 hover:bg-amber-600 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base"
              >
                Open an Account
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
              <Link to="/contact">
                <Button
                  variant="outline"
                  size="md"
                  className="border-white/30 text-white hover:bg-white/10 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base"
                >
                  Talk to an Advisor
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Stats Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className={cn(
                  "p-4 sm:p-6 rounded-2xl",
                  "bg-white/10 backdrop-blur-sm border border-white/20",
                  "hover:bg-white/15 transition-all duration-300"
                )}
              >
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 mb-2 sm:mb-3" />
                <p className="text-xl sm:text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-[10px] sm:text-sm text-indigo-200">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Container>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </Section>
  );
};

export default PersonalHero;
