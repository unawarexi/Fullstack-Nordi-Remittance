// ============================================================================
// ATM SERVICES SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Banknote,
  Receipt,
  Clock,
  ArrowRight,
  Check,
  Globe,
  Shield,
  Zap,
  CreditCard,
  Phone,
  Building2,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// ATM SERVICES LIST
// ========================
interface ATMService {
  icon: React.ReactNode;
  name: string;
  description: string;
}

const atmServices: ATMService[] = [
  { icon: <Banknote className="w-5 h-5" />, name: "Cash Withdrawal", description: "Up to ₦200,000 daily" },
  { icon: <Receipt className="w-5 h-5" />, name: "Balance Enquiry", description: "Check account balance" },
  { icon: <CreditCard className="w-5 h-5" />, name: "PIN Change", description: "Update card PIN" },
  { icon: <Phone className="w-5 h-5" />, name: "Airtime Purchase", description: "All networks" },
  { icon: <Building2 className="w-5 h-5" />, name: "Bill Payments", description: "Utilities & more" },
  { icon: <Globe className="w-5 h-5" />, name: "Fund Transfer", description: "To any bank" },
];

// ========================
// ATM NETWORK STATS
// ========================
const networkStats = [
  { value: "3,500+", label: "ATMs Nationwide" },
  { value: "36", label: "States Covered" },
  { value: "24/7", label: "Availability" },
  { value: "₦200K", label: "Daily Limit" },
];

// ========================
// ATM TYPES
// ========================
const atmTypes = [
  { name: "Standard ATM", features: ["Withdrawals", "Balance check", "PIN change"], count: "2,800+" },
  { name: "Cash Deposit ATM", features: ["Cash deposits", "All standard features", "Instant credit"], count: "500+" },
  { name: "Full-Service ATM", features: ["Cheque deposit", "Account opening", "Video banking"], count: "200+" },
];

// ========================
// MAIN COMPONENT
// ========================
const ATMServices: React.FC = () => {
  return (
    <Section id="atm-services" className="py-16 lg:py-24 bg-slate-50 dark:bg-neutral-900">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
            <MapPin className="w-4 h-4" />
            ATM Services
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Largest ATM Network in the Region
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Access cash and banking services from over 3,500 ATMs across all 
            36 states, available 24/7 for your convenience.
          </p>
        </motion.div>

        {/* Network Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-12 sm:mb-20"
        >
          {networkStats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-4 sm:p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 shadow-sm hover:shadow-xl transition-all"
            >
              <p className="text-2xl sm:text-4xl font-black text-purple-600 dark:text-purple-400 tabular-nums tracking-tighter">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-neutral-400 font-bold uppercase tracking-widest mt-2">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Services Grid */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          >
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-6">Available Services</h4>
            <div className="grid grid-cols-2 gap-4">
              {atmServices.map((service) => (
                <div
                  key={service.name}
                  className={cn(
                    "p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30",
                    "hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                    {service.icon}
                  </div>
                  <h5 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">{service.name}</h5>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{service.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ATM Types */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">ATM Types</h4>
            {atmTypes.map((type) => (
              <div
                key={type.name}
                className={cn(
                  "p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                  "hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 transition-all"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-neutral-900 dark:text-white">{type.name}</h5>
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{type.count}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {type.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Locator CTA */}
            <div className="p-6 rounded-xl bg-purple-600 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-semibold">Find Nearest ATM</h5>
                  <p className="text-xs text-purple-200">Use our locator to find ATMs near you</p>
                </div>
              </div>
              <Button variant="primary" className="w-full bg-white dark:bg-neutral-800 text-purple-600 hover:bg-purple-50">
                ATM Locator
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Tips Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 sm:mt-16 p-6 sm:p-10 rounded-3xl bg-neutral-900 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
          
          <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-10 relative z-10">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-[2rem] bg-purple-500/10 flex items-center justify-center shrink-0 shadow-lg border border-white/5">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
            </div>
            <div>
              <h4 className="text-xl sm:text-2xl font-black mb-4 uppercase tracking-tighter">ATM Security Integrity</h4>
              <ul className="grid sm:grid-cols-2 gap-3 sm:gap-4 text-[13px] sm:text-sm text-neutral-400 font-medium">
                {[
                  "Shield your PIN with tactical focus",
                  "Constant environment awareness",
                  "Refuse unsolicited assistance",
                  "Immediate suspicious activity reporting",
                  "Rapid card & cash retrieval",
                  "Daily balance forensic verification",
                ].map((tip) => (
                  <li key={tip} className="flex items-center gap-3 group">
                    <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Check className="w-3 h-3 text-purple-400 font-bold" />
                    </div>
                    <span className="group-hover:text-white transition-colors">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default ATMServices;
