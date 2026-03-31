// ============================================================================
// CORPORATE BANKING HERO SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Globe,
  TrendingUp,
  Shield,
  ArrowRight,
  ChevronRight,
  Briefcase,
  Landmark,
  BarChart3,
  Users,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// STATS DATA
// ========================
const heroStats = [
  { label: "Corporate Clients", value: "500+", icon: Building2 },
  { label: "Assets Managed", value: "$15B+", icon: TrendingUp },
  { label: "Countries", value: "50+", icon: Globe },
  { label: "Dedicated RMs", value: "200+", icon: Users },
];

// ========================
// QUICK LINKS
// ========================
const quickLinks = [
  { label: "Corporate Finance", href: "#corporate-finance", icon: Landmark },
  { label: "Cash Management", href: "#corporate-cash-management", icon: Briefcase },
  { label: "Treasury Services", href: "#treasury-services", icon: BarChart3 },
  { label: "Economic Research", href: "#economic-research", icon: TrendingUp },
];

// ========================
// MAIN COMPONENT
// ========================
const CorporateHero: React.FC = () => {
  return (
    <Section id="corporate-hero" className="relative pt-24 pb-12 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] bg-center" />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-900/80 to-transparent" />

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full bg-blue-500/20 text-blue-300 text-[10px] sm:text-sm font-medium mb-4 sm:mb-6 border border-blue-500/30 uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Corporate Banking
            </span>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-[1.1]">
              Enterprise Solutions for
              <span className="text-blue-400 block sm:inline"> Industry Leaders</span>
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-300 mb-6 sm:mb-8 max-w-lg leading-relaxed">
              Tailored financial solutions designed for large corporations with complex 
              treasury, financing, and international banking needs. Partner with us to 
              drive your business forward.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
              <Button variant="primary" size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-sm sm:text-base py-2.5 sm:py-3">
                Speak to a Specialist
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 text-sm sm:text-base py-2.5 sm:py-3">
                View Solutions
              </Button>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg",
                    "bg-white/5 border border-white/10",
                    "hover:bg-white/10 hover:border-blue-500/50 transition-all group"
                  )}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <link.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-white font-medium text-[13px] sm:text-sm">{link.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 ml-auto group-hover:text-blue-400 transition-colors" />
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
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">Trusted Partner</p>
                  <p className="text-sm text-slate-300">For Global Corporations</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {heroStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
                  >
                    <div className="w-10 h-10 mx-auto rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-slate-400 mb-3">Recognized by</p>
                <div className="flex items-center gap-4 text-slate-300">
                  <span className="text-sm font-medium">Euromoney</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-sm font-medium">Global Finance</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-sm font-medium">The Banker</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default CorporateHero;
