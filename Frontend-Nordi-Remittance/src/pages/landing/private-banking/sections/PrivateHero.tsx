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
    <Section id="private-hero" className="relative pt-24 pb-12 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-amber-900">
      {/* Luxury Pattern Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUwIDAgTDEwMCA1MCBMNTAgMTAwIEwwIDUwIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] bg-center bg-repeat" />
      </div>

      {/* Gradient Accents */}
      <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-amber-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-amber-600/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full bg-amber-400/10 text-amber-300 text-[10px] sm:text-sm font-bold mb-4 sm:mb-6 border border-amber-500/30 uppercase tracking-widest shadow-lg">
              <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Private Banking
            </span>
            
            <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-white mb-4 sm:mb-6 leading-[1.1] tracking-tight">
              Exclusive Wealth
              <span className="block sm:inline text-amber-400"> Management</span>
            </h1>
            
            <p className="text-sm sm:text-lg text-neutral-300 mb-6 sm:mb-8 max-w-lg leading-relaxed">
              Experience banking redefined. Bespoke financial solutions, dedicated private 
              bankers, and exclusive privileges for discerning individuals and families.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 sm:mb-12">
              <Button variant="primary" className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-neutral-900 font-bold py-3 sm:py-4 px-8 shadow-xl shadow-amber-400/10">
                <Sparkles className="w-5 h-5 mr-2" />
                Become a Member
              </Button>
              <Button variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/5 py-3 sm:py-4 px-8 font-bold">
                Learn More
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 p-3 sm:p-4 rounded-xl",
                    "bg-white/5 border border-white/10",
                    "hover:bg-amber-400/5 hover:border-amber-500/30 transition-all group"
                  )}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                    <link.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-white font-bold text-[13px] sm:text-sm uppercase tracking-tight">{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-amber-400/50 group-hover:translate-x-1 transition-transform ml-auto" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Stats Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl font-bold" />
              
              <div className="flex items-center gap-4 mb-8 sm:mb-10 relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                  <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight">Private Circle</p>
                  <p className="text-[11px] sm:text-xs text-amber-400/80 font-bold uppercase tracking-widest">By Invitation Only</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10 relative z-10">
                {heroStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/5 text-center group hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <p className="text-xl sm:text-3xl font-black text-white leading-tight tabular-nums">{stat.value}</p>
                    <p className="text-[10px] sm:text-xs text-neutral-400 font-bold uppercase tracking-wider mt-1.5">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Eligibility Note */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-400/5 border border-amber-400/20 relative z-10">
                <p className="text-[12px] sm:text-sm text-neutral-300 leading-relaxed">
                  <span className="font-black text-amber-400 uppercase tracking-tighter mr-2 italic">Exclusive Eligibility:</span>
                  Minimum investable assets of <span className="text-white font-bold">$500,000</span> or annual verifiable income exceeding <span className="text-white font-bold">$200,000</span>.
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
