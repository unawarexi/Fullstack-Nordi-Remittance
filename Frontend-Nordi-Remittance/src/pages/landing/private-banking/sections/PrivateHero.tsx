// ============================================================================
// PRIVATE BANKING HERO SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Shield,
  TrendingUp,
  Globe,
  ArrowRight,
  ChevronRight,
  Users,
  Gem,
  Building2,
  Sparkles,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// STATS DATA
// ========================
const heroStats = [
  { label: "Assets Under Management", value: "$5B+", icon: TrendingUp },
  { label: "Private Clients", value: "2,500+", icon: Users },
  { label: "Investment Expertise", value: "25+ Years", icon: Shield },
  { label: "Global Markets", value: "40+", icon: Globe },
];

// ========================
// QUICK LINKS
// ========================
const quickLinks = [
  { label: "Private Banker", href: "#private-banker", icon: Users },
  { label: "Investment Management", href: "#investment-management", icon: TrendingUp },
  { label: "Black Card", href: "#black-card", icon: Gem },
  { label: "Products & Services", href: "#products-services", icon: Building2 },
];

// ========================
// MAIN COMPONENT
// ========================
const PrivateHero: React.FC = () => {
  return (
    <Section id="private-hero" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-amber-900">
      {/* Luxury Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUwIDAgTDEwMCA1MCBMNTAgMTAwIEwwIDUwIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] bg-center" />
      </div>

      {/* Gradient Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-300 text-sm font-medium mb-6 border border-amber-500/30">
              <Crown className="w-4 h-4" />
              Private Banking
            </span>
            
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
              Exclusive Wealth
              <span className="text-amber-400"> Management</span>
            </h1>
            
            <p className="text-lg text-neutral-300 mb-8 max-w-lg">
              Experience banking redefined. Bespoke financial solutions, dedicated private 
              bankers, and exclusive privileges for discerning individuals and families.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Button variant="primary" className="bg-amber-500 hover:bg-amber-600 text-neutral-900">
                <Sparkles className="w-5 h-5 mr-2" />
                Become a Member
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Learn More
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg",
                    "bg-white/5 border border-white/10",
                    "hover:bg-white/10 hover:border-amber-500/50 transition-all"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <link.icon className="w-5 h-5" />
                  </div>
                  <span className="text-white font-medium text-sm">{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-neutral-500 ml-auto" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Stats Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-white">Private Circle</p>
                  <p className="text-sm text-neutral-400">Invitation Only</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {heroStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
                  >
                    <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-neutral-500 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Eligibility Note */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-200">
                  <span className="font-semibold">Eligibility:</span> Minimum investable assets of $500,000 
                  or annual income exceeding $200,000
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default PrivateHero;
