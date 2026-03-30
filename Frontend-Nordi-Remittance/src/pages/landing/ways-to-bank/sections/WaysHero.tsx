// ============================================================================
// WAYS TO BANK HERO SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Smartphone,
  Globe,
  Zap,
  Shield,
  ArrowRight,
  ChevronRight,
  CreditCard,
  MapPin,
  QrCode,
  Phone,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// STATS DATA
// ========================
const heroStats = [
  { label: "Digital Transactions", value: "50M+", icon: Smartphone },
  { label: "ATM Network", value: "3,500+", icon: MapPin },
  { label: "Mobile Users", value: "8M+", icon: Phone },
  { label: "Uptime", value: "99.9%", icon: Zap },
];

// ========================
// QUICK LINKS
// ========================
const quickLinks = [
  { label: "*901# USSD", href: "#ussd-banking", icon: Phone },
  { label: "Mobile Banking", href: "#mobile-banking", icon: Smartphone },
  { label: "ATM Services", href: "#atm-services", icon: MapPin },
  { label: "Cards", href: "#cards", icon: CreditCard },
];

// ========================
// MAIN COMPONENT
// ========================
const WaysHero: React.FC = () => {
  return (
    <Section id="ways-hero" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIiBmaWxsPSIjZmZmIi8+PC9zdmc+')] bg-center" />
      </div>

      {/* Gradient Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium mb-6 border border-white/20">
              <Globe className="w-4 h-4" />
              Ways to Bank
            </span>
            
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
              Bank Anytime,
              <span className="text-cyan-300"> Anywhere</span>
            </h1>
            
            <p className="text-lg text-blue-100 mb-8 max-w-lg">
              Experience the future of banking with our comprehensive digital channels. 
              From USSD to mobile apps, we make banking accessible, fast, and secure.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Button variant="primary" className="bg-white dark:bg-neutral-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                Download App
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Find ATM Near You
                <MapPin className="w-5 h-5 ml-2" />
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
                    "hover:bg-white/10 hover:border-cyan-400/50 transition-all"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/10 text-cyan-300 flex items-center justify-center">
                    <link.icon className="w-5 h-5" />
                  </div>
                  <span className="text-white font-medium text-sm">{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-blue-300 ml-auto" />
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
                <div className="w-12 h-12 rounded-full bg-cyan-400 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-900" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">Digital Banking</p>
                  <p className="text-sm text-blue-200">Always at your fingertips</p>
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
                    <div className="w-10 h-10 mx-auto rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center mb-3">
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-blue-200 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-3">
                <Shield className="w-8 h-8 text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-white">Bank-Grade Security</p>
                  <p className="text-xs text-blue-200">256-bit encryption on all channels</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default WaysHero;
