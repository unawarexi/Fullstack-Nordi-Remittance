// ============================================================================
// BUSINESS BANKING HERO SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Users, TrendingUp, Shield, Briefcase } from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";
import { Link } from "react-router-dom";

// ========================
// BUSINESS STATS
// ========================
const stats = [
  { label: "Business Clients", value: "150K+", icon: Building2 },
  { label: "Annual Loans", value: "$2B+", icon: TrendingUp },
  { label: "Employees Served", value: "1M+", icon: Users },
  { label: "Industries", value: "50+", icon: Briefcase },
];

// ========================
// QUICK LINKS
// ========================
const quickLinks = [
  { label: "Business Accounts", href: "#business-accounts" },
  { label: "Business Loans", href: "#business-loans" },
  { label: "FX Products", href: "#fx-products" },
  { label: "Cash Management", href: "#cash-management" },
];

// ========================
// COMPONENT
// ========================
const BusinessHero: React.FC = () => {
  return (
    <Section noPadding className="relative overflow-hidden bg-slate-900 min-h-[70vh]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <Container className="relative z-10 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-slate-200 text-sm font-medium mb-6">
              <Building2 className="w-4 h-4" />
              Business Banking
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Empower Your Business{" "}
              <span className="text-emerald-400">With Smart Banking</span>
            </h1>

            <p className="text-lg text-slate-300 mb-8 max-w-xl">
              From startups to established enterprises, our comprehensive business 
              banking solutions provide the financial foundation your company needs 
              to grow and succeed.
            </p>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-3 mb-8">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium",
                    "bg-white/10 text-white hover:bg-white/20",
                    "transition-all duration-300"
                  )}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                variant="primary"
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                Open Business Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Link to="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Contact Sales
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
                  "p-6 rounded-2xl",
                  "bg-white/5 backdrop-blur-sm border border-white/10",
                  "hover:bg-white/10 transition-all duration-300"
                )}
              >
                <stat.icon className="w-8 h-8 text-emerald-400 mb-3" />
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
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

export default BusinessHero;
